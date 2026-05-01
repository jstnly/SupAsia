"use client";

import { motion } from "framer-motion";
import { HeartCounter } from "@/components/game/HeartCounter";
import { StreakFlame } from "@/components/game/StreakFlame";
import { XPBar } from "@/components/game/XPBar";
import { Coins, Gem } from "lucide-react";
import type { Profile } from "@/lib/db/schema";
import { BeginnerHelp } from "@/components/ui/BeginnerHelp";

export function TopBar({ profile }: { profile: Profile }) {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="card-soft flex flex-wrap items-center justify-between gap-3 px-4 py-3"
    >
      <div className="min-w-[180px] flex-1">
        <XPBar totalXp={profile.totalXp} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StreakFlame days={profile.streakDays} />
        <HeartCounter hearts={profile.hearts} />
        <div
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-[0_2px_0_0_rgba(26,20,35,0.08)]"
          title="Gold (Đồng) — earned from lessons, spent on small boosts"
        >
          <Coins size={16} className="text-[var(--color-gold-500)]" />
          <span className="font-display font-bold tabular-nums">{profile.gold}</span>
          <span className="text-[10px] uppercase tracking-wider text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">Gold</span>
        </div>
        <div
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-[0_2px_0_0_rgba(26,20,35,0.08)]"
          title="Gems (Ngọc) — earned from city bosses, spent in the Shop"
        >
          <Gem size={16} className="text-[var(--color-tone-nga)]" />
          <span className="font-display font-bold tabular-nums">{profile.gems}</span>
          <span className="text-[10px] uppercase tracking-wider text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">Gems</span>
        </div>
        <BeginnerHelp />
      </div>
    </motion.div>
  );
}
