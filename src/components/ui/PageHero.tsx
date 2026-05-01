import { getSectionTheme, type SectionId } from "@/lib/ui/sections";

/**
 * Light, friendly page header. Each section gets a distinct accent color via a
 * bold rounded icon badge (with optional emoji) and a colored eyebrow line.
 * Background stays cream/white so pages feel airy, not dramatic.
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
  eyebrow?: string;
  title: string;
  subtitle?: string;
  emoji?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  const t = getSectionTheme(section);
  const eb = eyebrow ?? t.vi;
  const badgeEmoji = emoji ?? t.emoji;

  return (
    <header
      className="relative rounded-3xl bg-white px-5 py-5 md:px-6 md:py-6"
      style={{
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 0 rgba(26,20,35,0.04), 0 12px 28px -16px rgba(26,20,35,0.18)",
      }}
    >
      {/* Colored accent strip — section identity at a glance */}
      <span
        aria-hidden
        className="absolute left-5 right-5 top-0 h-1 rounded-b-full md:left-6 md:right-6"
        style={{ background: t.accent }}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          {/* Big bold colored icon badge */}
          <div
            className="grid h-14 w-14 shrink-0 select-none place-items-center rounded-2xl text-3xl shadow-[0_4px_0_0_rgba(26,20,35,0.10)]"
            style={{
              background: `color-mix(in oklab, ${t.accent} 16%, white)`,
              border: `1.5px solid color-mix(in oklab, ${t.accent} 35%, transparent)`,
            }}
            aria-hidden
          >
            <span>{badgeEmoji}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div
              className="text-[11px] font-display font-bold uppercase tracking-[0.14em]"
              style={{ color: t.accentStrong }}
            >
              {eb}
            </div>
            <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight text-[var(--color-lacquer)] md:text-[28px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 max-w-xl text-sm text-[color-mix(in_oklab,var(--color-lacquer)_65%,transparent)] text-pretty">
                {subtitle}
              </p>
            )}
            {actions && <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        </div>

        {meta && (
          <div
            className="shrink-0 self-start rounded-2xl px-4 py-3"
            style={{
              background: `color-mix(in oklab, ${t.accent} 10%, white)`,
              border: `1px solid color-mix(in oklab, ${t.accent} 22%, transparent)`,
            }}
          >
            {meta}
          </div>
        )}
      </div>
    </header>
  );
}
