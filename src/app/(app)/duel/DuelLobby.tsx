"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sword, Link2, Clock, Trophy } from "lucide-react";
import { createDuel, type DuelRow } from "@/server/actions/duel";
import { cn } from "@/lib/utils";

export function DuelLobby({ recentDuels }: { recentDuels: DuelRow[] }) {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [creating, startCreate] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    startCreate(async () => {
      try {
        const { id } = await createDuel();
        router.push(`/duel/${id}`);
      } catch {
        setError("Could not create a duel room. Try again.");
      }
    });
  }

  function handleJoin() {
    const code = joinCode.trim();
    if (!code) return;
    router.push(`/duel/${code}`);
  }

  return (
    <div className="space-y-4">
      {/* Create room */}
      <div className="card-soft p-5 space-y-3">
        <h2 className="font-display text-lg font-bold">Start a new duel</h2>
        <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
          Create a room and share the link with your opponent.
        </p>
        {error && (
          <div className="rounded-xl bg-[var(--color-lotus-50)] border border-[var(--color-lotus-300)] px-4 py-2 text-sm text-[var(--color-lotus-700)]">
            {error}
          </div>
        )}
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-lotus-500)] to-[var(--color-gold-500)] py-3 font-display font-bold text-white shadow-[0_4px_0_0_rgba(26,20,35,0.2)] active:scale-[0.98] disabled:opacity-60"
        >
          <Sword size={18} />
          {creating ? "Creating…" : "Create Room"}
        </button>
      </div>

      {/* Join by code */}
      <div className="card-soft p-5 space-y-3">
        <h2 className="font-display text-lg font-bold">Join a room</h2>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="Paste room ID or link…"
            className="flex-1 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-lotus-400)]"
          />
          <button
            onClick={handleJoin}
            disabled={!joinCode.trim()}
            className="rounded-full bg-[var(--color-jade-500)] px-5 py-2 font-display font-bold text-white shadow-[0_3px_0_0_rgba(26,20,35,0.2)] active:scale-[0.98] disabled:opacity-40"
          >
            Join
          </button>
        </div>
      </div>

      {/* Recent duels */}
      {recentDuels.length > 0 && (
        <div className="card-soft p-5 space-y-3">
          <h2 className="font-display text-lg font-bold">Recent duels</h2>
          <ul className="space-y-2">
            {recentDuels.map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => router.push(`/duel/${d.id}`)}
                  className="w-full flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-left hover:-translate-y-0.5 transition-transform"
                >
                  <div
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-full",
                      d.status === "finished"
                        ? "bg-[var(--color-jade-100)] text-[var(--color-jade-600)]"
                        : d.status === "active"
                          ? "bg-[var(--color-lotus-100)] text-[var(--color-lotus-600)]"
                          : "bg-[var(--color-gold-100)] text-[var(--color-gold-600)]",
                    )}
                  >
                    {d.status === "finished" ? (
                      <Trophy size={14} />
                    ) : d.status === "active" ? (
                      <Sword size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-sm truncate">
                      {d.status === "waiting"
                        ? "Waiting for opponent…"
                        : d.status === "active"
                          ? "In progress"
                          : `${d.hostScore} – ${d.guestScore}`}
                    </div>
                    <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
                      {d.status.charAt(0).toUpperCase() + d.status.slice(1)} ·{" "}
                      {d.createdAt
                        ? new Date(d.createdAt).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                  <Link2 size={14} className="text-[var(--color-gold-400)] shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
