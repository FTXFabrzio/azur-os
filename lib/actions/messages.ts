"use server";

import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getMeetingMessages(meetingId: string) {
  try {
    return await db.query.messages.findMany({
      where: eq(messages.meetingId, meetingId),
      with: {
        user: true,
      },
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export async function sendMessage(data: typeof messages.$inferInsert) {
  try {
    await db.insert(messages).values(data);
    revalidatePath(`/meetings/${data.meetingId}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}
