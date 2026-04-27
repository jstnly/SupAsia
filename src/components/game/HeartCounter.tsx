"use client";

import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function HeartCounter({ hearts, max = 5 }: { hearts: number; max?: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-[0_2px_0_0_rgba(26,20,35,0.08)]">
      <Heart size={18} className="fill-[var(--color-lotus-400)] text-[var(--color-lotus-400)]" />
      <span className="font-display font-bold text-[var(--color-lacquer)] tabular-nums">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={hearts}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            className="inline-block"
          >
            {hearts}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_50%,transparent)]">
        /{max}
      </span>
    </div>
  );
}
