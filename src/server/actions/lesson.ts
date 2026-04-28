"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { progress, xpEvents, profiles, stats } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import type { StatKey } from "@/lib/game/xp";
import { getLesson } from "@/lib/curriculum/units";
import { xpMultiplierFor } from "@/lib/game/skill-tree";
import { evalEarnedAchievements } from "@/lib/game/achievements";

const PER_EXERCISE_BASE_XP = 5;

export async function completeLesson(lessonId: string, correctExerciseIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  const lesson = getLesson(lessonId);
  if (!lesson) throw new Error("lesson not found");

  // Look up unlocked skill nodes for XP modifiers
  const [profileRow] = await db
    .select({ unlockedSkillNodes: profiles.unlockedSkillNodes })
    .from(profiles)
    .where(eq(profiles.id, user.id));
  const unlockedNodes = profileRow?.unlockedSkillNodes ?? [];

  const correctSet = new Set(correctExerciseIds);
  const correctExercises = lesson.exercises.filter((e) => correctSet.has(e.id));
  const score = correctExercises.length;
  const completed = score >= Math.ceil(lesson.exercises.length * 0.8);

  // Compute per-stat XP from each correct exercise, applying skill-tree multipliers.
  const statXp: Partial<Record<StatKey, number>> = {};
  for (const ex of correctExercises) {
    const mul = xpMultiplierFor(ex.kind, unlockedNodes);
    const awarded = Math.round(PER_EXERCISE_BASE_XP * mul);
    statXp[ex.trainsStat] = (statXp[ex.trainsStat] ?? 0) + awarded;
  }
  const totalXp = lesson.xpReward;

  await db.transaction(async (tx) => {
    // Upsert progress row
    await tx
      .insert(progress)
      .values({
        userId: user.id,
        lessonId,
        status: completed ? "completed" : "started",
        bestScore: score,
        attempts: 1,
        completedAt: completed ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: [progress.userId, progress.lessonId],
        set: {
          status: completed ? "completed" : sql`${progress.status}`,
          bestScore: sql`GREATEST(${progress.bestScore}, ${score})`,
          attempts: sql`${progress.attempts} + 1`,
          completedAt: completed ? new Date() : sql`${progress.completedAt}`,
        },
      });

    // Insert overall xp event
    await tx.insert(xpEvents).values({
      userId: user.id,
      amount: totalXp,
      statKey: null,
      source: `lesson:${lessonId}`,
    });

    // Insert per-stat xp events + bump stats columns
    const statUpdates: Record<string, unknown> = {};
    for (const [key, amount] of Object.entries(statXp) as [StatKey, number][]) {
      if (!amount) continue;
      await tx.insert(xpEvents).values({
        userId: user.id,
        amount,
        statKey: key,
        source: `lesson:${lessonId}`,
      });
      // Map StatKey to db column name
      const col =
        key === "tuVung" ? "tu_vung" :
        key === "thanhDieu" ? "thanh_dieu" :
        key === "nguPhap" ? "ngu_phap" : key;
      statUpdates[col] = sql.raw(`${col} + ${amount}`);
    }
    if (Object.keys(statUpdates).length > 0) {
      await tx
        .update(stats)
        .set(statUpdates as never)
        .where(eq(stats.userId, user.id));
    }

    // Bump profile total xp + last-lesson + streak
    await tx
      .update(profiles)
      .set({
        totalXp: sql`${profiles.totalXp} + ${totalXp}`,
        lastLessonAt: new Date(),
        streakDays: sql`CASE
          WHEN ${profiles.lastLessonAt} IS NULL THEN 1
          WHEN ${profiles.lastLessonAt}::date = CURRENT_DATE THEN ${profiles.streakDays}
          WHEN ${profiles.lastLessonAt}::date = CURRENT_DATE - 1 THEN ${profiles.streakDays} + 1
          ELSE 1 END`,
      })
      .where(eq(profiles.id, user.id));
  });

  // Evaluate achievements against the post-update state. Diff against the user's prior
  // earnedAchievements list and append any newly-earned ones.
  const newlyEarned: string[] = [];
  try {
    const [post] = await db
      .select({
        totalXp: profiles.totalXp,
        streakDays: profiles.streakDays,
        earned: profiles.earnedAchievements,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id));
    const completedRows = await db
      .select({ lessonId: progress.lessonId })
      .from(progress)
      .where(and(eq(progress.userId, user.id), eq(progress.status, "completed")));
    const ctx = {
      totalXp: post?.totalXp ?? 0,
      streakDays: post?.streakDays ?? 0,
      completedLessonIds: new Set(completedRows.map((r) => r.lessonId)),
    };
    const allEarned = evalEarnedAchievements(ctx);
    const previously = new Set(post?.earned ?? []);
    for (const id of allEarned) if (!previously.has(id)) newlyEarned.push(id);
    if (newlyEarned.length > 0) {
      await db
        .update(profiles)
        .set({
          earnedAchievements: sql`${profiles.earnedAchievements} || ${JSON.stringify(newlyEarned)}::jsonb`,
        })
        .where(eq(profiles.id, user.id));
    }
  } catch (e) {
    console.error("achievement check failed", e);
  }

  revalidatePath("/learn");
  revalidatePath("/me");
  revalidatePath("/leaderboard");

  return { totalXp, completed, statXp, score, newlyEarned };
}

export async function getProfileWithStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRow] = await db.select().from(profiles).where(eq(profiles.id, user.id));
  const [statsRow] = await db.select().from(stats).where(eq(stats.userId, user.id));
  const completedRows = await db
    .select({ lessonId: progress.lessonId })
    .from(progress)
    .where(and(eq(progress.userId, user.id), eq(progress.status, "completed")));

  return {
    profile: profileRow ?? null,
    stats: statsRow ?? null,
    completedLessonIds: completedRows.map((r) => r.lessonId),
  };
}
