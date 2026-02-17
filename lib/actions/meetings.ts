"use server";

import { db } from "@/lib/db";
import { meetings, meetingParticipants } from "@/lib/db/schema";
import { eq, or, exists, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";

export async function getMeetings() {
  try {
    const session = await getSession();
    if (!session) return [];

    const isAdmin = session.username === 'fortex';

    // If admin 'fortex', return everything. 
    // Otherwise, return only meetings created by them OR where they are participants.
    return await db.query.meetings.findMany({
      where: isAdmin ? undefined : or(
        eq(meetings.createdBy, session.id),
        sql`EXISTS (SELECT 1 FROM ${meetingParticipants} WHERE ${meetingParticipants.meetingId} = ${meetings.id} AND ${meetingParticipants.userId} = ${session.id})`
      ),
      with: {
        creator: true,
        participants: true,
      },
      orderBy: (meetings, { asc }) => [asc(meetings.startDatetime)],
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return [];
  }
}

export async function createMeeting(
  meetingData: typeof meetings.$inferInsert,
  participants: string[]
) {
  try {
    const result = await db.transaction(async (tx) => {
      // 1. Crear la reunión
      await tx.insert(meetings).values(meetingData);
      
      // 2. Agregar participantes si existen
      if (participants.length > 0) {
        await tx.insert(meetingParticipants).values(
          participants.map((userId) => ({
            meetingId: meetingData.id,
            userId,
          }))
        );
      }
      return { success: true };
    });

    revalidatePath("/meetings");
    revalidatePath("/dashboard");
    return result;
  } catch (error) {
    console.error("Error creating meeting:", error);
    return { success: false, error: "Failed to create meeting" };
  }
}

export async function updateMeetingStatus(id: string, status: typeof meetings.$inferInsert.status) {
  try {
    await db.update(meetings).set({ status }).where(eq(meetings.id, id));
    revalidatePath("/meetings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating meeting status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteMeeting(id: string) {
  try {
    await db.delete(meetings).where(eq(meetings.id, id));
    revalidatePath("/meetings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return { success: false, error: "Failed to delete meeting" };
  }
}
