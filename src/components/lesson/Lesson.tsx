"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";
import Link from "next/link";
import type {
  Exercise,
  Lesson as LessonType,
  ToneMatchExercise as ToneMatchExerciseType,
} from "@/lib/game/types";
import { Progress } from "@/components/ui/progress";
import { ListenExercise } from "./ListenExercise";
import { TranslateExercise } from "./TranslateExercise";
import { ToneMatchExercise } from "./ToneMatchExercise";
import { SpeakExercise } from "./SpeakExercise";
import { PairMatchExercise } from "./PairMatchExercise";
import { FillBlankExercise } from "./FillBlankExercise";
import { ShortStoryExercise } from "./ShortStoryExercise";
import { LessonResult } from "./LessonResult";
import { completeLesson } from "@/server/actions/lesson";
import type { StatKey } from "@/lib/game/xp";
import { useEffectiveMicOptional } from "@/lib/stores/accessibility";
import { shuffleLessonForReplay } from "@/lib/game/exercise-shuffle";
import { TONE_BY_ID } from "@/lib/game/tones";
import { LessonTips } from "./LessonTips";
import { deriveVocabFromLesson } from "@/lib/curriculum/derive-vocab";
import { VietnameseText } from "@/components/ui/word";

type Phase =
  | { kind: "tips" }
  | { kind: "playing" }
  | { kind: "feedback"; correct: boolean; exerciseRef: Exercise }
  | { kind: "done" };

