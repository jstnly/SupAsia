"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import type { FillBlankExercise as Ex } from "@/lib/game/types";
import { playVietnamese } from "@/lib/game/audio";
import { cn } from "@/lib/utils";

export function FillBlankExercise({
  exercise,
  onAnswer,
}: {
  exercise: Ex;
  onAnswer: (correct: boolean) => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [before, after] = splitOnBlank(exercise.sentence);

  useEffect(() => {
    if (!exercise.audioText) return;
    const t = setTimeout(() => playVietnamese(exercise.audioText!), 250);
    return () => clearTimeout(t);
  }, [exercise.audioText]);

  function pick(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    setTimeout(() => onAnswer(i === exercise.correct), 420);
  }

  const isRight = chosen !== null && chosen === exercise.correct;
  const isWrong = chosen !== null && chosen !== exercise.correct;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">{exercise.prompt}</h2>
      {exercise.englishHint && (
        <p className="-mt-4 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
          {exercise.englishHint}
        </p>
      )}

      <div className="card-soft flex flex-wrap items-center justify-center gap-2 p-5 text-center text-xl">
        <span className="font-display">{before}</span>
        <motion.span
          animate={isWrong ? { x: [0, -6, 6, -3, 3, 0] } : isRight ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.4 }}
          className={cn(
            "inline-flex min-w-[3.5rem] items-center justify-center rounded-xl border-2 border-dashed px-3 py-1 font-display font-bold",
            chosen === null && "border-[var(--color-lotus-300)] bg-[var(--color-lotus-50)] text-[var(--color-lotus-600)]",
            isRight && "border-[var(--color-jade-500)] bg-[var(--color-jade-50)] text-[var(--color-jade-700)]",
            isWrong && "border-[var(--color-lotus-500)] bg-[var(--color-lotus-50)] text-[var(--color-lotus-600)]",
          )}
        >
          {chosen === null ? "___" : exercise.options[chosen]}
        </motion.span>
        <span className="font-display">{after}</span>
      </div>

      {exercise.audioText && (
        <button
          onClick={() => playVietnamese(exercise.audioText!)}
          className="mx-auto flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-display font-semibold text-[var(--color-lotus-600)] hover:-translate-y-0.5 transition-transform"
        >
          <Volume2 size={16} />
          Listen
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        {exercise.options.map((opt, i) => {
          const right = chosen === i && i === exercise.correct;
          const wrong = chosen === i && i !== exercise.correct;
          return (
            <motion.button
              key={i}
              onClick={() => pick(i)}
              animate={wrong ? { x: [0, -6, 6, -3, 3, 0] } : right ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={cn(
                "rounded-2xl border-2 p-3 text-center font-display font-semibold transition-all",
                chosen === null && "border-[var(--color-border)] bg-white hover:-translate-y-0.5",
                right && "border-[var(--color-jade-500)] bg-[var(--color-jade-50)]",
                wrong && "border-[var(--color-lotus-500)] bg-[var(--color-lotus-50)]",
                chosen !== null && chosen !== i && "opacity-50",
              )}
              disabled={chosen !== null}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function splitOnBlank(sentence: string): [string, string] {
  const idx = sentence.indexOf("___");
  if (idx === -1) return [sentence, ""];
  return [sentence.slice(0, idx), sentence.slice(idx + 3)];
}
