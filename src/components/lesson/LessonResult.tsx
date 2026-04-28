"use client";

import { motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfettiBurst } from "@/components/game/ConfettiBurst";
import { MascotSlot } from "@/components/game/MascotSlot";
import { STAT_META, type StatKey } from "@/lib/game/xp";
import { ACHIEVEMENT_BY_ID } from "@/lib/game/achievements";
import type { Lesson } from "@/lib/game/types";

export function LessonResult({
  lesson,
  score,
  total,
  statXp,
  savedXp,
  completed,
  saving,
  newlyEarned = [],
  onContinue,
}: {
  lesson: Lesson;
  score: number;
  total: number;
  statXp: Partial<Record<StatKey, number>>;
  savedXp: number;
  completed: boolean;
  saving: boolean;
  newlyEarned?: string[];
  onContinue: () => void;
}) {
  const accuracy = Math.round((score / total) * 100);
  const statEntries = Object.entries(statXp) as [StatKey, number][];

  return (
    <div className="relative grid min-h-dvh place-items-center px-6 py-10">
      {completed && <ConfettiBurst count={36} />}

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="card-soft relative w-full max-w-md p-8 text-center"
      >
        <div className="mb-3">
          <MascotSlot size={120} emote={completed ? "cheer" : "shrug"} />
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
          {completed ? "Lesson complete" : "Lesson finished"}
        </div>
        <h1 className="font-display text-3xl font-extrabold text-balance">
          {completed ? `Giỏi quá! ${lesson.title}` : "Try once more?"}
        </h1>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          <Pill label="Accuracy" value={`${accuracy}%`} />
          <Pill label="XP earned" value={`+${savedXp}`} icon={<Sparkles size={12} className="text-[var(--color-gold-500)]" />} />
          <Pill label="Score" value={`${score}/${total}`} icon={<Trophy size={12} className="text-[var(--color-lotus-500)]" />} />
        </div>

        {statEntries.length > 0 && (
          <div className="mt-5 space-y-1.5 rounded-2xl bg-[var(--color-silk-cream)] p-4 text-left">
            <div className="text-xs font-semibold uppercase tracking-wider text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">Stat gains</div>
            {statEntries.map(([key, amount]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="font-display text-sm font-semibold" style={{ color: STAT_META[key].color }}>
                  {STAT_META[key].name} <span className="text-xs opacity-60">({STAT_META[key].english})</span>
                </span>
                <span className="font-display font-bold tabular-nums">+{amount}</span>
              </div>
            ))}
          </div>
        )}

        {newlyEarned.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 18 }}
            className="mt-5 rounded-2xl border-2 border-[var(--color-gold-300)] bg-gradient-to-br from-[var(--color-gold-50)] to-[var(--color-lotus-50)] p-4 text-left"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-700)]">
              <Trophy size={14} />
              Achievement unlocked!
            </div>
            <div className="mt-2 space-y-1.5">
              {newlyEarned.map((id) => {
                const ach = ACHIEVEMENT_BY_ID[id];
                if (!ach) return null;
                return (
                  <div key={id} className="font-display">
                    <span className="text-sm font-bold">{ach.name}</span>{" "}
                    <span className="text-xs opacity-70">({ach.nameEnglish})</span>
                    <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                      {ach.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <Button onClick={onContinue} className="mt-6 w-full" size="lg" disabled={saving}>
          {saving ? "Saving…" : "Continue"}
        </Button>
      </motion.div>
    </div>
  );
}

function Pill({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">{label}</div>
      <div className="font-display text-lg font-bold inline-flex items-center gap-1">{icon}{value}</div>
    </div>
  );
}
