"use client";

import { useEffect } from "react";

export function PWAInitializer() {

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox === undefined
    ) {
      const wb = window.workbox;
      
      // Explicit registration logic for Serwist
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });
          console.log("✅ Service Worker registered with scope:", registration.scope);
        } catch (error) {
          console.error("❌ Service Worker registration failed:", error);
        }
      };

      registerSW();
    }
  }, []);

  return null;
}
