"use client";

import { useState, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TONES } from "@/lib/game/tones";
import { playVietnamese } from "@/lib/game/audio";

/**
 * Always-available "?" button + slide-up sheet that explains the basics for
 * users who can't read or speak any Vietnamese yet. Lives in the TopBar so it
 * follows the user across every page.
 */
export function BeginnerHelp() {
  const [open, setOpen] = useState(false);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Help — explain Vietnamese basics"
        className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-[0_2px_0_0_rgba(26,20,35,0.08)] text-[var(--color-jade-600)] hover:-translate-y-0.5 transition-transform"
      >
        <HelpCircle size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-[var(--color-lacquer)]/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-[var(--color-silk-cream)] p-5 shadow-[0_-12px_40px_-8px_rgba(26,20,35,0.35)]"
            >
              <div className="mx-auto max-w-2xl">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-display font-bold uppercase tracking-[0.14em] text-[var(--color-jade-700)]">
                      New to Vietnamese?
                    </div>
                    <h2 className="font-display text-2xl font-extrabold">Quick Reference</h2>
                    <p className="mt-1 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_65%,transparent)]">
                      Everything you need to know to get started — written for absolute beginners.
                    </p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white shadow-[0_2px_0_0_rgba(26,20,35,0.08)]"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <Section
                    emoji="🐃"
                    title="Meet Bồ"
                    body={
                      <>
                        <strong>Bồ</strong> (sounds like &ldquo;bo&rdquo;) is your guide — a baby
                        water buffalo, the iconic farm animal of Vietnam. He cheers when you
                        get answers right and helps you when you&apos;re stuck.
                      </>
                    }
                  />

                  <Section
                    emoji="🎵"
                    title="What are tones?"
                    body={
                      <>
                        Vietnamese is a <strong>tonal language</strong>. The same syllable said
                        with a different pitch can mean a totally different word.
                        <span className="block mt-1 text-[13px]">
                          For example, <em>ma</em> = ghost, <em>má</em> = mother,{" "}
                          <em>mà</em> = but, <em>mả</em> = tomb. Same letters, different pitch.
                        </span>
                        <span className="block mt-2 text-[13px]">
                          There are 6 tones in writing. Tap any below to hear it:
                        </span>
                        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                          {TONES.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => playVietnamese(t.example)}
                              className="flex flex-col items-center gap-0.5 rounded-xl bg-white p-2 text-center shadow-[0_2px_0_0_rgba(26,20,35,0.06)] hover:-translate-y-0.5 transition-transform"
                              aria-label={`Play ${t.name} tone — ${t.english}`}
                            >
                              <span
                                className="grid h-7 w-7 place-items-center rounded-full text-sm font-bold text-white"
                                style={{ background: t.color }}
                              >
                                {t.diacritic}
                              </span>
                              <span className="text-[10px] font-display font-semibold leading-none">
                                {t.english}
                              </span>
                              <span className="text-[9px] text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
                                {t.example}
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    }
                  />

                  <Section
                    emoji="💰"
                    title="Currency"
                    body={
                      <>
                        <strong>Gold (Đồng)</strong> is earned for everyday lesson progress and
                        spent on small boosts. <strong>Gems (Ngọc)</strong> are rarer — earned by
                        beating city bosses — and used in the Shop for cosmetics.
                      </>
                    }
                  />

                  <Section
                    emoji="🗺️"
                    title="How the app works"
                    body={
                      <>
                        Each tab on the bottom bar is a different mode:
                        <ul className="mt-2 space-y-1 text-[13px]">
                          <li>
                            <strong>Learn</strong> — your main path. Pick a city on the world map
                            and complete its lessons. Beat the boss to unlock the next city.
                          </li>
                          <li>
                            <strong>Duel</strong> — head-to-head tone matching against a friend.
                          </li>
                          <li>
                            <strong>Chat</strong> — practice scenario conversations with Bồ, or
                            ask him to explain anything (vocab, tones, grammar, culture).
                          </li>
                          <li>
                            <strong>Ranks</strong> — weekly leaderboard with promotions and
                            demotions.
                          </li>
                          <li>
                            <strong>Me</strong> — your profile, stats, settings, and achievements.
                          </li>
                        </ul>
                      </>
                    }
                  />

                  <Section
                    emoji="🇻🇳"
                    title="Which Vietnamese?"
                    body={
                      <>
                        We teach <strong>Southern (Sài Gòn / Ho Chi Minh City)</strong> Vietnamese
                        by default — it&apos;s easier for English speakers (5 distinct spoken tones
                        vs 6). The Northern (Hà Nội / Hanoi) variant unlocks at level 25 and is
                        toggleable in settings.
                      </>
                    }
                  />

                  <Section
                    emoji="🔊"
                    title="Tap any Vietnamese word"
                    body={
                      <>
                        Throughout the app, click any Vietnamese word to hear it pronounced. If
                        a word has a dotted underline, hover or tap to see what it means in
                        English.
                      </>
                    }
                  />

                  <Section
                    emoji="🧠"
                    title="How to learn fastest"
                    body={
                      <>
                        Three habits backed by decades of memory research:
                        <ul className="mt-2 space-y-1.5 text-[13px]">
                          <li>
                            <strong>Daily, not marathon</strong> — 10 minutes every day beats
                            two hours on Saturday. The streak pushes you toward this.
                          </li>
                          <li>
                            <strong>Review before learning new</strong> — when the green
                            &ldquo;Reviews due&rdquo; card shows up on Learn, do it first.
                            We schedule each lesson to come back at the moment you&apos;re
                            about to forget it (spaced repetition).
                          </li>
                          <li>
                            <strong>Be honest with the rating</strong> — at the end of every
                            lesson, you&apos;ll see Again / Hard / Good / Easy. Tap what
                            actually matches how you felt. Lying inflates the schedule and
                            you&apos;ll forget the words anyway.
                          </li>
                          <li>
                            <strong>Speak out loud</strong> — even alone. Vietnamese tones
                            live in the muscles of your mouth, not just your eyes.
                          </li>
                        </ul>
                      </>
                    }
                  />
                </div>

                <div className="mt-6 rounded-2xl bg-white p-4 text-center text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                  Need more help? Open <strong>Chat</strong> and switch to <strong>Ask Bồ</strong>
                  {" "}— he can explain any Vietnamese word, tone, or grammar pattern.
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Section({ emoji, title, body }: { emoji: string; title: string; body: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_2px_0_0_rgba(26,20,35,0.04)]">
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          {emoji}
        </span>
        <h3 className="font-display text-base font-bold">{title}</h3>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-[color-mix(in_oklab,var(--color-lacquer)_85%,transparent)] text-pretty">
        {body}
      </div>
    </div>
  );
}
