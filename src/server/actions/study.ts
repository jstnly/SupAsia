"use server";

import { eq, and, lte, isNotNull, sql, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { progress } from "@/lib/db/schema";
import {
  applyRating,
  classifyStage,
  INITIAL_SRS,
  type ReviewRating,
  type SrsState,
} from "@/lib/study/srs";

/**
 * Record an Easy/Good/Hard/Again rating for a completed lesson and update its
 * SRS schedule. Idempotent — calling without a rating defaults to "Good".
 */
export async function recordReview(lessonId: string, rating: ReviewRating = 3) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "not authenticated" };

  // Read existing SRS state (if any)
  const [row] = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, user.id), eq(progress.lessonId, lessonId)));

  const prev: SrsState = row
    ? {
        intervalDays: row.intervalDays,
        easeFactor: row.easeFactor / 100,
        reviews: row.reviews,
        lapses: row.lapses,
      }
    : INITIAL_SRS;

  const { next, nextReviewAt } = applyRating(prev, rating);
  const now = new Date();

  if (row) {
    await db
      .update(progress)
      .set({
        intervalDays: next.intervalDays,
        easeFactor: Math.round(next.easeFactor * 100),
        reviews: next.reviews,
        lapses: next.lapses,
        nextReviewAt,
        lastReviewedAt: now,
      })
      .where(and(eq(progress.userId, user.id), eq(progress.lessonId, lessonId)));
  } else {
    // Edge case: rating before completion was recorded. Insert a started row
    // so the schedule still sticks.
    await db.insert(progress).values({
      userId: user.id,
      lessonId,
      status: "started",
      intervalDays: next.intervalDays,
      easeFactor: Math.round(next.easeFactor * 100),
      reviews: next.reviews,
      lapses: next.lapses,
      nextReviewAt,
      lastReviewedAt: now,
    });
  }

  revalidatePath("/learn");
  revalidatePath("/review");

  return {
    ok: true as const,
    nextReviewAt: nextReviewAt.toISOString(),
    intervalDays: next.intervalDays,
    stage: classifyStage(next),
  };
}

export type DueReview = {
  lessonId: string;
  nextReviewAt: string | null;
  intervalDays: number;
  reviews: number;
  lapses: number;
  lastReviewedAt: string | null;
  stage: ReturnType<typeof classifyStage>;
};

/** Return up to `limit` lessons whose nextReviewAt is past, oldest first. */
export async function getDueReviews(limit = 50): Promise<DueReview[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const now = new Date();
  const rows = await db
    .select()
    .from(progress)
    .where(
      and(
        eq(progress.userId, user.id),
        isNotNull(progress.nextReviewAt),
        lte(progress.nextReviewAt, now),
      ),
    )
    .orderBy(asc(progress.nextReviewAt))
    .limit(limit);

  return rows.map((r) => ({
    lessonId: r.lessonId,
    nextReviewAt: r.nextReviewAt ? r.nextReviewAt.toISOString() : null,
    intervalDays: r.intervalDays,
    reviews: r.reviews,
    lapses: r.lapses,
    lastReviewedAt: r.lastReviewedAt ? r.lastReviewedAt.toISOString() : null,
    stage: classifyStage({
      intervalDays: r.intervalDays,
      easeFactor: r.easeFactor / 100,
      reviews: r.reviews,
      lapses: r.lapses,
    }),
  }));
}

export type ReviewSummary = {
  dueNow: number;
  dueToday: number;
  learning: number;
  reviewing: number;
  mastered: number;
};

/** Aggregate counts for review dashboards. */
export async function getReviewSummary(): Promise<ReviewSummary> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { dueNow: 0, dueToday: 0, learning: 0, reviewing: 0, mastered: 0 };

  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const [{ dueNow, dueToday, learning, reviewing, mastered }] = await db
    .select({
      dueNow: sql<number>`COUNT(*) FILTER (WHERE ${progress.nextReviewAt} IS NOT NULL AND ${progress.nextReviewAt} <= ${now})::int`,
      dueToday: sql<number>`COUNT(*) FILTER (WHERE ${progress.nextReviewAt} IS NOT NULL AND ${progress.nextReviewAt} <= ${endOfDay})::int`,
      learning: sql<number>`COUNT(*) FILTER (WHERE ${progress.reviews} BETWEEN 1 AND 2)::int`,
      reviewing: sql<number>`COUNT(*) FILTER (WHERE ${progress.reviews} > 2 AND (${progress.intervalDays} < 30 OR ${progress.lapses} > 0))::int`,
      mastered: sql<number>`COUNT(*) FILTER (WHERE ${progress.reviews} > 2 AND ${progress.intervalDays} >= 30 AND ${progress.lapses} = 0)::int`,
    })
    .from(progress)
    .where(eq(progress.userId, user.id));

  return { dueNow, dueToday, learning, reviewing, mastered };
}
