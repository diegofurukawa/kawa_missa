import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

export async function POST(request: NextRequest) {
  // Configure web-push on demand (not at module load time)
  if (process.env.VAPID_EMAIL && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body, url, userIds } = await request.json();

    // Get subscriptions for target users
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: {
          in: userIds || [session.user.id],
        },
      },
    });

    const payload = JSON.stringify({
      title,
      body,
      url: url || "/dashboard",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
    });

    // Send notifications
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        )
      )
    );

    // Remove invalid subscriptions
    const failedIndexes = results
      .map((result, index) => (result.status === "rejected" ? index : -1))
      .filter((index) => index !== -1);

    if (failedIndexes.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: {
          id: {
            in: failedIndexes.map((i) => subscriptions[i].id),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      sent: results.filter((r) => r.status === "fulfilled").length,
      failed: failedIndexes.length,
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
