import { DuelLobby } from "./DuelLobby";
import { getMyDuels } from "@/server/actions/duel";
import { PageHero } from "@/components/ui/PageHero";
import { SectionShell } from "@/components/ui/SectionShell";

export default async function DuelPage() {
  const recent = await getMyDuels();
  return (
    <div className="space-y-6">
      <SectionShell section="duel">
        <PageHero
          section="duel"
          eyebrow="Tone Duel · Đấu Thanh Điệu"
          title="Challenge a friend"
          subtitle="10 rounds, head-to-head. Tap the correct tone faster than your opponent to score."
          meta={
            <div className="text-center">
              <div className="text-[10px] font-display uppercase tracking-wider text-white/80">Recent</div>
              <div className="font-display text-2xl font-extrabold">{recent.length}</div>
              <div className="text-[10px] text-white/70">duels</div>
            </div>
          }
        />
      </SectionShell>
      <DuelLobby recentDuels={recent} />
    </div>
  );
}
