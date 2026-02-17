"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/actions/auth";
import webwebPush from "web-push";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

if (vapidPublicKey && vapidPrivateKey) {
  webwebPush.setVapidDetails(
    "mailto:soporte@azuros.com",
    vapidPublicKey,
    vapidPrivateKey
  );
} else {
  console.warn("VAPID keys are missing in environment variables");
}

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
    
    // Validate subscription object
    if (!subString || subString === "{}" || subString.length < 50) {
       console.error("[PWA] Invalid subscription payload:", subString);
       return { success: false, error: "Invalid subscription payload" };
    }

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

// DEBUG TOOLS
export async function sendTestNotificationAction() {
  try {
    const session = await getSession();
    if (!session?.id) return { success: false, error: "Unauthorized" };

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.id),
      columns: { pushSubscription: true }
    });

    if (!user?.pushSubscription) {
      return { success: false, error: "No subscription found in DB" };
    }

    const subscription = JSON.parse(user.pushSubscription);
    
    await webwebPush.sendNotification(subscription, JSON.stringify({
      title: "🔔 Test de Notificación",
      body: "Si ves esto, el sistema funciona correctamente.",
      url: "/work"
    }));

    return { success: true };
  } catch (error: any) {
    console.error("Test Notification Failed:", error);
    return { success: false, error: error.message || "Failed to send" };
  }
}

export async function getSubscriptionStatusAction() {
  try {
    const session = await getSession();
    if (!session?.id) return { hasSubscription: false };

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.id),
      columns: { pushSubscription: true }
    });

    return { 
      hasSubscription: !!user?.pushSubscription, 
      preview: user?.pushSubscription ? user.pushSubscription.substring(0, 50) + "..." : null 
    };
  } catch (error) {
    console.error("Error checking status:", error);
    return { hasSubscription: false };
  }
}
