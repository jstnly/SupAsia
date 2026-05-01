import Link from "next/link";
import { ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import { MascotSlot } from "@/components/game/MascotSlot";

/**
 * Friendly intro banner shown to first-time users (totalXp == 0). Explains in
 * plain English what the app teaches and what to do next. Does not show once
 * the user has earned any XP.
 */
export function WelcomeBanner({
  displayName,
  firstLessonId,
  avatarVariant,
}: {
  displayName: string;
  firstLessonId: string;
  avatarVariant: number;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-white p-5 md:p-6"
      style={{
        border: "1.5px solid color-mix(in oklab, var(--color-jade-400) 30%, transparent)",
        boxShadow: "0 1px 0 rgba(26,20,35,0.04), 0 16px 32px -16px color-mix(in oklab, var(--color-jade-400) 30%, transparent)",
      }}
    >
      <span aria-hidden className="absolute left-5 right-5 top-0 h-1 rounded-b-full bg-[var(--color-jade-500)] md:left-6 md:right-6" />
      <div className="flex flex-wrap items-center gap-5">
        <div
          className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl"
          style={{
            background: "color-mix(in oklab, var(--color-jade-400) 12%, white)",
            border: "1.5px solid color-mix(in oklab, var(--color-jade-400) 30%, transparent)",
          }}
        >
          <MascotSlot size={88} variant={avatarVariant} emote="cheer" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-display font-bold uppercase tracking-[0.14em] text-[var(--color-jade-700)]">
            Welcome, {displayName}!
          </div>
          <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight text-[var(--color-lacquer)]">
            Let&apos;s learn Vietnamese together.
          </h2>
          <p className="mt-1.5 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)] text-pretty">
            You&apos;ll start with sounds and tones, then move to greetings, food, and travel.
            By city 13 you&apos;ll be holding real conversations. No experience needed.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              href={`/lesson/${firstLessonId}`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-jade-500)] px-5 py-2.5 font-display text-sm font-bold text-white shadow-[0_3px_0_0_var(--color-jade-700)] hover:-translate-y-0.5 transition-transform"
            >
              <Sparkles size={16} /> Start your first lesson <ArrowRight size={16} />
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--color-lacquer)_5%,transparent)] px-3 py-2 text-xs text-[color-mix(in_oklab,var(--color-lacquer)_65%,transparent)]">
              <HelpCircle size={12} /> Tap the <strong className="text-[var(--color-jade-700)]">?</strong> at the top anytime for a beginner&apos;s guide
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
