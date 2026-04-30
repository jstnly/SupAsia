"use client";

import Link from "next/link";
import { Sparkles, Flame } from "lucide-react";
import { MascotSlot } from "@/components/game/MascotSlot";
import { cn, formatNumber } from "@/lib/utils";
import { PageHero } from "@/components/ui/PageHero";
import { SectionShell } from "@/components/ui/SectionShell";

type Row = {
  user_id: string;
  display_name: string;
  username: string;
  avatar_variant: number;
  league: string;
  streak_days: number;
  period_xp: number;
};

const TABS_SCOPE = [
  { id: "global", label: "Global" },
  { id: "friends", label: "Friends" },
] as const;
const TABS_WINDOW = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "all-time", label: "All-time" },
] as const;

export function LeaderboardClient({
  rows,
  scope,
  window,
}: {
  rows: Row[];
  scope: "global" | "friends";
  window: "daily" | "weekly" | "all-time";
}) {
  return (
    <div className="space-y-4">
      <SectionShell section="leaderboard">
        <PageHero
          section="leaderboard"
          eyebrow="Bậc Trà Sữa · Leaderboard"
          title="Climb the ranks"
          subtitle="Weekly rankings reset Sunday at midnight. Top 3 in each league get promoted."
        />
      </SectionShell>

      <div className="flex flex-wrap gap-2">
        <div className="inline-flex rounded-full border border-[var(--color-border)] bg-white p-1">
          {TABS_SCOPE.map((t) => (
            <Link
              key={t.id}
              href={`/leaderboard?scope=${t.id}&window=${window}`}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-display font-semibold",
                scope === t.id
                  ? "bg-[var(--color-lotus-400)] text-white"
                  : "text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <div className="inline-flex rounded-full border border-[var(--color-border)] bg-white p-1">
          {TABS_WINDOW.map((t) => (
            <Link
              key={t.id}
              href={`/leaderboard?scope=${scope}&window=${t.id}`}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-display font-semibold",
                window === t.id
                  ? "bg-[var(--color-jade-500)] text-white"
                  : "text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <ol className="space-y-2">
        {rows.length === 0 ? (
          <div className="card-soft text-center py-10">
            <MascotSlot size={96} emote="shrug" />
            <div className="font-display font-semibold mt-2">Empty for now</div>
            <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
              Complete a lesson to land on the board.
            </p>
          </div>
        ) : (
          rows.map((row, i) => (
            <li key={row.user_id} className={cn("card-soft flex items-center gap-3 p-3", i < 3 && "ring-1 ring-[var(--color-gold-300)]")}>
              <div className={cn(
                "grid h-9 w-9 place-items-center rounded-full font-display font-bold",
                i === 0 ? "bg-[var(--color-gold-400)] text-[var(--color-lacquer)]" :
                i === 1 ? "bg-[var(--color-river-mist)] text-[var(--color-lacquer)]" :
                i === 2 ? "bg-[var(--color-lotus-300)] text-white" :
                "bg-[color-mix(in_oklab,var(--color-lacquer)_8%,transparent)]"
              )}>
                {i + 1}
              </div>
              <MascotSlot size={42} variant={row.avatar_variant} />
              <div className="flex-1">
                <div className="font-display font-semibold leading-tight">{row.display_name}</div>
                <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">@{row.username}</div>
              </div>
              <div className="inline-flex items-center gap-1 text-sm">
                <Flame size={14} className="text-[var(--color-gold-500)]" />
                <span className="font-display font-bold tabular-nums">{row.streak_days}</span>
              </div>
              <div className="inline-flex items-center gap-1 text-sm">
                <Sparkles size={14} className="text-[var(--color-lotus-500)]" />
                <span className="font-display font-bold tabular-nums">{formatNumber(row.period_xp)}</span>
              </div>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}
