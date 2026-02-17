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

  try {
    const data = event.data.json();
    const title = data.title || "Azur OS";
    // Branding: Powered by Fortex
    const body = `${data.body || ""}\n\nPowered by Fortex`.trim();
    const icon = "/icons/icono.png";
    const url = data.url || "/dashboard";

    const options = {
      body,
      icon,
      badge: icon,
      vibrate: [100, 50, 100],
      data: { url },
      tag: data.tag || "azur-os-push",
    };

    event.waitUntil(self.registration.showNotification(title, options as any));
  } catch (error) {
    console.error("Error displaying notification:", error);
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("Azur OS", {
        body: `${text}\n\nPowered by Fortex`,
        icon: "/icons/icono.png",
      } as any)
    );
  }
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
