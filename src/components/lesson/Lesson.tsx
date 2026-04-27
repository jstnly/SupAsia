"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";
import Link from "next/link";
import type { Exercise, Lesson as LessonType } from "@/lib/game/types";
import { Progress } from "@/components/ui/progress";
import { ListenExercise } from "./ListenExercise";
import { TranslateExercise } from "./TranslateExercise";
import { ToneMatchExercise } from "./ToneMatchExercise";
import { LessonResult } from "./LessonResult";
import { completeLesson } from "@/server/actions/lesson";
import type { StatKey } from "@/lib/game/xp";

type Phase =
  | { kind: "playing" }
  | { kind: "feedback"; correct: boolean; explanation?: string }
  | { kind: "done" };

export function Lesson({ lesson }: { lesson: LessonType }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [score, setScore] = useState(0);
  const [statXp, setStatXp] = useState<Partial<Record<StatKey, number>>>({});
  const [phase, setPhase] = useState<Phase>({ kind: "playing" });
  const [pending, startTransition] = useTransition();
  const [savedResult, setSavedResult] = useState<{ totalXp: number; completed: boolean } | null>(null);

  const exercise = lesson.exercises[index];
  const total = lesson.exercises.length;
  const progress = ((index + (phase.kind !== "playing" ? 1 : 0)) / total) * 100;

  function handleAnswer(correct: boolean) {
    if (correct) {
      setScore((s) => s + 1);
      const xpFor = 5;
      setStatXp((prev) => ({
        ...prev,
        [exercise!.trainsStat]: (prev[exercise!.trainsStat] ?? 0) + xpFor,
      }));
      setPhase({ kind: "feedback", correct: true });
    } else {
      setHearts((h) => Math.max(0, h - 1));
      setPhase({ kind: "feedback", correct: false });
    }
  }

  function handleContinue() {
    if (hearts <= 0) {
      finalize();
      return;
    }
    if (index + 1 >= total) {
      finalize();
      return;
    }
    setIndex((i) => i + 1);
    setPhase({ kind: "playing" });
  }

  function finalize() {
    setPhase({ kind: "done" });
    startTransition(async () => {
      try {
        const r = await completeLesson(lesson.id, score, statXp);
        setSavedResult(r);
      } catch (e) {
        console.error(e);
        setSavedResult({ totalXp: 0, completed: false });
      }
    });
  }

  if (phase.kind === "done") {
    return (
      <LessonResult
        lesson={lesson}
        score={score}
        total={total}
        statXp={statXp}
        saving={pending}
        savedXp={savedResult?.totalXp ?? lesson.xpReward}
        completed={savedResult?.completed ?? score >= Math.ceil(total * 0.8)}
        onContinue={() => {
          router.push("/learn");
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4">
        <Link
          href="/learn"
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-[color-mix(in_oklab,var(--color-lacquer)_8%,transparent)]"
          aria-label="Quit lesson"
        >
          <X size={20} />
        </Link>
        <Progress value={progress} className="flex-1 h-3" />
        <div className="flex items-center gap-1 text-[var(--color-lotus-500)]">
          <Heart size={20} className="fill-current" />
          <span className="font-display font-bold tabular-nums">{hearts}</span>
        </div>
      </div>

      {/* Exercise */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${exercise!.id}-${phase.kind}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="py-4"
          >
            {phase.kind === "playing" ? (
              <ExerciseSwitch exercise={exercise!} onAnswer={handleAnswer} />
            ) : (
              <FeedbackPanel correct={phase.correct} onContinue={handleContinue} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExerciseSwitch({ exercise, onAnswer }: { exercise: Exercise; onAnswer: (correct: boolean) => void }) {
  switch (exercise.kind) {
    case "listen":
      return <ListenExercise exercise={exercise} onAnswer={onAnswer} />;
    case "translate":
      return <TranslateExercise exercise={exercise} onAnswer={onAnswer} />;
    case "tone-match":
      return <ToneMatchExercise exercise={exercise} onAnswer={onAnswer} />;
    default:
      return <div>Unsupported exercise type</div>;
  }
}

function FeedbackPanel({ correct, onContinue }: { correct: boolean; onContinue: () => void }) {
  return (
    <div
      className={`rounded-3xl p-6 ${
        correct
          ? "bg-[var(--color-jade-50)] border-2 border-[var(--color-jade-300)]"
          : "bg-[var(--color-lotus-50)] border-2 border-[var(--color-lotus-300)]"
      }`}
    >
      <div className="font-display text-2xl font-bold">
        {correct ? "Giỏi quá! 🎉" : "Không sao, try again."}
      </div>
      <div className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)] mt-1">
        {correct ? "Great job — that's correct!" : "Almost — keep going."}
      </div>
      <button
        onClick={onContinue}
        className={`mt-5 w-full rounded-full py-3 font-display font-bold text-white shadow-[0_4px_0_0_rgba(26,20,35,0.18)] active:scale-[0.98] ${
          correct ? "bg-[var(--color-jade-500)]" : "bg-[var(--color-lotus-500)]"
        }`}
      >
        Continue
      </button>
    </div>
  );
}
