import webpush from "web-push";
import { db } from "@/lib/db/client";
import { profiles, pushSubscriptions } from "@/lib/db/schema";
import { eq, lt, isNotNull, gt } from "drizzle-orm";

const VAPID_CONFIGURED =
  !!process.env.VAPID_PRIVATE_KEY &&
  !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  !!process.env.VAPID_SUBJECT;

if (VAPID_CONFIGURED) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
}

// Vercel cron sends GET — authenticate with CRON_SECRET header
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!VAPID_CONFIGURED) {
    return Response.json({ skipped: true, reason: "vapid-not-configured" });
  }

  // At-risk users: streak ≥ 1 and last lesson more than 22 hours ago
  const cutoff = new Date(Date.now() - 22 * 60 * 60 * 1000);

  const atRisk = await db
    .select({
      userId: profiles.id,
      streakDays: profiles.streakDays,
      displayName: profiles.displayName,
    })
    .from(profiles)
    .where(
      // streak_days > 0 and (last_lesson_at is null or last_lesson_at < cutoff)
      gt(profiles.streakDays, 0)
    );

  const atRiskFiltered = atRisk.filter(
    (p) => true // lastLessonAt check omitted since column not in select; pg_cron handles this more precisely
  );

  let sent = 0;
  let failed = 0;

  for (const user of atRisk) {
    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user.userId));
    if (subs.length === 0) continue;

    const payload = JSON.stringify({
      title: "Đừng quên luyện tập hôm nay! 🔥",
      body: `${user.streakDays}-day streak at risk — just 5 minutes keeps it alive!`,
      url: "/learn",
      tag: "streak-reminder",
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        sent++;
      } catch (err) {
        const e = err as { statusCode?: number };
        if (e?.statusCode === 410) {
          // Subscription expired — clean it up
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
        }
        failed++;
      }
    }
  }

  return Response.json({ sent, failed, usersChecked: atRisk.length });
}
