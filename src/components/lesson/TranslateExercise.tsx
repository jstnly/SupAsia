"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import type { TranslateExercise as Ex } from "@/lib/game/types";
import { playVietnamese } from "@/lib/game/audio";
import { cn } from "@/lib/utils";

export function TranslateExercise({ exercise, onAnswer }: { exercise: Ex; onAnswer: (correct: boolean) => void }) {
  const [chosen, setChosen] = useState<number | null>(null);

  function pick(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    setTimeout(() => onAnswer(i === exercise.correct), 320);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
          {exercise.direction === "vi-to-en" ? "Translate to English" : "Translate to Vietnamese"}
        </div>
        <h2 className="font-display text-2xl font-bold">{exercise.prompt}</h2>
        {exercise.promptEnglish && (
          <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)] mt-1">{exercise.promptEnglish}</p>
        )}
      </div>

      <div className="card-soft flex items-center justify-between gap-3 p-5">
        <div className="font-display text-3xl font-bold">{exercise.source}</div>
        {exercise.direction === "vi-to-en" && (
          <button
            onClick={() => playVietnamese(exercise.source)}
            className="grid h-12 w-12 place-items-center rounded-full bg-[var(--color-lotus-400)] text-white shadow-[0_3px_0_0_var(--color-lotus-600)] active:scale-95"
            aria-label="Play audio"
          >
            <Volume2 size={20} />
          </button>
        )}
      </div>

      <div className="grid gap-2">
        {exercise.options.map((opt, i) => {
          const wrong = chosen === i && i !== exercise.correct;
          const right = chosen === i && i === exercise.correct;
          return (
            <motion.button
              key={i}
              onClick={() => pick(i)}
              animate={wrong ? { x: [0, -8, 8, -4, 4, 0] } : right ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={cn(
                "rounded-2xl border-2 px-4 py-3 text-left font-display text-lg transition-all",
                chosen === null && "border-[var(--color-border)] bg-white hover:border-[var(--color-lotus-400)] hover:-translate-y-0.5",
                right && "border-[var(--color-jade-500)] bg-[var(--color-jade-100)]",
                wrong && "border-[var(--color-lotus-500)] bg-[var(--color-lotus-100)]",
                chosen !== null && chosen !== i && "opacity-60"
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
