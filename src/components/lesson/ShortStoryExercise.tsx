"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import type {
  ShortStoryExercise as Ex,
  StoryNode,
  StoryLineNode,
  StoryChoiceNode,
  StoryEndNode,
} from "@/lib/game/types";
import { playVietnamese } from "@/lib/game/audio";
import { VietnameseText } from "@/components/ui/word";
import { cn } from "@/lib/utils";

type HistoryItem =
  | { kind: "line"; node: StoryLineNode }
  | { kind: "you"; text: string; textEnglish?: string; correct: boolean };

export function ShortStoryExercise({
  exercise,
  onAnswer,
}: {
  exercise: Ex;
  onAnswer: (correct: boolean) => void;
}) {
  const nodeMap = useMemo(
    () => Object.fromEntries(exercise.nodes.map((n) => [n.id, n])) as Record<string, StoryNode>,
    [exercise.nodes],
  );
  const [currentId, setCurrentId] = useState(exercise.startId);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [allCorrect, setAllCorrect] = useState(true);
  const settledRef = useRef(false);
  const playedRef = useRef<Set<string>>(new Set());

  const current = nodeMap[currentId];

  useEffect(() => {
    if (current?.kind === "line" && current.audioText && !playedRef.current.has(current.id)) {
      playedRef.current.add(current.id);
      const t = setTimeout(() => playVietnamese(current.audioText!), 250);
      return () => clearTimeout(t);
    }
  }, [current]);

  useEffect(() => {
    if (current?.kind !== "end" || settledRef.current) return;
    settledRef.current = true;
    const t = setTimeout(() => onAnswer(allCorrect), 1100);
    return () => clearTimeout(t);
  }, [current, allCorrect, onAnswer]);

  function advanceLine() {
    if (current?.kind !== "line") return;
    setHistory((h) => [...h, { kind: "line", node: current }]);
    setCurrentId(current.next);
  }

  function pickChoice(idx: number) {
    if (current?.kind !== "choice") return;
    const opt = current.options[idx];
    setHistory((h) => [
      ...h,
      { kind: "you", text: opt.text, textEnglish: opt.textEnglish, correct: opt.correct },
    ]);
    if (!opt.correct) setAllCorrect(false);
    setCurrentId(opt.next);
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-bold">{exercise.prompt}</h2>
      {exercise.promptEnglish && (
        <p className="-mt-3 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
          {exercise.promptEnglish}
        </p>
      )}

      <div className="card-soft space-y-3 p-4">
        <AnimatePresence initial={false}>
          {history.map((item, i) =>
            item.kind === "line" ? (
              <LineBubble key={`h-${i}`} node={item.node} replayable />
            ) : (
              <YouBubble key={`h-${i}`} text={item.text} textEnglish={item.textEnglish} />
            ),
          )}
          {current?.kind === "line" && (
            <LineBubble key={`cur-${current.id}`} node={current} replayable />
          )}
          {current?.kind === "end" && <EndBubble key={`end-${current.id}`} node={current} success={allCorrect} />}
        </AnimatePresence>
      </div>

      {current?.kind === "line" && (
        <button
          onClick={advanceLine}
          className="mx-auto block rounded-full bg-[var(--color-jade-500)] px-6 py-2 font-display font-bold text-white shadow-[0_4px_0_0_var(--color-jade-600)] active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--color-jade-600)]"
        >
          Continue →
        </button>
      )}

      {current?.kind === "choice" && (
        <ChoicePanel choice={current} onPick={pickChoice} />
      )}
    </div>
  );
}

function LineBubble({ node, replayable }: { node: StoryLineNode; replayable: boolean }) {
  const isNarrator = node.speaker === "narrator";
  if (isNarrator) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm italic text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]"
      >
        {node.text}
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex max-w-[85%] flex-col gap-1"
    >
      <span className="font-display text-xs font-bold uppercase tracking-wider text-[var(--color-lotus-600)]">
        {node.speaker}
      </span>
      <div className="flex items-start gap-2 rounded-2xl rounded-tl-sm border border-[var(--color-border)] bg-white p-3">
        <div className="flex-1">
          <div className="font-display">
            <VietnameseText text={node.text} />
          </div>
          {node.textEnglish && (
            <div className="mt-1 text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
              {node.textEnglish}
            </div>
          )}
        </div>
        {replayable && node.audioText && (
          <button
            onClick={() => playVietnamese(node.audioText!)}
            className="shrink-0 rounded-full p-1 text-[var(--color-lotus-600)] hover:bg-[var(--color-lotus-50)]"
            aria-label="Replay audio"
          >
            <Volume2 size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function YouBubble({ text, textEnglish }: { text: string; textEnglish?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      className="ml-auto flex max-w-[85%] flex-col items-end gap-1"
    >
      <span className="font-display text-xs font-bold uppercase tracking-wider text-[var(--color-jade-600)]">
        You
      </span>
      <div className="rounded-2xl rounded-tr-sm bg-[var(--color-jade-500)] p-3 text-white">
        <div className="font-display">
          <VietnameseText text={text} />
        </div>
        {textEnglish && (
          <div className="mt-1 text-xs text-white/80">{textEnglish}</div>
        )}
      </div>
    </motion.div>
  );
}

function EndBubble({ node, success }: { node: StoryEndNode; success: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded-2xl border-2 p-4 text-center",
        success
          ? "border-[var(--color-jade-300)] bg-[var(--color-jade-50)]"
          : "border-[var(--color-lotus-300)] bg-[var(--color-lotus-50)]",
      )}
    >
      <div className="font-display text-lg font-bold">{node.text}</div>
      {node.textEnglish && (
        <div className="mt-1 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]">
          {node.textEnglish}
        </div>
      )}
    </motion.div>
  );
}

function ChoicePanel({
  choice,
  onPick,
}: {
  choice: StoryChoiceNode;
  onPick: (i: number) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  function handlePick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    setTimeout(() => onPick(i), 280);
  }
  return (
    <div className="space-y-3">
      <div className="text-center">
        <div className="font-display text-sm font-bold uppercase tracking-wider text-[var(--color-lotus-600)]">
          Your turn
        </div>
        <div className="font-display text-base">{choice.prompt}</div>
        {choice.promptEnglish && (
          <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
            {choice.promptEnglish}
          </div>
        )}
      </div>
      <div className="space-y-2">
        {choice.options.map((opt, i) => {
          const isPicked = picked === i;
          return (
            <motion.button
              key={i}
              onClick={() => handlePick(i)}
              animate={isPicked ? { scale: [1, 0.97, 1] } : {}}
              transition={{ duration: 0.25 }}
              className={cn(
                "w-full rounded-2xl border-2 p-3 text-left transition-all",
                picked === null && "border-[var(--color-border)] bg-white hover:-translate-y-0.5",
                isPicked && "border-[var(--color-jade-500)] bg-[var(--color-jade-50)]",
                picked !== null && !isPicked && "opacity-50",
              )}
              disabled={picked !== null}
            >
              <div className="font-display font-semibold">{opt.text}</div>
              {opt.textEnglish && (
                <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
                  {opt.textEnglish}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
