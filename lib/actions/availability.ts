"use server";

import { db } from "@/lib/db";
import { availabilityRules } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

export async function upsertAvailabilityRule(data: typeof availabilityRules.$inferInsert) {
  try {
    // En SQLite/Turso podemos usar el UNIQUE index para hacer upsert
    await db.insert(availabilityRules)
      .values(data)
      .onConflictDoUpdate({
        target: [availabilityRules.userId, availabilityRules.dayOfWeek, availabilityRules.startTime],
        set: { endTime: data.endTime }
      });
    
    revalidatePath("/profile/availability");
    return { success: true };
  } catch (error) {
    console.error("Error saving availability rule:", error);
    return { success: false, error: "Failed to save rule" };
  }
}

export async function deleteAvailabilityRule(id: string) {
  try {
    await db.delete(availabilityRules).where(eq(availabilityRules.id, id));
    revalidatePath("/profile/availability");
    return { success: true };
  } catch (error) {
    console.error("Error deleting rule:", error);
    return { success: false, error: "Failed to delete rule" };
  }
}
