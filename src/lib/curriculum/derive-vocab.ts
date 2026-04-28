import type { Lesson, LessonTips } from "@/lib/game/types";

/**
 * Auto-derive a vocab list from a lesson's exercises so we can show a Tips screen even without
 * explicit `tips.vocab` authoring. Only translate + pair-match contribute (those have explicit
 * VI↔EN pairings). Speak/listen/tone-match supply audio but no built-in meaning, so they're
 * skipped here — the user already learns those words via translate/pair-match in the same
 * lesson, and the tips list pulls from the unique entries.
 */
export function deriveVocabFromLesson(lesson: Lesson): NonNullable<LessonTips["vocab"]> {
  if (lesson.tips?.vocab && lesson.tips.vocab.length > 0) return lesson.tips.vocab;

  const seen = new Set<string>();
  const vocab: NonNullable<LessonTips["vocab"]> = [];
  for (const ex of lesson.exercises) {
    if (ex.kind === "translate") {
      const vi = ex.direction === "en-to-vi" ? ex.options[ex.correct] : ex.source;
      const en = ex.direction === "en-to-vi" ? ex.source : ex.options[ex.correct];
      if (vi && en && !seen.has(vi)) {
        seen.add(vi);
        vocab.push({ word: vi, meaning: en, audioText: vi });
      }
    } else if (ex.kind === "pair-match") {
      for (const p of ex.pairs) {
        if (!seen.has(p.left)) {
          seen.add(p.left);
          vocab.push({ word: p.left, meaning: p.right, audioText: p.audioText ?? p.left });
        }
      }
    }
  }
  return vocab;
}
