"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Star, Check, Sword } from "lucide-react";
import { CITIES, UNITS } from "@/lib/curriculum/units";
import { MascotSlot } from "@/components/game/MascotSlot";
import { cn } from "@/lib/utils";

export function WorldMap({
  completedLessonIds,
  avatarVariant,
}: {
  completedLessonIds: string[];
  avatarVariant: number;
}) {
  const completed = new Set(completedLessonIds);

  function isUnitComplete(unitId: string): boolean {
    const u = UNITS.find((x) => x.id === unitId);
    if (!u || u.lessons.length === 0) return false;
    return u.lessons.every((l) => completed.has(l.id));
  }

  return (
    <div className="relative">
      {/* Sky / mist parallax */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10"
        animate={{ x: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
        aria-hidden
      >
        <svg viewBox="0 0 100 200" className="h-full w-full opacity-40">
          <defs>
            <radialGradient id="cloudGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FAF6EC" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <ellipse cx="20" cy="40"  rx="20" ry="6"  fill="url(#cloudGrad)" />
          <ellipse cx="78" cy="80"  rx="22" ry="7"  fill="url(#cloudGrad)" />
          <ellipse cx="30" cy="120" rx="18" ry="5"  fill="url(#cloudGrad)" />
          <ellipse cx="70" cy="160" rx="20" ry="6"  fill="url(#cloudGrad)" />
        </svg>
      </motion.div>

      {/* SVG Vietnam silhouette + city nodes */}
      <div className="relative mx-auto" style={{ aspectRatio: "1 / 2", maxWidth: 420 }}>
        <svg viewBox="0 0 100 200" className="absolute inset-0 h-full w-full">
          {/* Vietnam silhouette — stylized S-curve */}
          <defs>
            <linearGradient id="landGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#9DCCC2" />
              <stop offset="100%" stopColor="#6FB7A6" />
            </linearGradient>
          </defs>
          <path
            d="M 50 12 Q 60 18 56 28 Q 48 36 54 46 Q 70 50 72 60 Q 78 70 70 80 Q 64 92 60 100 Q 56 116 64 130 Q 76 142 72 158 Q 64 172 56 180 Q 48 190 42 192 Q 36 188 38 180 Q 36 172 30 162 Q 36 148 44 134 Q 50 122 46 112 Q 38 96 44 84 Q 54 70 50 56 Q 44 44 50 32 Q 46 22 50 12 Z"
            fill="url(#landGrad)"
            stroke="#0E7C66"
            strokeWidth="0.6"
            opacity={0.92}
          />
          {/* Path between cities */}
          <path
            d="M 50 92 L 60 84 L 67 74 L 76 60 L 75 55 L 70 48 L 53 30 L 65 22 L 50 22"
            fill="none"
            stroke="#1A1423"
            strokeOpacity="0.18"
            strokeWidth="0.7"
            strokeDasharray="1.5 1.5"
          />
        </svg>

        {/* City nodes */}
        {CITIES.map((city, i) => {
          const unit = UNITS.find((u) => u.id === city.unitId);
          const unlocked = i === 0 || isUnitComplete(CITIES[i - 1].unitId);
          const lessons = unit?.lessons ?? [];
          const allDone = lessons.length > 0 && lessons.every((l) => completed.has(l.id));

          return (
            <motion.div
              key={city.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${city.position.x}%`, top: `${city.position.y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 200, damping: 20 }}
            >
              {unlocked && unit ? (
                <div className="group flex flex-col items-center gap-1">
                  <Link
                    href={`/learn/${unit.id}`}
                    className="grid h-12 w-12 place-items-center rounded-full border-4 shadow-[0_4px_0_0_rgba(26,20,35,0.18)] transition-transform hover:-translate-y-0.5"
                    style={{
                      borderColor: allDone ? "var(--color-jade-600)" : "var(--color-lotus-700)",
                      background: allDone ? "var(--color-jade-400)" : "var(--color-lotus-400)",
                      color: "white",
                    }}
                  >
                    {allDone ? <Check size={22} /> : <Star size={22} className="fill-white" />}
                  </Link>
                  <div className="card-soft px-2 py-1 text-[10px] font-display font-semibold text-[var(--color-lacquer)] whitespace-nowrap">
                    {city.englishName}
                  </div>
                  {allDone && (
                    <Link
                      href={`/boss/${city.id}`}
                      className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-[var(--color-lotus-500)] to-[var(--color-gold-400)] px-2 py-0.5 text-[9px] font-display font-bold text-white hover:-translate-y-0.5 transition-transform whitespace-nowrap"
                    >
                      <Sword size={9} /> Boss
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <div className="grid h-10 w-10 place-items-center rounded-full border-3 border-[color-mix(in_oklab,var(--color-lacquer)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-lacquer)_8%,transparent)]">
                    <Lock size={16} className="text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]" />
                  </div>
                  <div className="text-[10px] font-medium text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
                    {city.englishName}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bồ companion in lower-right */}
      <div className="pointer-events-none absolute -right-2 bottom-0 md:right-4">
        <MascotSlot size={96} variant={avatarVariant} />
      </div>
    </div>
  );
}
