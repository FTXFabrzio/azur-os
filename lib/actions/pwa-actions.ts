"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/actions/auth";

/**
 * Sends the push subscription to the backend to associate it with the current user.
 */
export async function saveSubscriptionAction(subscription: any) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const subString = JSON.stringify(subscription);
    
    await db.update(users)
      .set({ pushSubscription: subString })
      .where(eq(users.id, session.id));

    return { success: true };
  } catch (error) {
    console.error("Error saving subscription:", error);
    return { success: false, error: "Failed to save subscription" };
  }
}

/**
 * Placeholder for processing periodic sync actions or background tasks.
 */
export async function processSyncActionsAction(actions: any[]) {
  try {
    console.log("Processing sync actions on server:", actions);
    
    for (const action of actions) {
      if (action.type === 'ACCEPT_TASK') {
        // Handle accept logic
      } else if (action.type === 'REJECT_TASK') {
        // Handle reject logic
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error processing sync actions:", error);
    return { success: false };
  }
}
