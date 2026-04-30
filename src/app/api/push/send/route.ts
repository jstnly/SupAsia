import webpush from "web-push";
import { db } from "@/lib/db/client";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// VAPID config — set these env vars and run:
// npx web-push generate-vapid-keys
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

// Called by Vercel cron or manual trigger (POST /api/push/send)
// Body: { userId?: string; title: string; body: string; url?: string; tag?: string }
// Requires Authorization: Bearer <CRON_SECRET>
export async function POST(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  if (!VAPID_CONFIGURED) {
    return Response.json({ error: "VAPID keys not configured" }, { status: 503 });
  }

  const body = await req.json();
  const { userId, title, body: notifBody, url = "/learn", tag = "general" } = body;

  const subs = userId
    ? await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId))
    : await db.select().from(pushSubscriptions);

  const payload = JSON.stringify({ title, body: notifBody, url, tag });
  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      )
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  // Remove subscriptions that returned 410 Gone (unsubscribed by browser)
  const gone: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const err = r.reason as { statusCode?: number };
      if (err?.statusCode === 410) gone.push(subs[i].endpoint);
    }
  });
  if (gone.length > 0) {
    await Promise.all(
      gone.map((ep) => db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, ep)))
    );
  }

  return Response.json({ sent, failed, cleaned: gone.length });
}
