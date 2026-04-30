"use client";

import { useState, useTransition } from "react";
import { setDialect, setDailyGoal } from "@/server/actions/profile";

const DAILY_GOALS = [5, 10, 15, 20, 30];

export function SettingsPanel({
  currentDialect,
  currentDailyGoal,
  userLevel,
}: {
  currentDialect: string;
  currentDailyGoal: number;
  userLevel: number;
}) {
  const [dialect, setDialectLocal] = useState(currentDialect);
  const [dailyGoal, setDailyGoalLocal] = useState(currentDailyGoal);
  const [dialectMsg, setDialectMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleDialect(d: "southern" | "northern") {
    setDialectMsg(null);
    startTransition(async () => {
      const res = await setDialect(d);
      if (res.success) {
        setDialectLocal(d);
        setDialectMsg(null);
      } else {
        setDialectMsg(res.error ?? "Failed to update dialect");
      }
    });
  }

  async function handleGoal(m: number) {
    setDailyGoalLocal(m);
    startTransition(async () => {
      await setDailyGoal(m);
    });
  }

  return (
    <div className="space-y-5">
      {/* Dialect */}
      <div className="space-y-2">
        <div className="font-display font-semibold text-sm">Dialect</div>
        <div className="flex gap-2">
          {(["southern", "northern"] as const).map((d) => {
            const active = dialect === d;
            const locked = d === "northern" && userLevel < 25;
            return (
              <button
                key={d}
                onClick={() => !locked && handleDialect(d)}
                disabled={isPending || locked}
                className={`flex-1 rounded-full border-2 py-2 text-sm font-display font-bold transition-colors ${
                  active
                    ? "border-[var(--color-jade-500)] bg-[var(--color-jade-500)] text-white"
                    : locked
                      ? "border-[color-mix(in_oklab,var(--color-lacquer)_15%,transparent)] text-[color-mix(in_oklab,var(--color-lacquer)_35%,transparent)] cursor-not-allowed"
                      : "border-[var(--color-border)] hover:border-[var(--color-jade-300)]"
                }`}
              >
                {d === "southern" ? "Southern 🌴" : locked ? "Northern 🔒 L25" : "Northern ❄️"}
              </button>
            );
          })}
        </div>
        {dialectMsg && (
          <div className="text-xs text-[var(--color-lotus-600)]">{dialectMsg}</div>
        )}
      </div>

      {/* Daily goal */}
      <div className="space-y-2">
        <div className="font-display font-semibold text-sm">Daily goal</div>
        <div className="flex gap-1.5 flex-wrap">
          {DAILY_GOALS.map((m) => (
            <button
              key={m}
              onClick={() => handleGoal(m)}
              disabled={isPending}
              className={`rounded-full border-2 px-3 py-1 text-sm font-display font-bold transition-colors ${
                dailyGoal === m
                  ? "border-[var(--color-jade-500)] bg-[var(--color-jade-500)] text-white"
                  : "border-[var(--color-border)] hover:border-[var(--color-jade-300)]"
              }`}
            >
              {m} min
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
