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
    alert("🔄 Iniciando proceso de suscripción...");
    if (!isSupported) {
      alert("❌ Tu navegador no soporta notificaciones (PushManager o ServiceWorker faltantes).");
      return null;
    }

    try {
      alert("🔔 Solicitando permiso al navegador...");
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        alert("⚠️ Permiso denegado o cerrado. (Estado: " + result + ")");
        throw new Error("Permission not granted for notifications");
      }

      alert("📡 Conectando con Service Worker...");
      const registration = await navigator.serviceWorker.ready;
      alert("✅ Service Worker listo. Obteniendo llave pública...");
      
      // We need a VAPID public key from the backend
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing");
        alert("🚨 Error Interno: Falta la llave VAPID pública. Contacta a soporte.");
        return null;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(sub);
      
      const subObj = sub.toJSON();
      console.log("[PWA] Subscription object created:", subObj);

      // Save subscription to backend
      const response = await saveSubscriptionAction(subObj as any);
      
      if (response.success) {
        alert("✅ Notificaciones vinculadas con éxito.");
        console.log("Subscription saved to backend successfully");
      } else {
        alert("❌ Error al vincular: " + response.error);
      }
      
      return sub;
    } catch (error: any) {
      console.error("Failed to subscribe user:", error);
      alert("⚠️ Error de suscripción: " + (error.message || "Error desconocido"));
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
