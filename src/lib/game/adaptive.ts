import type { Lesson, Unit } from "@/lib/game/types";
import type { StatKey } from "@/lib/game/xp";
import { STAT_META } from "@/lib/game/xp";

export type FocusLesson = {
  lesson: Lesson;
  unit: Unit;
  targetStat: StatKey;
  reason: string;
};

type StatScores = Partial<Record<StatKey, number>>;

/** Returns a sorted list of stat keys from weakest to strongest. */
function weakestStats(scores: StatScores): StatKey[] {
  const all: StatKey[] = [
    "thanhDieu", "thinh", "khau", "van", "but", "tuVung", "nguPhap",
  ];
  return [...all].sort((a, b) => (scores[a] ?? 0) - (scores[b] ?? 0));
}

/**
 * Picks up to `limit` lessons that target the user's weak stats.
 * Lessons in units the user hasn't unlocked yet are excluded.
 * Already-mastered lessons are deprioritized (kept at the end).
 */
export function getFocusLessons(
  units: Unit[],
  scores: StatScores,
  completedIds: ReadonlySet<string>,
  masteredIds: ReadonlySet<string>,
  availableUnitIds: ReadonlySet<string>,
  limit = 3,
): FocusLesson[] {
  const ordered = weakestStats(scores);
  const results: FocusLesson[] = [];
  const seen = new Set<string>();

  for (const stat of ordered) {
    if (results.length >= limit) break;
    for (const unit of units) {
      if (!availableUnitIds.has(unit.id)) continue;
      for (const lesson of unit.lessons) {
        if (seen.has(lesson.id)) continue;
        // Check if any exercise trains this stat
        const trains = lesson.exercises.some((e) => e.trainsStat === stat);
        if (!trains) continue;
        seen.add(lesson.id);
        const isCompleted = completedIds.has(lesson.id);
        const isMastered = masteredIds.has(lesson.id);
        const meta = STAT_META[stat];
        const reason = isMastered
          ? `Strengthen your ${meta.english.toLowerCase()} (mastered)`
          : isCompleted
            ? `Replay to boost ${meta.english.toLowerCase()}`
            : `New lesson for ${meta.english.toLowerCase()}`;
        results.push({ lesson, unit, targetStat: stat, reason });
        if (results.length >= limit) break;
      }
      if (results.length >= limit) break;
    }
  }

  // Stable sort: incomplete first, then completed, then mastered
  results.sort((a, b) => {
    const rank = (f: FocusLesson) =>
      masteredIds.has(f.lesson.id) ? 2 : completedIds.has(f.lesson.id) ? 1 : 0;
    return rank(a) - rank(b);
  });

  return results.slice(0, limit);
}
