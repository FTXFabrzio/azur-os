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
        registration.pushManager.getSubscription().then(async (sub) => {
          setSubscription(sub);
          // If we have a subscription on load, ensure it's synced with backend
          // This fixes the "Active but NULL in DB" issue
          if (sub) {
             console.log("[PWA] Found existing subscription on load, syncing...");
             await saveSubscriptionAction(sub.toJSON() as any);
          }
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

      let sub = await registration.pushManager.getSubscription();
      
      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      } else {
        alert("ℹ️ Usando suscripción existente del navegador...");
      }

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

  const forceSync = useCallback(async () => {
    if (!subscription) {
      alert("❌ No hay suscripción activa en el navegador para sincronizar.");
      return;
    }
    alert("🔄 Forzando sincronización con servidor...");
    try {
      const response = await saveSubscriptionAction(subscription.toJSON() as any);
      if (response.success) {
        alert("✅ Sincronización Éxitosa. Ahora verifica el estado en BD.");
      } else {
        alert("❌ Error al sincronizar: " + response.error);
      }
    } catch (err: any) {
      alert("❌ Error de red: " + err.message);
    }
  }, [subscription]);

  const hardReset = useCallback(async () => {
    if (!subscription) return;
    try {
      alert("🗑️ Eliminando suscripción del navegador...");
      await subscription.unsubscribe();
      setSubscription(null);
      alert("✅ Reset completo. Ahora presiona 'Activar' nuevamente.");
      window.location.reload();
    } catch (err: any) {
      alert("❌ Error al resetear: " + err.message);
    }
  }, [subscription]);

  return {
    permission,
    subscription,
    isSupported,
    subscribeUser,
    unsubscribeUser,
    forceSync,
    hardReset
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
