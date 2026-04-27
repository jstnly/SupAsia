"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import type { ListenExercise as Ex } from "@/lib/game/types";
import { playVietnamese } from "@/lib/game/audio";
import { cn } from "@/lib/utils";

export function ListenExercise({ exercise, onAnswer }: { exercise: Ex; onAnswer: (correct: boolean) => void }) {
  const [chosen, setChosen] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => playVietnamese(exercise.audioText), 250);
    return () => clearTimeout(t);
  }, [exercise.audioText]);

  function pick(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    setTimeout(() => onAnswer(i === exercise.correct), 320);
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">{exercise.prompt}</h2>
      {exercise.promptEnglish && (
        <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">{exercise.promptEnglish}</p>
      )}

      <button
        onClick={() => playVietnamese(exercise.audioText)}
        className="card-soft mx-auto flex w-full max-w-xs items-center justify-center gap-3 py-8 hover:-translate-y-0.5 transition-transform"
        aria-label="Play audio"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="grid h-16 w-16 place-items-center rounded-full bg-[var(--color-lotus-400)] text-white shadow-[0_4px_0_0_var(--color-lotus-600)]"
        >
          <Volume2 size={32} />
        </motion.div>
        <div className="text-left">
          <div className="font-display text-sm uppercase tracking-wide text-[var(--color-lotus-600)]">Tap to hear</div>
          <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">Listen carefully</div>
        </div>
      </button>

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
                "rounded-2xl border-2 px-4 py-4 text-left font-display text-lg transition-all",
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
