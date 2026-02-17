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
    console.log("[PWA] saveSubscriptionAction called");
    const session = await getSession();
    
    if (!session?.id) {
      console.warn("[PWA] No session found, cannot save subscription");
      return { success: false, error: "Unauthorized" };
    }

    console.log("[PWA] Saving subscription for user:", session.username, "(", session.id, ")");
    
    const subString = typeof subscription === 'string' ? subscription : JSON.stringify(subscription);
    
    const result = await db.update(users)
      .set({ pushSubscription: subString })
      .where(eq(users.id, session.id))
      .returning();

    if (result.length > 0) {
      console.log("[PWA] Successfully updated subscription in DB for", session.username);
      return { success: true };
    } else {
      console.error("[PWA] DB update returned 0 rows for user ID:", session.id);
      return { success: false, error: "User not found in DB" };
    }
  } catch (error: any) {
    console.error("[PWA] Error saving subscription:", error);
    return { success: false, error: error.message || "Failed to save subscription" };
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
