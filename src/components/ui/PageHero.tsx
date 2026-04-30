import { getSectionTheme, type SectionId } from "@/lib/ui/sections";
import { HeroPattern } from "./HeroPattern";

/**
 * Distinctive section-themed hero block. Replaces the generic `.card-soft` hero.
 *
 * - Big colored gradient banner that immediately signals which section you're in.
 * - Decorative SVG pattern in the background (different per section).
 * - Optional emoji watermark.
 * - Optional `actions` slot for primary CTAs.
 * - Optional `meta` slot for stats/badges that ride along the right side on desktop.
 */
export function PageHero({
  section,
  eyebrow,
  title,
  subtitle,
  emoji,
  actions,
  meta,
}: {
  section: SectionId;
  /** Tiny uppercase label above the title. Defaults to the section's Vietnamese name. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Override the theme's default emoji watermark */
  emoji?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  const t = getSectionTheme(section);
  const eb = eyebrow ?? t.vi;
  const watermark = emoji ?? t.emoji;
  return (
    <header
      className="relative overflow-hidden rounded-3xl px-5 py-6 md:px-7 md:py-7 hero-text-light"
      style={{
        background: `linear-gradient(135deg, ${t.heroFrom} 0%, ${t.heroTo} 100%)`,
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.15) inset, 0 18px 36px -18px rgba(26,20,35,0.45)",
      }}
    >
      <HeroPattern pattern={t.pattern} />
      {watermark && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-4 -top-2 select-none text-[7rem] leading-none opacity-15 md:text-[9rem]"
        >
          {watermark}
        </span>
      )}
      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-display font-bold uppercase tracking-[0.18em] text-white/80">
            {eb}
          </div>
          <h1 className="mt-1 font-display text-[28px] font-extrabold leading-tight md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-xl text-sm text-white/85 md:text-base text-pretty">{subtitle}</p>
          )}
          {actions && <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {meta && (
          <div className="relative shrink-0 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
            {meta}
          </div>
        )}
      </div>
    </header>
  );
}
