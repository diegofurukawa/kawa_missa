"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function PushNotificationManager() {
  const { data: session } = useSession();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const subscribeToPush = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        alert("Notificações bloqueadas. Habilite nas configurações do navegador.");
        setIsLoading(false);
        return;
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      // Send subscription to server
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        setIsSubscribed(true);
        alert("Notificações ativadas com sucesso!");
      } else {
        throw new Error("Failed to save subscription");
      }
    } catch (error) {
      console.error("Error subscribing to push:", error);
      alert("Erro ao ativar notificações");
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from server
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        setIsSubscribed(false);
        alert("Notificações desativadas");
      }
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      alert("Erro ao desativar notificações");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session || !isSupported) {
    return null;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-2">Notificações Push</h3>
      <p className="text-sm text-gray-600 mb-4">
        Receba notificações sobre novas missas e atualizações
      </p>
      {isSubscribed ? (
        <button
          onClick={unsubscribeFromPush}
          disabled={isLoading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processando..." : "Desativar Notificações"}
        </button>
      ) : (
        <button
          onClick={subscribeToPush}
          disabled={isLoading}
          className="bg-[#6c7948] text-white px-4 py-2 rounded hover:bg-[#5d6541] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processando..." : "Ativar Notificações"}
        </button>
      )}
    </div>
  );
}

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
