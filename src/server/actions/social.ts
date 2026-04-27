"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles, friendships } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getFriends() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const rows = await db
    .select({
      friendId: friendships.friendId,
      status: friendships.status,
      displayName: profiles.displayName,
      username: profiles.username,
      avatarVariant: profiles.avatarVariant,
      streakDays: profiles.streakDays,
      totalXp: profiles.totalXp,
      league: profiles.league,
    })
    .from(friendships)
    .innerJoin(profiles, eq(profiles.id, friendships.friendId))
    .where(eq(friendships.userId, user.id));

  return rows;
}

export async function addFriendByUsername(username: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  const cleaned = username.trim().toLowerCase();
  if (!cleaned) throw new Error("username required");

  const [target] = await db.select().from(profiles).where(eq(profiles.username, cleaned));
  if (!target) throw new Error("user not found");
  if (target.id === user.id) throw new Error("cannot add yourself");

  await db
    .insert(friendships)
    .values([
      { userId: user.id, friendId: target.id, status: "accepted" },
      { userId: target.id, friendId: user.id, status: "accepted" },
    ])
    .onConflictDoNothing();

  revalidatePath("/friends");
  return target;
}

export async function getLeaderboard(scope: "global" | "friends", window: "daily" | "weekly" | "all-time") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const since =
    window === "daily" ? sql`now() - interval '1 day'` :
    window === "weekly" ? sql`now() - interval '7 days'` :
    sql`'1970-01-01'::timestamp`;

  let userIdsFilter = sql``;
  if (scope === "friends" && user) {
    userIdsFilter = sql`AND p.id IN (
      SELECT friend_id FROM friendships WHERE user_id = ${user.id} AND status = 'accepted'
      UNION SELECT ${user.id}
    )`;
  }

  const rows = await db.execute<{
    user_id: string;
    display_name: string;
    username: string;
    avatar_variant: number;
    league: string;
    streak_days: number;
    period_xp: number;
  }>(sql`
    SELECT
      p.id AS user_id,
      p.display_name,
      p.username,
      p.avatar_variant,
      p.league,
      p.streak_days,
      COALESCE(SUM(x.amount), 0)::int AS period_xp
    FROM profiles p
    LEFT JOIN xp_events x ON x.user_id = p.id AND x.created_at >= ${since}
    WHERE 1=1 ${userIdsFilter}
    GROUP BY p.id
    ORDER BY period_xp DESC NULLS LAST
    LIMIT 50
  `);

  return rows;
}
