import webpush from "web-push";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:soporte@azur-os.com",
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function sendPushNotification(subscription: string, payload: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}) {
  try {
    const sub = JSON.parse(subscription);
    
    // Optimization: Add server timestamp for latency tracking
    // Optimization: Lightweight payload
    const lightweightPayload = {
      title: payload.title,
      body: payload.body,
      url: payload.url,
      tag: payload.tag,
      createdAt: Date.now(),
    };

    await webpush.sendNotification(sub, JSON.stringify(lightweightPayload), {
      headers: {
        'Urgency': 'high'
      }
    });

    return { success: true };
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log("Subscription expired or no longer valid.");
      return { success: false, error: "EXPIRED" };
    }
    console.error("Error sending push notification:", error);
    return { success: false, error: error.message };
  }
}
