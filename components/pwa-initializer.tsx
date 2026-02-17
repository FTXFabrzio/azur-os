"use client";

import { useEffect } from "react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function PWAInitializer() {
  const { isSupported, permission, subscribeUser } = usePushNotifications();

  useEffect(() => {
    // Automatically try to subscribe if permission is already granted
    // or if we want to prompt the user (though prompting on load is usually bad UX)
    // For now, we'll just log the status.
    if (isSupported && permission === "granted") {
      subscribeUser();
    }
  }, [isSupported, permission, subscribeUser]);

  return null;
}
