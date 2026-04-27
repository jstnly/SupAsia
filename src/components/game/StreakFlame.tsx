"use client";

import { Flame } from "lucide-react";
import { motion } from "framer-motion";

export function StreakFlame({ days }: { days: number }) {
  const isHot = days >= 7;
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-[0_2px_0_0_rgba(26,20,35,0.08)]">
      <motion.div
        animate={
          isHot
            ? { scale: [1, 1.1, 1], rotate: [-3, 3, -3] }
            : { scale: 1, rotate: 0 }
        }
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
      >
        <Flame
          size={18}
          className={
            days === 0
              ? "text-[color-mix(in_oklab,var(--color-lacquer)_30%,transparent)]"
              : "fill-[var(--color-gold-400)] text-[var(--color-gold-500)]"
          }
        />
      </motion.div>
      <span className="font-display font-bold text-[var(--color-lacquer)] tabular-nums">
        {days}
      </span>
    </div>
  );
}
