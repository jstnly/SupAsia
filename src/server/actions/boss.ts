"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles, xpEvents, stats } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { evalEarnedAchievements } from "@/lib/game/achievements";

export type BossResult = {
  success: boolean;
  xpEarned: number;
  gemsEarned: number;
  newAchievements: string[];
};

export async function completeBoss(
  bossId: string,
  xpReward: number,
  gemsReward: number,
  correctCount: number,
): Promise<BossResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, xpEarned: 0, gemsEarned: 0, newAchievements: [] };

  await db.transaction(async (tx) => {
    await tx
      .update(profiles)
      .set({
        totalXp: sql`total_xp + ${xpReward}`,
        gems: sql`gems + ${gemsReward}`,
      })
      .where(eq(profiles.id, user.id));

    await tx.insert(xpEvents).values({
      userId: user.id,
      amount: xpReward,
      statKey: "thanhDieu",
      source: `boss:${bossId}`,
    });

    // Tone battles → tone mastery + listening stats
    await tx
      .insert(stats)
      .values({ userId: user.id, thanhDieu: correctCount, thinh: correctCount })
      .onConflictDoUpdate({
        target: stats.userId,
        set: {
          thanhDieu: sql`stats.thanh_dieu + ${correctCount}`,
          thinh: sql`stats.thinh + ${correctCount}`,
        },
      });
  });

  const [profile] = await db
    .select({ totalXp: profiles.totalXp, streakDays: profiles.streakDays, earnedAchievements: profiles.earnedAchievements })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  const earned = evalEarnedAchievements({
    totalXp: profile?.totalXp ?? 0,
    streakDays: profile?.streakDays ?? 0,
    completedLessonIds: new Set(),
  });
  const existing = new Set(profile?.earnedAchievements ?? []);
  const newAchievements = earned.filter((id) => !existing.has(id));

  if (newAchievements.length > 0) {
    await db
      .update(profiles)
      .set({ earnedAchievements: [...existing, ...newAchievements] })
      .where(eq(profiles.id, user.id));
  }

  revalidatePath("/me");
  revalidatePath("/learn");

  return { success: true, xpEarned: xpReward, gemsEarned: gemsReward, newAchievements };
}
