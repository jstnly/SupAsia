import { Sword } from "lucide-react";
import { DuelLobby } from "./DuelLobby";
import { getMyDuels } from "@/server/actions/duel";

export default async function DuelPage() {
  const recent = await getMyDuels();
  return (
    <div className="space-y-6">
      <div className="card-soft flex items-center gap-4 p-5">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--color-lotus-400)] to-[var(--color-gold-500)] text-white">
          <Sword size={28} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
            Tone Duel · Đấu Thanh Điệu
          </div>
          <h1 className="font-display text-2xl font-extrabold">Challenge a friend</h1>
          <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            10 rounds. Tap the right tone faster than your opponent.
          </p>
        </div>
      </div>
      <DuelLobby recentDuels={recent} />
    </div>
  );
}
