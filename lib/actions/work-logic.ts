"use server";

import { db } from "@/lib/db";
import { meetings, meetingParticipants, messages, users, availabilityRules } from "@/lib/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { sendPushNotification } from "@/lib/push-notifications";

// 1. CREAR REUNIÓN CON TRANSACCIÓN
export async function createMeetingTransaction(data: {
  clientName: string;
  address: string;
  description?: string;
  startDatetime: string;
  endDatetime: string;
  type: "VIRTUAL" | "PRESENCIAL";
  createdBy: string;
  participantIds: string[];
}) {
  try {
    const meetingId = uuidv4();

    await db.transaction(async (tx) => {
      // 1.1 Insertar en 'meetings'
      await tx.insert(meetings).values({
        id: meetingId,
        clientName: data.clientName,
        address: data.address,
        description: data.description,
        startDatetime: data.startDatetime,
        endDatetime: data.endDatetime,
        type: data.type,
        createdBy: data.createdBy,
        status: "PENDIENTE",
      });

      // 1.2 Insertar en 'meeting_participants' con status 'ESPERANDO'
      if (data.participantIds.length > 0) {
        await tx.insert(meetingParticipants).values(
          data.participantIds.map((userId) => ({
            meetingId,
            userId,
            status: "ESPERANDO" as const,
          }))
        );
      }

      // 1.3 Insertar primer mensaje 'system'
      await tx.insert(messages).values({
        id: uuidv4(),
        meetingId,
        userId: data.createdBy,
        content: `📅 Reunión creada por el sistema para el cliente ${data.clientName}.`,
        type: "system",
      });
    });

    // 1.4 Trigger Notifications in background (non-blocking)
    if (data.participantIds.length > 0) {
      console.log(`[Push] Triggering notifications for ${data.participantIds.length} participants`);
      db.query.users.findMany({
        where: inArray(users.id, data.participantIds)
      }).then(participants => {
        console.log(`[Push] Found ${participants.length} users with subscriptions`);
        participants.forEach(p => {
          if (p.pushSubscription) {
            console.log(`[Push] Sending to ${p.name} (${p.username})`);
            sendPushNotification(p.pushSubscription, {
              title: "🚀 Nueva Reunión",
              body: `Has sido invitado a una reunión para ${data.clientName}.`,
              url: `/work`
            });
          } else {
            console.log(`[Push] User ${p.username} has no active subscription`);
          }
        });
      }).catch(err => {
        console.error("[Push] Error fetching participants for notifications:", err);
      });
    }

    revalidatePath("/work");
    revalidatePath("/dashboard");
    return { success: true, meetingId };
  } catch (error) {
    console.error("Error in createMeetingTransaction:", error);
    return { success: false, error: "Error al crear la reunión" };
  }
}

// 1.5 DELETE REUNIÓN
export async function deleteMeetingAction(meetingId: string) {
  try {
    await db.delete(meetings).where(eq(meetings.id, meetingId));
    revalidatePath("/work");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return { success: false, error: "Error al eliminar la reunión" };
  }
}

// 2. GESTIÓN DE DISPONIBILIDAD
export async function getUserAvailability(userId: string) {
  try {
    return await db.query.availabilityRules.findMany({
      where: eq(availabilityRules.userId, userId),
      orderBy: (rules, { asc }) => [asc(rules.dayOfWeek), asc(rules.startTime)],
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return [];
  }
}

export async function updateAllAvailabilityRules(userId: string, rules: { dayOfWeek: number; startTime: string; endTime: string }[]) {
  try {
    await db.transaction(async (tx) => {
      // Limpiar reglas anteriores para este usuario
      await tx.delete(availabilityRules).where(eq(availabilityRules.userId, userId));
      
      if (rules.length > 0) {
        await tx.insert(availabilityRules).values(
          rules.map(r => ({
            id: uuidv4(),
            userId,
            dayOfWeek: r.dayOfWeek,
            startTime: r.startTime,
            endTime: r.endTime
          }))
        );
      }
    });
    
    revalidatePath("/work");
    return { success: true };
  } catch (error) {
    console.error("Error updating availability rules:", error);
    return { success: false, error: "Error al actualizar disponibilidad" };
  }
}

// 3. DETALLE Y CONFIRMACIÓN
export async function getMeetingWithDetails(meetingId: string) {
  try {
    const meeting = await db.query.meetings.findFirst({
      where: eq(meetings.id, meetingId),
      with: {
        participants: {
          with: {
            user: true
          }
        },
        messages: {
          with: {
            user: true
          },
          orderBy: (msg, { asc }) => [asc(msg.createdAt)]
        }
      }
    });
    return meeting;
  } catch (error) {
    console.error("Error fetching meeting details:", error);
    return null;
  }
}

export async function updateParticipantStatus(meetingId: string, userId: string, status: "ACEPTADO" | "RECHAZADO") {
  try {
    await db.transaction(async (tx) => {
      // 3.1 Actualizar status del participante
      await tx.update(meetingParticipants)
        .set({ status })
        .where(and(
          eq(meetingParticipants.meetingId, meetingId),
          eq(meetingParticipants.userId, userId)
        ));

      // 3.2 Si es ACEPTADO, verificar si todos están en ACEPTADO
      if (status === "ACEPTADO") {
        const participants = await tx.select().from(meetingParticipants).where(eq(meetingParticipants.meetingId, meetingId));
        const allAccepted = participants.every(p => p.status === "ACEPTADO");
        
        if (allAccepted) {
          await tx.update(meetings).set({ status: "CONFIRMADA" }).where(eq(meetings.id, meetingId));
          
          // Mensaje del sistema
          await tx.insert(messages).values({
            id: uuidv4(),
            meetingId,
            content: "✅ Todos los participantes han aceptado. Reunión CONFIRMADA.",
            type: "system"
          });
        }
      } else if (status === "RECHAZADO") {
        await tx.update(meetings).set({ status: "CANCELADA" }).where(eq(meetings.id, meetingId));
        
        // Mensaje del sistema
        await tx.insert(messages).values({
          id: uuidv4(),
          meetingId,
          content: "❌ Un participante ha rechazado la invitación. Reunión CANCELADA.",
          type: "system"
        });
      }
    });

    revalidatePath("/work");
    return { success: true };
  } catch (error) {
    console.error("Error updating participant status:", error);
    return { success: false, error: "Error al actualizar estado" };
  }
}

// 4. CHAT SIMPLE
export async function sendChatMessage(meetingId: string, userId: string, content: string) {
  try {
    await db.insert(messages).values({
      id: uuidv4(),
      meetingId,
      userId,
      content,
      type: "text"
    });
    
    revalidatePath("/work");
    return { success: true };
  } catch (error) {
    console.error("Error sending chat message:", error);
    return { success: false, error: "Error al enviar mensaje" };
  }
}
