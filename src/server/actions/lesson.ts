"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { progress, xpEvents, profiles, stats } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import type { StatKey } from "@/lib/game/xp";
import { getLesson } from "@/lib/curriculum/units";

export async function completeLesson(lessonId: string, score: number, statXp: Partial<Record<StatKey, number>>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  const lesson = getLesson(lessonId);
  if (!lesson) throw new Error("lesson not found");

  const totalXp = lesson.xpReward;
  const completed = score >= Math.ceil(lesson.exercises.length * 0.8);

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

  revalidatePath("/learn");
  revalidatePath("/me");
  revalidatePath("/leaderboard");

  return { totalXp, completed };
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
