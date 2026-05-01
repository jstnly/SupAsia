/**
 * Spaced Repetition System — SM-2-lite scheduler.
 *
 * Based on the SuperMemo SM-2 algorithm, the foundation of Anki and most modern
 * SRS apps. Vastly more efficient than re-doing lessons in order:
 *
 * - Items you know well are pushed further out (less wasted time)
 * - Items you struggle with come back sooner (catch them while still learnable)
 * - Reviews are scheduled at the moment of peak forgetting (Ebbinghaus curve)
 *
 * One unit ⇒ one lesson. Learners can also get per-vocab SRS later by extending
 * this engine to a separate `vocab_reviews` table; the math is identical.
 *
 * Ratings (Anki conventions):
 *   1 = Again — got it wrong, restart from short interval
 *   2 = Hard  — got it right but barely; small ease drop, slight interval growth
 *   3 = Good  — solid recall (default); ease unchanged, interval × ease
 *   4 = Easy  — trivial; ease bump, interval × ease × easyBonus
 */

export type ReviewRating = 1 | 2 | 3 | 4;

export const REVIEW_RATINGS: { value: ReviewRating; label: string; description: string; color: string }[] = [
  { value: 1, label: "Again", description: "Forgot it — show me again soon", color: "var(--color-tone-sac)" },
  { value: 2, label: "Hard",  description: "Got it, but barely",              color: "var(--color-tone-hoi)" },
  { value: 3, label: "Good",  description: "Solid recall",                    color: "var(--color-jade-500)" },
  { value: 4, label: "Easy",  description: "Trivial — push it way out",       color: "var(--color-tone-huyen)" },
];

export type SrsState = {
  /** Days until next review (0 = same-day, 1 = tomorrow, etc.) */
  intervalDays: number;
  /** Multiplier applied each successful review. Range 1.3..2.7. */
  easeFactor: number;
  /** Total successful reviews (consecutive non-Again). */
  reviews: number;
  /** Times the item was forgotten and reset. */
  lapses: number;
};

/** Default state for an item that's never been reviewed. */
export const INITIAL_SRS: SrsState = {
  intervalDays: 0,
  easeFactor: 2.5,
  reviews: 0,
  lapses: 0,
};

const MIN_EASE = 1.3;
const MAX_EASE = 2.7;
const EASY_BONUS = 1.3;
/** First few intervals follow a fixed ramp before ease kicks in. */
const LEARNING_STEPS_DAYS = [1, 3];

/**
 * Apply a rating to existing SRS state. Pure — returns new state and the
 * absolute next-review date.
 */
export function applyRating(prev: SrsState, rating: ReviewRating, now: Date = new Date()): {
  next: SrsState;
  nextReviewAt: Date;
} {
  let { intervalDays, easeFactor, reviews, lapses } = prev;

  if (rating === 1) {
    // Lapse: drop back to a short re-learning step, slightly reduce ease.
    lapses += 1;
    reviews = 0;
    intervalDays = LEARNING_STEPS_DAYS[0];
    easeFactor = clamp(easeFactor - 0.2, MIN_EASE, MAX_EASE);
  } else if (reviews < LEARNING_STEPS_DAYS.length) {
    // Still in learning phase — follow fixed steps regardless of ease.
    intervalDays = LEARNING_STEPS_DAYS[reviews] ?? LEARNING_STEPS_DAYS[LEARNING_STEPS_DAYS.length - 1];
    reviews += 1;
    if (rating === 2) easeFactor = clamp(easeFactor - 0.15, MIN_EASE, MAX_EASE);
    if (rating === 4) easeFactor = clamp(easeFactor + 0.10, MIN_EASE, MAX_EASE);
  } else {
    // Standard SM-2-style multiplicative growth.
    const base = Math.max(intervalDays, 1);
    if (rating === 2) {
      easeFactor = clamp(easeFactor - 0.15, MIN_EASE, MAX_EASE);
      intervalDays = Math.round(base * 1.2);
    } else if (rating === 3) {
      intervalDays = Math.round(base * easeFactor);
    } else {
      // rating === 4
      easeFactor = clamp(easeFactor + 0.10, MIN_EASE, MAX_EASE);
      intervalDays = Math.round(base * easeFactor * EASY_BONUS);
    }
    reviews += 1;
  }

  // Cap at 6 months — keeps the schedule sane for casual learners.
  intervalDays = Math.min(intervalDays, 180);

  const nextReviewAt = addDays(now, intervalDays);
  return { next: { intervalDays, easeFactor, reviews, lapses }, nextReviewAt };
}

/** Returns true if the item is due now or earlier. */
export function isDue(nextReviewAt: Date | null | undefined, now: Date = new Date()): boolean {
  if (!nextReviewAt) return false;
  return nextReviewAt.getTime() <= now.getTime();
}

/**
 * Bucket an item into a learning stage for dashboards.
 *   "new"      — never reviewed
 *   "learning" — in initial steps (≤ 2 reviews)
 *   "review"   — graduated, regular interval growth
 *   "mastered" — long interval (≥ 30 days) and no recent lapses
 */
export function classifyStage(state: SrsState | null): "new" | "learning" | "review" | "mastered" {
  if (!state || state.reviews === 0) return "new";
  if (state.reviews <= LEARNING_STEPS_DAYS.length) return "learning";
  if (state.intervalDays >= 30 && state.lapses === 0) return "mastered";
  return "review";
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}
