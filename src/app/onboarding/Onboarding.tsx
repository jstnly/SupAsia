"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MascotSlot } from "@/components/game/MascotSlot";
import { ToneBadge } from "@/components/game/ToneBadge";
import { TONES } from "@/lib/game/tones";
import { playVietnamese } from "@/lib/game/audio";
import { completeOnboarding } from "@/server/actions/profile";
import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2 | 3 | 4;

const STARTER_BUFFS = [
  { id: "listener" as const, name: "The Listener", boost: "+10% Thính (listening) XP", icon: "👂" },
  { id: "speaker" as const, name: "The Speaker",   boost: "+10% Khẩu (speaking) XP", icon: "🗣️" },
  { id: "reader" as const,  name: "The Reader",    boost: "+10% Văn (reading) XP", icon: "📜" },
];

const MOTIVATIONS = [
  { id: "family" as const,   label: "Family",   sub: "Vietnamese roots & relatives" },
  { id: "travel" as const,   label: "Travel",   sub: "Going to Vietnam soon" },
  { id: "heritage" as const, label: "Heritage", sub: "Reconnect with my culture" },
  { id: "fun" as const,      label: "Fun",      sub: "Just love languages" },
];

export function Onboarding({ initialDisplayName }: { initialDisplayName: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarVariant, setAvatarVariant] = useState(0);
  const [starterBuff, setStarterBuff] = useState<(typeof STARTER_BUFFS)[number]["id"]>("listener");
  const [motivation, setMotivation] = useState<(typeof MOTIVATIONS)[number]["id"]>("travel");
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(15);
  const [pending, startTransition] = useTransition();

  function next() { setStep((s) => Math.min(4, s + 1) as Step); }
  function back() { setStep((s) => Math.max(0, s - 1) as Step); }

  function finish() {
    startTransition(async () => {
      await completeOnboarding({
        displayName: displayName.trim() || initialDisplayName,
        avatarVariant,
        starterBuff,
        motivation,
        dailyGoalMinutes,
      });
      router.push("/learn");
      router.refresh();
    });
  }

  return (
    <main className="grid min-h-dvh place-items-center px-6 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex items-center gap-2 px-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all",
                i <= step ? "bg-[var(--color-lotus-400)]" : "bg-[color-mix(in_oklab,var(--color-lacquer)_10%,transparent)]"
              )}
            />
          ))}
        </div>

        <div className="card-soft p-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="0" {...stepAnim} className="text-center">
                <MascotSlot size={140} emote="cheer" />
                <h2 className="font-display text-3xl font-extrabold mt-4">Chào em! I&apos;m Bồ.</h2>
                <p className="mt-3 text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]">
                  I&apos;ll be your buffalo guide on the journey from Mekong to Hà Nội.
                  We&apos;ll learn <strong>Southern Vietnamese</strong> together — the dialect of Sài Gòn streets and family kitchens.
                </p>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="1" {...stepAnim}>
                <h2 className="font-display text-2xl font-bold">Pick your Bồ</h2>
                <p className="mb-4 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                  Your buddy comes in 8 colors. Pick what speaks to you.
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setAvatarVariant(i)}
                      className={cn(
                        "rounded-2xl border-2 p-2 transition-all",
                        avatarVariant === i
                          ? "border-[var(--color-lotus-400)] bg-[var(--color-lotus-50)] scale-[1.04]"
                          : "border-[var(--color-border)] hover:border-[var(--color-lotus-300)]"
                      )}
                      aria-label={`Bồ variant ${i + 1}`}
                    >
                      <MascotSlot size={64} variant={i} />
                    </button>
                  ))}
                </div>
                <div className="mt-6 space-y-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="What should Bồ call you?"
                    maxLength={32}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="2" {...stepAnim}>
                <h2 className="font-display text-2xl font-bold">Listen — these are tones</h2>
                <p className="mb-4 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                  In Vietnamese, the same word changes meaning by tone. Tap each to hear it.
                </p>
                <div className="space-y-2">
                  {TONES.filter((t) => !t.southernMerged || t.id === "hoi").map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => playVietnamese(tone.example)}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-3 hover:bg-[var(--color-silk-cream)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ToneBadge toneId={tone.id} size="md" />
                        <div className="text-left">
                          <div className="font-display text-lg font-semibold">{tone.example}</div>
                          <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
                            {tone.exampleMeaning}
                            {tone.id === "hoi" && " (hỏi/ngã merged in South)"}
                          </div>
                        </div>
                      </div>
                      <Volume2 className="text-[var(--color-lotus-500)]" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="3" {...stepAnim}>
                <h2 className="font-display text-2xl font-bold">Pick a starter buff</h2>
                <p className="mb-4 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                  Lean into your strength early. You can re-spec later.
                </p>
                <div className="grid gap-2">
                  {STARTER_BUFFS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setStarterBuff(b.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                        starterBuff === b.id
                          ? "border-[var(--color-lotus-400)] bg-[var(--color-lotus-50)]"
                          : "border-[var(--color-border)] hover:border-[var(--color-lotus-300)]"
                      )}
                    >
                      <span className="text-3xl">{b.icon}</span>
                      <div>
                        <div className="font-display font-semibold">{b.name}</div>
                        <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">{b.boost}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <h3 className="font-display text-lg font-semibold mt-6 mb-2">Why are you learning?</h3>
                <div className="grid grid-cols-2 gap-2">
                  {MOTIVATIONS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMotivation(m.id)}
                      className={cn(
                        "rounded-2xl border-2 p-3 text-left",
                        motivation === m.id
                          ? "border-[var(--color-jade-400)] bg-[var(--color-jade-50)]"
                          : "border-[var(--color-border)] hover:border-[var(--color-jade-300)]"
                      )}
                    >
                      <div className="font-display font-semibold">{m.label}</div>
                      <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">{m.sub}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="4" {...stepAnim}>
                <h2 className="font-display text-2xl font-bold">Set a daily goal</h2>
                <p className="mb-4 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                  We&apos;ll nudge you nicely. Bồ never guilts.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { mins: 5, label: "Casual", sub: "5 min/day" },
                    { mins: 15, label: "Steady", sub: "15 min/day" },
                    { mins: 25, label: "Ambitious", sub: "25 min/day" },
                    { mins: 40, label: "Phở-natic", sub: "40 min/day" },
                  ].map((g) => (
                    <button
                      key={g.mins}
                      onClick={() => setDailyGoalMinutes(g.mins)}
                      className={cn(
                        "rounded-2xl border-2 p-4 text-left",
                        dailyGoalMinutes === g.mins
                          ? "border-[var(--color-gold-400)] bg-[var(--color-gold-50)]"
                          : "border-[var(--color-border)] hover:border-[var(--color-gold-300)]"
                      )}
                    >
                      <div className="font-display font-bold">{g.label}</div>
                      <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">{g.sub}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            {step > 0 ? (
              <Button variant="ghost" onClick={back} disabled={pending}>
                <ArrowLeft size={16} /> Back
              </Button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <Button onClick={next} className="gap-2">
                Continue <ArrowRight size={16} />
              </Button>
            ) : (
              <Button onClick={finish} className="gap-2" disabled={pending}>
                {pending ? "Saving…" : "Begin journey"} <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

const stepAnim = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.25, ease: "easeOut" },
} as const;
