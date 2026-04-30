import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * Compact breadcrumb back-link. Used at the top of subpages (lesson runner, unit
 * detail, boss room) to give users a clear escape hatch.
 */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-display font-semibold text-[var(--color-lacquer)] backdrop-blur-sm shadow-[0_2px_6px_rgba(26,20,35,0.06)] hover:bg-white transition-colors"
    >
      <ChevronLeft size={14} />
      {label}
    </Link>
  );
}
