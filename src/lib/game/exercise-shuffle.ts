import { shuffle } from "@/lib/utils";
import type { Exercise, Lesson } from "./types";

/**
 * Returns a re-mixed copy of the lesson for replay variety:
 * - Multiple-choice options (listen / translate / fill-blank) get shuffled and the correct
 *   index re-mapped to the new position.
 * - Non-story exercises get reordered. Story exercises always stay at the end so capstone
 *   dialogues see the user's earned vocabulary first.
 */
export function shuffleLessonForReplay(lesson: Lesson): Lesson {
  const stories = lesson.exercises.filter((e) => e.kind === "story");
  const others = lesson.exercises.filter((e) => e.kind !== "story");
  const remixed = shuffle(others).map(shuffleExerciseOptions);
  return {
    ...lesson,
    exercises: [...remixed, ...stories],
  };
}

function shuffleExerciseOptions(ex: Exercise): Exercise {
  if (ex.kind === "listen" || ex.kind === "translate" || ex.kind === "fill-blank") {
    const indexed = ex.options.map((opt, i) => ({ opt, isCorrect: i === ex.correct }));
    const remixed = shuffle(indexed);
    return {
      ...ex,
      options: remixed.map((s) => s.opt),
      correct: remixed.findIndex((s) => s.isCorrect),
    };
  }
  return ex;
}
