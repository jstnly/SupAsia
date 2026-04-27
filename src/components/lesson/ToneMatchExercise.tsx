"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import type { ToneMatchExercise as Ex } from "@/lib/game/types";
import { TONES, type ToneId } from "@/lib/game/tones";
import { ToneBadge } from "@/components/game/ToneBadge";
import { playVietnamese } from "@/lib/game/audio";
import { cn } from "@/lib/utils";

export function ToneMatchExercise({ exercise, onAnswer }: { exercise: Ex; onAnswer: (correct: boolean) => void }) {
  const [chosen, setChosen] = useState<ToneId | null>(null);

  useEffect(() => {
    const t = setTimeout(() => playVietnamese(exercise.audioText), 250);
    return () => clearTimeout(t);
  }, [exercise.audioText]);

  function pick(t: ToneId) {
    if (chosen !== null) return;
    setChosen(t);
    setTimeout(() => onAnswer(t === exercise.correctTone), 380);
  }

  // In Southern dialect, hỏi and ngã merge — count both as correct if either chosen for either target.
  function isRight(t: ToneId): boolean {
    if (t === exercise.correctTone) return true;
    if ((t === "hoi" && exercise.correctTone === "nga") || (t === "nga" && exercise.correctTone === "hoi")) return true;
    return false;
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">{exercise.prompt}</h2>

      <button
        onClick={() => playVietnamese(exercise.audioText)}
        className="card-soft mx-auto flex w-full max-w-xs items-center justify-center gap-3 py-8 hover:-translate-y-0.5 transition-transform"
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
          <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">Base: <span className="font-display font-semibold">{exercise.baseSyllable}</span></div>
        </div>
      </button>

      <div className="grid grid-cols-3 gap-3">
        {TONES.map((tone) => {
          const right = chosen === tone.id && isRight(tone.id);
          const wrong = chosen === tone.id && !isRight(tone.id);
          return (
            <motion.button
              key={tone.id}
              onClick={() => pick(tone.id)}
              animate={wrong ? { x: [0, -6, 6, -3, 3, 0] } : right ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all",
                chosen === null && "border-[var(--color-border)] bg-white hover:-translate-y-0.5",
                right && "border-[var(--color-jade-500)] bg-[var(--color-jade-50)]",
                wrong && "border-[var(--color-lotus-500)] bg-[var(--color-lotus-50)]",
                chosen !== null && chosen !== tone.id && "opacity-50"
              )}
              disabled={chosen !== null}
            >
              <ToneBadge toneId={tone.id} size="md" highlighted={right} />
              <span className="font-display text-sm font-semibold">{tone.name}</span>
              <span className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)] -mt-1">
                {tone.diacritic}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
