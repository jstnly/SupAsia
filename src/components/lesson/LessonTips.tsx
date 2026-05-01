"use client";

import { Volume2, BookOpen, ArrowRight, Headphones, Languages, Music, Mic, Link2, PenTool, BookMarked, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { Lesson, LessonTips as Tips, Exercise } from "@/lib/game/types";
import { playVietnamese } from "@/lib/game/audio";
import { deriveVocabFromLesson } from "@/lib/curriculum/derive-vocab";

const EXERCISE_LABEL: Record<Exercise["kind"], { label: string; explain: string; Icon: typeof Headphones }> = {
  listen:       { label: "Listen",      explain: "Hear a Vietnamese word — pick what it means", Icon: Headphones },
  translate:    { label: "Translate",   explain: "Translate between English and Vietnamese", Icon: Languages },
  "tone-match": { label: "Tone Match",  explain: "Hear a syllable — pick its tone", Icon: Music },
  speak:        { label: "Speak",       explain: "Say it out loud — we'll grade your pitch", Icon: Mic },
  "pair-match": { label: "Pair Match",  explain: "Match Vietnamese words with English meanings", Icon: Link2 },
  "fill-blank": { label: "Fill Blank",  explain: "Complete the sentence", Icon: PenTool },
  story:        { label: "Short Story", explain: "Branching dialogue — pick what to say next", Icon: BookMarked },
};

export function LessonTips({
  lesson,
  onStart,
}: {
  lesson: Lesson;
  onStart: () => void;
}) {
  const vocab = deriveVocabFromLesson(lesson);
  const grammar: NonNullable<Tips["grammar"]> = lesson.tips?.grammar ?? [];

  // Unique exercise types in this lesson, in order of first appearance
  const exerciseTypes: Exercise["kind"][] = [];
  for (const ex of lesson.exercises) {
    if (!exerciseTypes.includes(ex.kind)) exerciseTypes.push(ex.kind);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
          {lesson.titleEnglish}
        </div>
        <h1 className="font-display text-2xl font-extrabold">{lesson.title}</h1>
        <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]">
          Tap any word to hear it. When you&apos;re ready, start the lesson.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--color-jade-500)_12%,white)] px-2.5 py-1 font-display font-semibold text-[var(--color-jade-700)]">
            {lesson.exercises.length} exercises
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--color-lotus-500)_12%,white)] px-2.5 py-1 font-display font-semibold text-[var(--color-lotus-700)]">
            <Sparkles size={11} /> +{lesson.xpReward} XP
          </span>
        </div>
      </div>

      {exerciseTypes.length > 0 && (
        <section className="card-soft p-4">
          <h2 className="mb-2 font-display text-base font-bold">What you&apos;ll do</h2>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {exerciseTypes.map((kind) => {
              const meta = EXERCISE_LABEL[kind];
              const Icon = meta.Icon;
              return (
                <li key={kind} className="flex items-center gap-2.5 rounded-xl bg-[var(--color-silk-cream)] px-3 py-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-[var(--color-lotus-600)]">
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-display text-xs font-bold leading-tight">{meta.label}</div>
                    <div className="text-[11px] leading-tight text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                      {meta.explain}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {vocab.length > 0 && (
        <section className="card-soft p-4 space-y-3">
          <h2 className="flex items-center gap-2 font-display text-base font-bold">
            <BookOpen size={16} className="text-[var(--color-lotus-600)]" />
            Vocabulary ({vocab.length})
          </h2>
          <ul className="grid gap-2">
            {vocab.map((v) => (
              <li key={v.word}>
                <button
                  onClick={() => playVietnamese(v.audioText ?? v.word)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-3 text-left transition-transform hover:-translate-y-0.5"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-lotus-50)] text-[var(--color-lotus-600)]">
                    <Volume2 size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-base font-semibold">{v.word}</div>
                    <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                      {v.meaning}
                    </div>
                  </div>
                  {v.toneHint && (
                    <div className="shrink-0 rounded-full bg-[var(--color-silk-cream)] px-2 py-1 text-[10px] font-display uppercase tracking-wider">
                      {v.toneHint}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {grammar.length > 0 && (
        <section className="card-soft p-4 space-y-3">
          <h2 className="font-display text-base font-bold">Grammar</h2>
          <ul className="space-y-2">
            {grammar.map((g, i) => (
              <li
                key={i}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-3"
              >
                <div className="font-display text-base font-semibold">{g.pattern}</div>
                <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                  {g.meaning}
                </div>
                {g.example && (
                  <div className="mt-2 text-sm italic">
                    e.g. {g.example}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <button
        onClick={onStart}
        className="group flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-jade-500)] py-3 font-display font-bold text-white shadow-[0_4px_0_0_var(--color-jade-600)] active:translate-y-0.5"
      >
        Start lesson
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </motion.div>
  );
}
