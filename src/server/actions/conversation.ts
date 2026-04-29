"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles, xpEvents, stats } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { evalEarnedAchievements } from "@/lib/game/achievements";

export type ConversationXpResult = {
  success: boolean;
  xpEarned: number;
  newAchievements: string[];
};

export async function completeConversation(
  exchangeCount: number,
  scenario: string
): Promise<ConversationXpResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, xpEarned: 0, newAchievements: [] };

  // XP scales with exchanges: 5 → 15 XP, 10 → 30 XP, 20+ → 50 XP
  const xpEarned =
    exchangeCount >= 20 ? 50 : exchangeCount >= 10 ? 30 : exchangeCount >= 5 ? 15 : 5;

  await db.transaction(async (tx) => {
    await tx
      .update(profiles)
      .set({ totalXp: sql`total_xp + ${xpEarned}` })
      .where(eq(profiles.id, user.id));

    await tx.insert(xpEvents).values({
      userId: user.id,
      amount: xpEarned,
      statKey: "khau", // conversation practice maps to speaking/oral stat
      source: `conversation:${scenario}`,
    });

    // Bump khau (speaking/oral) stat
    await tx
      .insert(stats)
      .values({ userId: user.id, khau: 1 })
      .onConflictDoUpdate({
        target: stats.userId,
        set: { khau: sql`stats.khau + 1` },
      });
  });

  // Check for new achievements
  const [profile] = await db
    .select({
      totalXp: profiles.totalXp,
      streakDays: profiles.streakDays,
      earnedAchievements: profiles.earnedAchievements,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  const [statRow] = await db
    .select()
    .from(stats)
    .where(eq(stats.userId, user.id));

  const completedIds = new Set<string>(); // conversation doesn't complete lesson IDs

  const earned = evalEarnedAchievements({
    totalXp: profile?.totalXp ?? 0,
    streakDays: profile?.streakDays ?? 0,
    completedLessonIds: completedIds,
  });

  const existing = new Set(profile?.earnedAchievements ?? []);
  const newAchievements = earned.filter((id) => !existing.has(id));

  if (newAchievements.length > 0) {
    const updated = [...existing, ...newAchievements];
    await db
      .update(profiles)
      .set({ earnedAchievements: updated })
      .where(eq(profiles.id, user.id));
  }

  revalidatePath("/me");

  return { success: true, xpEarned, newAchievements };
}
