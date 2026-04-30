import { BookOpen, Zap } from "lucide-react";
import { CoopLobby } from "./CoopLobby";
import { PageHero } from "@/components/ui/PageHero";
import { SectionShell } from "@/components/ui/SectionShell";

export default function CoopPage() {
  return (
    <div className="space-y-6">
      <SectionShell section="coop">
        <PageHero
          section="coop"
          eyebrow="Co-op · Đôi Bạn Học"
          title="Study Together"
          subtitle="Share a lesson room with a friend — both earn XP, both hear corrections."
        />
      </SectionShell>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card-soft p-4 space-y-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-jade-100)] text-[var(--color-jade-600)]">
            <BookOpen size={20} />
          </div>
          <h3 className="font-display font-bold">Shared Lesson</h3>
          <p className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            Both players see the same exercise simultaneously. First to answer scores the point.
          </p>
        </div>
        <div className="card-soft p-4 space-y-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-gold-100)] text-[var(--color-gold-600)]">
            <Zap size={20} />
          </div>
          <h3 className="font-display font-bold">XP for Both</h3>
          <p className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            Every correct answer by either player earns XP for both. Co-op bonus: +20% XP.
          </p>
        </div>
      </div>

      <CoopLobby />
    </div>
  );
}
