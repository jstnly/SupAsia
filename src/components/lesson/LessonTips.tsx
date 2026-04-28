"use client";

import { Volume2, BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Lesson, LessonTips as Tips } from "@/lib/game/types";
import { playVietnamese } from "@/lib/game/audio";
import { deriveVocabFromLesson } from "@/lib/curriculum/derive-vocab";

export function LessonTips({
  lesson,
  onStart,
}: {
  lesson: Lesson;
  onStart: () => void;
}) {
  const vocab = deriveVocabFromLesson(lesson);
  const grammar: NonNullable<Tips["grammar"]> = lesson.tips?.grammar ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
          Tips · {lesson.titleEnglish}
        </div>
        <h1 className="font-display text-2xl font-extrabold">{lesson.title}</h1>
        <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]">
          Tap any word to hear it. When you&apos;re ready, start the lesson.
        </p>
      </div>

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
