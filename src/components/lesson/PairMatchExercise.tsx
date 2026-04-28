"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import type { PairMatchExercise as Ex } from "@/lib/game/types";
import { playVietnamese } from "@/lib/game/audio";
import { cn, shuffle } from "@/lib/utils";

export function PairMatchExercise({
  exercise,
  onAnswer,
}: {
  exercise: Ex;
  onAnswer: (correct: boolean) => void;
}) {
  const pairs = exercise.pairs;
  // First render uses the deterministic original index order so SSR and client match;
  // after mount we shuffle to randomize the right column.
  const [rightOrder, setRightOrder] = useState<number[]>(() => pairs.map((_, i) => i));
  useEffect(() => {
    setRightOrder(shuffle(pairs.map((_, i) => i)));
  }, [pairs]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<{ l: number; r: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const settledRef = useRef(false);

  useEffect(() => {
    if (selectedLeft === null || selectedRight === null) return;
    const rightOriginal = rightOrder[selectedRight];
    if (rightOriginal === selectedLeft) {
      const next = new Set(matched);
      next.add(selectedLeft);
      setMatched(next);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (next.size === pairs.length && !settledRef.current) {
        settledRef.current = true;
        const success = mistakes === 0;
        setTimeout(() => onAnswer(success), 600);
      }
    } else {
      setWrong({ l: selectedLeft, r: selectedRight });
      setMistakes((m) => m + 1);
      const t = setTimeout(() => {
        setWrong(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 480);
      return () => clearTimeout(t);
    }
  }, [selectedLeft, selectedRight, rightOrder, matched, mistakes, pairs.length, onAnswer]);

  useEffect(() => {
    if (selectedLeft === null) return;
    const audioText = pairs[selectedLeft].audioText ?? pairs[selectedLeft].left;
    playVietnamese(audioText);
  }, [selectedLeft, pairs]);

  function pickLeft(i: number) {
    if (matched.has(i) || wrong) return;
    setSelectedLeft(i);
  }
  function pickRight(displayIdx: number) {
    if (matched.has(rightOrder[displayIdx]) || wrong) return;
    setSelectedRight(displayIdx);
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">{exercise.prompt}</h2>
      {exercise.promptEnglish && (
        <p className="-mt-4 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
          {exercise.promptEnglish}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {pairs.map((p, i) => {
            const isMatched = matched.has(i);
            const isSelected = selectedLeft === i;
            const isWrong = wrong?.l === i;
            return (
              <motion.button
                key={`L-${i}`}
                onClick={() => pickLeft(i)}
                animate={isWrong ? { x: [0, -6, 6, -3, 3, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-2xl border-2 p-3 text-left transition-all",
                  !isMatched &&
                    !isSelected &&
                    !isWrong &&
                    "border-[var(--color-border)] bg-white hover:-translate-y-0.5",
                  isSelected && "border-[var(--color-lotus-500)] bg-[var(--color-lotus-50)]",
                  isMatched &&
                    "border-[var(--color-jade-500)] bg-[var(--color-jade-50)] opacity-70",
                  isWrong && "border-[var(--color-lotus-500)] bg-[var(--color-lotus-50)]",
                )}
                disabled={isMatched}
              >
                <span className="font-display font-semibold">{p.left}</span>
                <Volume2
                  size={16}
                  className="shrink-0 text-[var(--color-lotus-600)] opacity-60"
                  aria-hidden="true"
                />
              </motion.button>
            );
          })}
        </div>
        <div className="space-y-2">
          {rightOrder.map((origIdx, displayIdx) => {
            const isMatched = matched.has(origIdx);
            const isSelected = selectedRight === displayIdx;
            const isWrong = wrong?.r === displayIdx;
            return (
              <motion.button
                key={`R-${displayIdx}`}
                onClick={() => pickRight(displayIdx)}
                animate={isWrong ? { x: [0, -6, 6, -3, 3, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={cn(
                  "w-full rounded-2xl border-2 p-3 text-left transition-all",
                  !isMatched &&
                    !isSelected &&
                    !isWrong &&
                    "border-[var(--color-border)] bg-white hover:-translate-y-0.5",
                  isSelected && "border-[var(--color-lotus-500)] bg-[var(--color-lotus-50)]",
                  isMatched &&
                    "border-[var(--color-jade-500)] bg-[var(--color-jade-50)] opacity-70",
                  isWrong && "border-[var(--color-lotus-500)] bg-[var(--color-lotus-50)]",
                )}
                disabled={isMatched}
              >
                <span className="font-display font-semibold">{pairs[origIdx].right}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {mistakes > 0 && (
        <div className="text-center text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
          Mistakes: {mistakes}
        </div>
      )}
    </div>
  );
}
