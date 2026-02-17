"use client";

import { useState, useEffect, useCallback } from "react";
import { saveSubscriptionAction } from "@/lib/actions/pwa-actions";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const subscribeUser = useCallback(async () => {
    if (!isSupported) return null;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        throw new Error("Permission not granted for notifications");
      }

      const registration = await navigator.serviceWorker.ready;
      
      // We need a VAPID public key from the backend
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing");
        // For development, we might use a dummy or just return the permission state
        return null;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(sub);
      
      // Save subscription to backend
      const response = await saveSubscriptionAction(sub.toJSON() as any);
      if (response.success) {
        console.log("Subscription saved to backend successfully");
      }
      
      return sub;
    } catch (error) {
      console.error("Failed to subscribe user:", error);
      return null;
    }
  }, [isSupported]);

  const unsubscribeUser = useCallback(async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      // Here you would notify your backend to remove the subscription
    } catch (error) {
      console.error("Failed to unsubscribe user:", error);
    }
  }, [subscription]);

  return {
    permission,
    subscription,
    isSupported,
    subscribeUser,
    unsubscribeUser,
  };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
