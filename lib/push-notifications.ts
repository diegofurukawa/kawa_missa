import { prisma } from "./prisma";

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  userIds?: string[];
}

export async function sendPushNotification(payload: NotificationPayload) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/push/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send push notification");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
}

// Example usage: Notify when new mass is created
export async function notifyNewMass(massId: string, tenantId: string) {
  try {
    // Get users from this tenant
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);

    await sendPushNotification({
      title: "Nova Missa Agendada",
      body: "Uma nova missa foi adicionada ao calendário",
      url: `/dashboard/masses/${massId}/edit`,
      userIds,
    });
  } catch (error) {
    console.error("Error notifying new mass:", error);
  }
}
