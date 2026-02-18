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

    // 3.3 Trigger Notifications to Creator
    try {
        const meetingData = await db.query.meetings.findFirst({
            where: eq(meetings.id, meetingId),
            with: { creator: true }
        });
        const userData = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });

        if (meetingData?.creator?.pushSubscription) {
            const title = status === "ACEPTADO" ? "✅ Participación Confirmada" : "❌ Participación Rechazada";
            const body = status === "ACEPTADO" 
                ? `${userData?.name} ha confirmado su participación en la reunión de ${meetingData.clientName}`
                : `${userData?.name} ha señalado que esta ocupado al momento de la reunión de ${meetingData.clientName}`;
            
            console.log(`[Push] Sending status update to creator ${meetingData.creator.username}`);
            sendPushNotification(meetingData.creator.pushSubscription, {
                title,
                body,
                url: `/work`
            });
        }
    } catch (err) {
        console.error("[Push] Error sending status update notification:", err);
    }

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

// 5. INTELIGENCIA DE AGENDA Y CONFLICTOS
export async function getMeetingConflicts(data: {
  participantIds: string[];
  startDatetime: string;
  endDatetime: string;
  type: "VIRTUAL" | "PRESENCIAL";
}) {
  try {
    const bufferMinutes = data.type === "PRESENCIAL" ? 90 : 30;
    const start = new Date(data.startDatetime);
    const end = new Date(data.endDatetime);

    // Get all meetings for these participants on the same day
    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(start);
    dayEnd.setHours(23, 59, 59, 999);

    const relatedMeetings = await db.query.meetings.findMany({
      where: and(
        sql`${meetings.startDatetime} >= ${dayStart.toISOString()}`,
        sql`${meetings.startDatetime} <= ${dayEnd.toISOString()}`
      ),
      with: {
        participants: true
      }
    });

    const conflicts: { userId: string; userName: string; start: string; end: string; type: string }[] = [];

    // Filter meetings where any of our participants are involved
    for (const meeting of relatedMeetings) {
      const participantIdsInMeeting = [meeting.createdBy, ...(meeting.participants?.map(p => p.userId) || [])];
      const conflictParticipants = data.participantIds.filter(id => participantIdsInMeeting.includes(id));

      if (conflictParticipants.length > 0) {
        const mStart = new Date(meeting.startDatetime);
        const mEnd = new Date(meeting.endDatetime);

        // Check for buffer conflict
        // Violation if: T1_start < T2_end + buffer AND T2_start < T1_end + buffer
        const t1Start = start.getTime();
        const t1End = end.getTime();
        const t2Start = mStart.getTime();
        const t2End = mEnd.getTime();
        const bufferMs = bufferMinutes * 60 * 1000;

        if (t1Start < (t2End + bufferMs) && t2Start < (t1End + bufferMs)) {
          // It's a conflict!
          const userInConflict = await db.query.users.findFirst({
            where: inArray(users.id, conflictParticipants)
          });
          
          conflicts.push({
            userId: conflictParticipants[0],
            userName: userInConflict?.name || "Un participante",
            start: meeting.startDatetime,
            end: meeting.endDatetime,
            type: t1Start < t2End && t2Start < t1End ? "TRASLAPE" : "BUFFER"
          });
        }
      }
    }

    return conflicts;
  } catch (error) {
    console.error("Error checking conflicts:", error);
    return [];
  }
}

export async function getRecommendedSlots(data: {
  participantIds: string[];
  date: string;
  durationMinutes: number;
  type: "VIRTUAL" | "PRESENCIAL";
}) {
  try {
    const dayStart = new Date(data.date);
    dayStart.setHours(8, 0, 0, 0); // Standard working day start
    
    const possibleSlots: { start: string; end: string }[] = [];
    const bufferMinutes = data.type === "PRESENCIAL" ? 90 : 30;
    
    // Check every 30 mins slot
    for (let h = 8; h <= 17; h++) {
      for (const m of [0, 30]) {
        const start = new Date(dayStart);
        start.setHours(h, m, 0, 0);
        const end = new Date(start.getTime() + data.durationMinutes * 60 * 1000);
        
        const currentConflicts = await getMeetingConflicts({
          participantIds: data.participantIds,
          startDatetime: start.toISOString(),
          endDatetime: end.toISOString(),
          type: data.type
        });
        
        if (currentConflicts.length === 0) {
          possibleSlots.push({
            start: start.toISOString(),
            end: end.toISOString()
          });
          if (possibleSlots.length >= 5) break; // MVP: Return first 5 slots
        }
      }
      if (possibleSlots.length >= 5) break;
    }
    
    return possibleSlots;
  } catch (error) {
    console.error("Error getting recommended slots:", error);
    return [];
  }
}
