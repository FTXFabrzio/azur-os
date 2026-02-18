/// <reference lib="webworker" />
import { installSerwist } from "@serwist/sw";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (string | PrecacheEntry)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
});

// Push Notification Listener
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const promiseChain = (async () => {
    try {
      const data = event.data?.json();
      const now = Date.now();
      const serverTime = data.createdAt || now;
      const latency = now - serverTime;

      const title = data.title || "Azur OS";
      const body = `${data.body || ""}\n\nPowered by Fortex`.trim();
      const icon = "/icons/icono.ico";
      const url = data.url || "/dashboard";

      const showNotificationPromise = self.registration.showNotification(title, {
        body,
        icon,
        badge: icon,
        vibrate: [100, 50, 100],
        data: { 
          url,
          latency,
          receivedAt: now,
          serverTime
        },
        tag: data.tag || "azur-os-push",
      } as any);

      // Log latency to the main thread if possible
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: "PUSH_LATENCY",
          latency,
          serverTime,
          receivedAt: now
        });
      });

      return showNotificationPromise;
    } catch (error) {
      console.error("Error displaying notification:", error);
      return self.registration.showNotification("Azur OS", {
        body: "Nueva actualización\n\nPowered by Fortex",
        icon: "/icons/icono.ico",
      } as any);
    }
  })();

  event.waitUntil(promiseChain);
});

// Notification Click Listener
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data as any)?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && "focus" in client) {
          return (client as any).focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background Sync Listener
self.addEventListener("sync", (event: any) => {
  if (event.tag === "sync-actions") {
    // Background sync triggered: sync-actions
    event.waitUntil(processPendingActions());
  }
});

async function processPendingActions() {
  // We cannot easily use the IDB helper here if it uses client-side crypto or other browser APIs
  // but openDB from 'idb' works in workers.
  // For simplicity in this step, we'll try to reach the server.
  // In a real PWA, you'd iterate through the 'pending-actions' store in IDB.
  
  try {
    // This is a placeholder for the actual sync logic.
    // Usually you'd fetch the items from IDB and send them to an endpoint.
    // Syncing pending actions...
  } catch (error) {
    console.error("Sync failed:", error);
  }
}
