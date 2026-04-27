"use client";

import { motion } from "framer-motion";
import { STAT_KEYS, STAT_META, type StatKey } from "@/lib/game/xp";

export function StatRadar({ stats, size = 280 }: { stats: Record<StatKey, number>; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const max = Math.max(100, ...STAT_KEYS.map((k) => stats[k] ?? 0));
  const angles = STAT_KEYS.map((_, i) => (i / STAT_KEYS.length) * Math.PI * 2 - Math.PI / 2);

  const pts = STAT_KEYS.map((k, i) => {
    const v = (stats[k] ?? 0) / max;
    const x = cx + Math.cos(angles[i]!) * r * v;
    const y = cy + Math.sin(angles[i]!) * r * v;
    return [x, y] as const;
  });
  const path = "M " + pts.map(([x, y]) => `${x},${y}`).join(" L ") + " Z";

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Stats radar">
      {/* grid rings */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={STAT_KEYS.map((_, i) => {
            const x = cx + Math.cos(angles[i]!) * r * f;
            const y = cy + Math.sin(angles[i]!) * r * f;
            return `${x},${y}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(26,20,35,0.08)"
          strokeWidth="1"
        />
      ))}
      {/* spokes */}
      {STAT_KEYS.map((_, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + Math.cos(angles[i]!) * r}
          y2={cy + Math.sin(angles[i]!) * r}
          stroke="rgba(26,20,35,0.06)"
          strokeWidth="1"
        />
      ))}
      {/* values */}
      <motion.path
        d={path}
        fill="color-mix(in oklab, var(--color-lotus-400) 35%, transparent)"
        stroke="var(--color-lotus-500)"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 18 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {STAT_KEYS.map((k, i) => {
        const labelR = r + 24;
        const x = cx + Math.cos(angles[i]!) * labelR;
        const y = cy + Math.sin(angles[i]!) * labelR;
        return (
          <g key={k}>
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-display"
              fontSize="11"
              fontWeight="600"
              fill={STAT_META[k].color}
            >
              {STAT_META[k].name}
            </text>
            <text
              x={x}
              y={y + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="rgba(26,20,35,0.55)"
            >
              {stats[k]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
