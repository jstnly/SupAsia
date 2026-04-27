"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = [
  "var(--color-lotus-400)",
  "var(--color-jade-400)",
  "var(--color-gold-400)",
  "var(--color-tone-sac)",
  "var(--color-tone-huyen)",
];

export function ConfettiBurst({ count = 24, duration = 1.6 }: { count?: number; duration?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        i,
        angle: (i / count) * Math.PI * 2 + Math.random() * 0.4,
        distance: 80 + Math.random() * 140,
        color: COLORS[i % COLORS.length]!,
        size: 6 + Math.random() * 8,
        delay: Math.random() * 0.15,
        rotate: Math.random() * 720 - 360,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.i}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.5,
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance + 100,
            opacity: 0,
            rotate: p.rotate,
            scale: 0.6,
          }}
          transition={{ duration, delay: p.delay, ease: [0.2, 0.8, 0.4, 1] }}
        />
      ))}
    </div>
  );
}
