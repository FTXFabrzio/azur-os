
// Azur OS Manual Service Worker

const CACHE_NAME = "azur-os-cache-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Simple network-first strategy for basic offline support
  // This is a minimal implementation to ensure the app works.
  // Full caching is not implemented here to avoid conflicts.
});

// Push Notification Listener (CRITICAL)
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

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error("Error displaying notification:", error);
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("Azur OS", {
        body: `${text}\n\nPowered by Fortex`,
        icon: "/icons/icono.png",
      })
    );
  }
});

// Notification Click Listener
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Try to focus existing window
      for (const client of windowClients) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // If no window found, open new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
