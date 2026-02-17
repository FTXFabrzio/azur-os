"use client";

import { useEffect } from "react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function PWAInitializer() {
  const { isSupported, permission, subscribeUser } = usePushNotifications();

  useEffect(() => {
    // Proactively sync subscription when the app load
    if (isSupported && permission === "granted") {
      subscribeUser();
    }
  }, [isSupported, permission, subscribeUser]);

  return null;
}