export function Lesson({ lesson: rawLesson, demoMode = false }: { lesson: LessonType; demoMode?: boolean }) {
  const router = useRouter();
  const exitHref = demoMode ? "/demo" : "/learn";
  // SSR / first paint use the deterministic original; after mount we re-shuffle client-side.
  // This avoids a hydration mismatch from Math.random() in shuffleLessonForReplay.
  const [lesson, setLesson] = useState<LessonType>(rawLesson);
  useEffect(() => {
    setLesson(shuffleLessonForReplay(rawLesson));
  }, [rawLesson]);
  const hasTips = useMemo(() => {
    const vocab = deriveVocabFromLesson(rawLesson);
    return vocab.length > 0 || (rawLesson.tips?.grammar?.length ?? 0) > 0;
  }, [rawLesson]);
  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [score, setScore] = useState(0);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [statXp, setStatXp] = useState<Partial<Record<StatKey, number>>>({});
  const [phase, setPhase] = useState<Phase>(hasTips ? { kind: "tips" } : { kind: "playing" });
  const [pending, startTransition] = useTransition();
  const [savedResult, setSavedResult] = useState<{
    totalXp: number;
    completed: boolean;
    statXp: Partial<Record<StatKey, number>>;
    newlyEarned?: string[];
  } | null>(null);

  const exercise = lesson.exercises[index];
  const total = lesson.exercises.length;
  const progress =
    phase.kind === "tips"
      ? 0
      : ((index + (phase.kind === "feedback" ? 1 : 0)) / total) * 100;

  function handleAnswer(correct: boolean) {
    const ref = exercise!;
    if (correct) {
      setScore((s) => s + 1);
      setCorrectIds((ids) => [...ids, ref.id]);
      const xpFor = 5;
      setStatXp((prev) => ({
        ...prev,
        [ref.trainsStat]: (prev[ref.trainsStat] ?? 0) + xpFor,
      }));
      setPhase({ kind: "feedback", correct: true, exerciseRef: ref });
    } else {
      setHearts((h) => Math.max(0, h - 1));
      setPhase({ kind: "feedback", correct: false, exerciseRef: ref });
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
    if (demoMode) {
      setSavedResult({ totalXp: lesson.xpReward, completed: score >= Math.ceil(total * 0.8), statXp });
      return;
    }
    startTransition(async () => {
      try {
        const r = await completeLesson(lesson.id, correctIds);
        setSavedResult(r);
      } catch (e) {
        console.error(e);
        setSavedResult({ totalXp: 0, completed: false, statXp });
      }
    });
  }

  if (phase.kind === "done") {
    return (
      <LessonResult
        lesson={lesson}
        score={score}
        total={total}
        statXp={savedResult?.statXp ?? statXp}
        saving={pending}
        savedXp={savedResult?.totalXp ?? lesson.xpReward}
        completed={savedResult?.completed ?? score >= Math.ceil(total * 0.8)}
        newlyEarned={savedResult?.newlyEarned ?? []}
        onContinue={() => {
          router.push(exitHref);
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
          href={exitHref}
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
            key={
              phase.kind === "tips"
                ? "tips"
                : `${exercise!.id}-${phase.kind}`
            }
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="py-4"
          >
            {phase.kind === "tips" ? (
              <LessonTips lesson={lesson} onStart={() => setPhase({ kind: "playing" })} />
            ) : phase.kind === "playing" ? (
              <ExerciseSwitch exercise={exercise!} onAnswer={handleAnswer} />
            ) : (
              <FeedbackPanel
                correct={phase.correct}
                exercise={phase.exerciseRef}
                onContinue={handleContinue}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExerciseSwitch({ exercise, onAnswer }: { exercise: Exercise; onAnswer: (correct: boolean) => void }) {
  const micOptional = useEffectiveMicOptional();
  switch (exercise.kind) {
    case "listen":
      return <ListenExercise exercise={exercise} onAnswer={onAnswer} />;
    case "translate":
      return <TranslateExercise exercise={exercise} onAnswer={onAnswer} />;
    case "tone-match":
      return <ToneMatchExercise exercise={exercise} onAnswer={onAnswer} />;
    case "speak":
      if (micOptional) {
        const synthetic: ToneMatchExerciseType = {
          id: exercise.id,
          kind: "tone-match",
          prompt: exercise.prompt,
          promptEnglish: exercise.promptEnglish,
          trainsStat: exercise.trainsStat,
          baseSyllable: exercise.targetText,
          audioText: exercise.audioText,
          correctTone: exercise.targetTone,
        };
        return <ToneMatchExercise exercise={synthetic} onAnswer={onAnswer} />;
      }
      return <SpeakExercise exercise={exercise} onAnswer={onAnswer} />;
    case "pair-match":
      return <PairMatchExercise exercise={exercise} onAnswer={onAnswer} />;
    case "fill-blank":
      return <FillBlankExercise exercise={exercise} onAnswer={onAnswer} />;
    case "story":
      return <ShortStoryExercise exercise={exercise} onAnswer={onAnswer} />;
    default:
      return <div>Unsupported exercise type</div>;
  }
}

function FeedbackPanel({
  correct,
  exercise,
  onContinue,
}: {
  correct: boolean;
  exercise: Exercise;
  onContinue: () => void;
}) {
  return (
    <div
      className={`rounded-3xl p-6 ${
        correct
          ? "bg-[var(--color-jade-50)] border-2 border-[var(--color-jade-300)]"
          : "bg-[var(--color-lotus-50)] border-2 border-[var(--color-lotus-300)]"
      }`}
    >
      <div className="font-display text-2xl font-bold">
        {correct ? "Giỏi quá!" : "Không sao."}
      </div>
      <div className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)] mt-1">
        {correct ? "That's correct." : "Here's the answer:"}
      </div>
      {!correct && (
        <div className="mt-3">
          <CorrectAnswerDisplay exercise={exercise} />
        </div>
      )}
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

function CorrectAnswerDisplay({ exercise }: { exercise: Exercise }) {
  return (
    <div className="rounded-2xl bg-white border border-[var(--color-border)] p-4">
      <CorrectAnswerInner exercise={exercise} />
    </div>
  );
}

function CorrectAnswerInner({ exercise }: { exercise: Exercise }) {
  if (exercise.kind === "listen" || exercise.kind === "translate") {
    const right = exercise.options[exercise.correct];
    const isViAnswer =
      exercise.kind === "listen" || (exercise.kind === "translate" && exercise.direction === "en-to-vi");
    return (
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
          {exercise.kind === "translate" && exercise.direction === "vi-to-en" ? "Meaning" : "Answer"}
        </div>
        <div className="font-display text-xl font-bold">
          {isViAnswer ? <VietnameseText text={right} /> : right}
        </div>
        {exercise.kind === "translate" && (
          <div className="mt-1 text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            {exercise.direction === "en-to-vi" ? "for" : "from"}{" "}
            <span className="font-semibold">
              {exercise.direction === "vi-to-en" ? <VietnameseText text={exercise.source} /> : exercise.source}
            </span>
          </div>
        )}
      </div>
    );
  }
  if (exercise.kind === "fill-blank") {
    const filled = exercise.sentence.replace("___", exercise.options[exercise.correct]);
    return (
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
          Full sentence
        </div>
        <div className="font-display text-xl font-bold">
          <VietnameseText text={filled} />
        </div>
        {exercise.englishHint && (
          <div className="mt-1 text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            {exercise.englishHint}
          </div>
        )}
      </div>
    );
  }
  if (exercise.kind === "tone-match") {
    const tone = TONE_BY_ID[exercise.correctTone];
    return (
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
          Tone
        </div>
        <div className="font-display text-xl font-bold">
          {tone.name} <span className="opacity-60 text-base font-normal">({tone.english})</span>
        </div>
        <div className="mt-1 text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
          Like <span className="font-semibold">{tone.example}</span> ({tone.exampleMeaning})
        </div>
      </div>
    );
  }
  if (exercise.kind === "speak") {
    const tone = TONE_BY_ID[exercise.targetTone];
    return (
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
          Target
        </div>
        <div className="font-display text-xl font-bold">
          <VietnameseText text={exercise.targetText} />
        </div>
        <div className="mt-1 text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
          {tone.name} ({tone.english}) tone
        </div>
      </div>
    );
  }
  return null;
}
