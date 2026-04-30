import type { SectionTheme } from "@/lib/ui/sections";

/**
 * Decorative SVG pattern rendered behind the hero. Each section gets a different
 * motif so a glance at the page communicates "I'm in Duel" vs "I'm in Shop".
 */
export function HeroPattern({ pattern }: { pattern: SectionTheme["pattern"] }) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>{getPatternDef(pattern)}</defs>
      <rect width="100%" height="100%" fill={`url(#hero-${pattern})`} />
    </svg>
  );
}

function getPatternDef(pattern: SectionTheme["pattern"]) {
  switch (pattern) {
    case "lotus":
      return (
        <pattern id="hero-lotus" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="white" strokeWidth="1" opacity="0.9">
            <path d="M24 12 Q 30 24 24 36 Q 18 24 24 12 Z" />
            <path d="M12 24 Q 24 30 36 24 Q 24 18 12 24 Z" />
          </g>
        </pattern>
      );
    case "wave":
      return (
        <pattern id="hero-wave" x="0" y="0" width="60" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 10 Q 15 0 30 10 T 60 10" fill="none" stroke="white" strokeWidth="1.4" opacity="0.85" />
        </pattern>
      );
    case "diamond":
      return (
        <pattern id="hero-diamond" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M16 4 L 28 16 L 16 28 L 4 16 Z" fill="none" stroke="white" strokeWidth="1.2" opacity="0.85" />
        </pattern>
      );
    case "stars":
      return (
        <pattern id="hero-stars" x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M22 8 L 24 18 L 34 22 L 24 26 L 22 36 L 20 26 L 10 22 L 20 18 Z" fill="white" opacity="0.85" />
        </pattern>
      );
    case "spark":
      return (
        <pattern id="hero-spark" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="white" strokeWidth="1.4" opacity="0.85">
            <line x1="18" y1="6" x2="18" y2="14" />
            <line x1="18" y1="22" x2="18" y2="30" />
            <line x1="6" y1="18" x2="14" y2="18" />
            <line x1="22" y1="18" x2="30" y2="18" />
          </g>
        </pattern>
      );
    case "leaf":
      return (
        <pattern id="hero-leaf" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="white" strokeWidth="1.3" opacity="0.9">
            <path d="M8 40 Q 24 8 40 40" />
            <line x1="24" y1="14" x2="24" y2="36" />
          </g>
        </pattern>
      );
    case "dot":
      return (
        <pattern id="hero-dot" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1.6" fill="white" opacity="0.9" />
        </pattern>
      );
    case "ring":
      return (
        <pattern id="hero-ring" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="10" fill="none" stroke="white" strokeWidth="1.3" opacity="0.85" />
          <circle cx="20" cy="20" r="3" fill="white" opacity="0.65" />
        </pattern>
      );
  }
}
