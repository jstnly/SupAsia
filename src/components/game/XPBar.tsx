"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { levelFromTotalXp } from "@/lib/game/xp";
import { formatNumber } from "@/lib/utils";

export function XPBar({ totalXp, compact = false }: { totalXp: number; compact?: boolean }) {
  const { level, intoLevel, needed, progress } = levelFromTotalXp(totalXp);

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gold-300)] to-[var(--color-gold-500)] text-[var(--color-lacquer)] font-display font-bold shadow-[0_2px_0_0_var(--color-gold-700)]"
        title={`Level ${level}`}
      >
        {level}
      </div>
      <div className="flex-1">
        {!compact && (
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]">
            <span className="inline-flex items-center gap-1">
              <Sparkles size={12} className="text-[var(--color-gold-500)]" />
              {formatNumber(intoLevel)} / {formatNumber(needed)} XP
            </span>
            <span>L{level + 1}</span>
          </div>
        )}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--color-lacquer)_10%,transparent)]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-lotus-400)] via-[var(--color-gold-400)] to-[var(--color-jade-400)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
          />
        </div>
      </div>
    </div>
  );
}
