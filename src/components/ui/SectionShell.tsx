import { getSectionTheme, type SectionId } from "@/lib/ui/sections";

/**
 * Wraps a page in a section-themed backdrop that tints the page background and
 * exposes CSS custom properties (--section-accent, --section-wash-from/to) so
 * descendant components (.card-feature, .nav-pill-active, .section-underline) can
 * react to the section without prop-drilling.
 *
 * Place near the top of the page; renders the children inside a relative-positioned
 * container so the wash can sit behind them.
 */
export function SectionShell({
  section,
  children,
  className = "",
}: {
  section: SectionId;
  children: React.ReactNode;
  className?: string;
}) {
  const t = getSectionTheme(section);
  const style = {
    "--section-accent": t.accent,
    "--section-accent-soft": t.accentSoft,
    "--section-accent-strong": t.accentStrong,
    "--section-wash-from": t.pageWashFrom,
    "--section-wash-to": t.pageWashTo,
  } as React.CSSProperties;

  return (
    <div data-section={section} style={style} className={`section-wash -mx-4 -mt-4 px-4 pt-4 pb-2 rounded-b-3xl ${className}`}>
      {children}
    </div>
  );
}
