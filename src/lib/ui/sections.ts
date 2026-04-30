// Section identity: each top-level route gets a distinct visual theme.
// Themes drive: page background tint, hero gradient, accent color, decorative
// pattern. Defined here so all UI primitives stay in sync.

export type SectionId =
  | "learn"
  | "duel"
  | "coop"
  | "conversation"
  | "shop"
  | "skills"
  | "speed"
  | "me"
  | "leaderboard"
  | "friends"
  | "boss"
  | "lesson";

export type SectionTheme = {
  id: SectionId;
  label: string;
  /** CSS color used as the dominant section accent */
  accent: string;
  /** Lighter shade for tinted card backgrounds */
  accentSoft: string;
  /** Stronger shade for hover/active */
  accentStrong: string;
  /** Hero gradient stops — `from` → `to` */
  heroFrom: string;
  heroTo: string;
  /** Background wash applied to the whole page */
  pageWashFrom: string;
  pageWashTo: string;
  /** Decorative SVG pattern id rendered behind hero */
  pattern: "lotus" | "wave" | "diamond" | "stars" | "spark" | "leaf" | "dot" | "ring";
  /** A short Vietnamese label shown in the hero eyebrow */
  vi: string;
  /** Optional emoji watermark for the hero */
  emoji?: string;
};

const THEMES: Record<SectionId, SectionTheme> = {
  learn: {
    id: "learn",
    label: "Learn",
    vi: "Học Tiếng Việt",
    accent: "var(--color-jade-500)",
    accentSoft: "var(--color-jade-100)",
    accentStrong: "var(--color-jade-700)",
    heroFrom: "var(--color-jade-400)",
    heroTo: "var(--color-jade-600)",
    pageWashFrom: "color-mix(in oklab, var(--color-jade-200) 30%, transparent)",
    pageWashTo: "color-mix(in oklab, var(--color-river-mist) 35%, transparent)",
    pattern: "leaf",
    emoji: "🗺️",
  },
  duel: {
    id: "duel",
    label: "Duel",
    vi: "Đấu Thanh",
    accent: "var(--color-tone-sac)",
    accentSoft: "color-mix(in oklab, var(--color-tone-sac) 12%, white)",
    accentStrong: "var(--color-lotus-700)",
    heroFrom: "var(--color-tone-sac)",
    heroTo: "var(--color-lotus-700)",
    pageWashFrom: "color-mix(in oklab, var(--color-lotus-200) 28%, transparent)",
    pageWashTo: "color-mix(in oklab, var(--color-tone-sac) 8%, transparent)",
    pattern: "spark",
    emoji: "⚔️",
  },
  coop: {
    id: "coop",
    label: "Đôi Bạn Học",
    vi: "Học Cùng Bạn",
    accent: "var(--color-jade-500)",
    accentSoft: "var(--color-jade-100)",
    accentStrong: "var(--color-jade-700)",
    heroFrom: "var(--color-jade-400)",
    heroTo: "var(--color-lotus-400)",
    pageWashFrom: "color-mix(in oklab, var(--color-jade-100) 50%, transparent)",
    pageWashTo: "color-mix(in oklab, var(--color-lotus-100) 40%, transparent)",
    pattern: "ring",
    emoji: "🤝",
  },
  conversation: {
    id: "conversation",
    label: "Hội Thoại",
    vi: "Trò Chuyện",
    accent: "var(--color-tone-huyen)",
    accentSoft: "color-mix(in oklab, var(--color-tone-huyen) 10%, white)",
    accentStrong: "var(--color-jade-700)",
    heroFrom: "var(--color-jade-500)",
    heroTo: "var(--color-tone-huyen)",
    pageWashFrom: "color-mix(in oklab, var(--color-jade-100) 35%, transparent)",
    pageWashTo: "color-mix(in oklab, var(--color-tone-huyen) 8%, transparent)",
    pattern: "wave",
    emoji: "💬",
  },
  shop: {
    id: "shop",
    label: "Shop",
    vi: "Cửa Hàng",
    accent: "var(--color-gold-500)",
    accentSoft: "var(--color-gold-100)",
    accentStrong: "var(--color-gold-700)",
    heroFrom: "var(--color-gold-400)",
    heroTo: "var(--color-gold-600)",
    pageWashFrom: "color-mix(in oklab, var(--color-gold-200) 30%, transparent)",
    pageWashTo: "color-mix(in oklab, var(--color-gold-100) 40%, transparent)",
    pattern: "diamond",
    emoji: "💎",
  },
  skills: {
    id: "skills",
    label: "Skills",
    vi: "Cây Kỹ Năng",
    accent: "var(--color-tone-nga)",
    accentSoft: "color-mix(in oklab, var(--color-tone-nga) 12%, white)",
    accentStrong: "var(--color-lotus-700)",
    heroFrom: "var(--color-tone-nga)",
    heroTo: "var(--color-lotus-600)",
    pageWashFrom: "color-mix(in oklab, var(--color-tone-nga) 10%, transparent)",
    pageWashTo: "color-mix(in oklab, var(--color-lotus-100) 30%, transparent)",
    pattern: "stars",
    emoji: "✨",
  },
  speed: {
    id: "speed",
    label: "Speed",
    vi: "Tốc Độ",
    accent: "var(--color-tone-hoi)",
    accentSoft: "color-mix(in oklab, var(--color-tone-hoi) 14%, white)",
    accentStrong: "var(--color-gold-700)",
    heroFrom: "var(--color-tone-hoi)",
    heroTo: "var(--color-gold-500)",
    pageWashFrom: "color-mix(in oklab, var(--color-tone-hoi) 14%, transparent)",
    pageWashTo: "color-mix(in oklab, var(--color-gold-200) 30%, transparent)",
    pattern: "spark",
    emoji: "⚡",
  },
  me: {
    id: "me",
    label: "Me",
    vi: "Hồ Sơ",
    accent: "var(--color-lotus-500)",
    accentSoft: "var(--color-lotus-100)",
    accentStrong: "var(--color-lacquer)",
    heroFrom: "var(--color-lacquer-soft)",
    heroTo: "var(--color-lotus-600)",
    pageWashFrom: "color-mix(in oklab, var(--color-lotus-100) 30%, transparent)",
    pageWashTo: "color-mix(in oklab, var(--color-river-mist) 28%, transparent)",
    pattern: "lotus",
    emoji: "🪷",
  },
  leaderboard: {
    id: "leaderboard",
    label: "Ranks",
    vi: "Bảng Xếp Hạng",
    accent: "var(--color-gold-500)",
    accentSoft: "var(--color-gold-100)",
    accentStrong: "var(--color-gold-700)",
    heroFrom: "var(--color-gold-500)",
    heroTo: "var(--color-tone-sac)",
    pageWashFrom: "color-mix(in oklab, var(--color-gold-100) 35%, transparent)",
    pageWashTo: "color-mix(in oklab, var(--color-lotus-100) 28%, transparent)",
    pattern: "stars",
    emoji: "🏆",
  },
  friends: {
    id: "friends",
    label: "Friends",
    vi: "Bạn Bè",
    accent: "var(--color-jade-500)",
    accentSoft: "var(--color-jade-100)",
    accentStrong: "var(--color-jade-700)",
    heroFrom: "var(--color-jade-400)",
    heroTo: "var(--color-jade-600)",
    pageWashFrom: "color-mix(in oklab, var(--color-jade-100) 40%, transparent)",
    pageWashTo: "color-mix(in oklab, var(--color-river-mist) 30%, transparent)",
    pattern: "ring",
    emoji: "👥",
  },
  boss: {
    id: "boss",
    label: "Boss",
    vi: "Trùm Thành Phố",
    accent: "var(--color-tone-sac)",
    accentSoft: "color-mix(in oklab, var(--color-tone-sac) 14%, white)",
    accentStrong: "var(--color-lacquer)",
    heroFrom: "var(--color-lacquer)",
    heroTo: "var(--color-tone-sac)",
    pageWashFrom: "color-mix(in oklab, var(--color-lacquer) 8%, transparent)",
    pageWashTo: "color-mix(in oklab, var(--color-tone-sac) 12%, transparent)",
    pattern: "spark",
    emoji: "👹",
  },
  lesson: {
    id: "lesson",
    label: "Lesson",
    vi: "Bài Học",
    accent: "var(--color-jade-500)",
    accentSoft: "var(--color-jade-100)",
    accentStrong: "var(--color-jade-700)",
    heroFrom: "var(--color-jade-400)",
    heroTo: "var(--color-jade-600)",
    pageWashFrom: "color-mix(in oklab, var(--color-jade-100) 30%, transparent)",
    pageWashTo: "color-mix(in oklab, var(--color-river-mist) 30%, transparent)",
    pattern: "leaf",
    emoji: "📖",
  },
};

export function getSectionTheme(id: SectionId): SectionTheme {
  return THEMES[id];
}

export function sectionFromPath(pathname: string): SectionId | null {
  // e.g. /learn → learn, /learn/u1 → learn, /boss/saigon → boss
  const seg = pathname.split("/").filter(Boolean)[0];
  if (!seg) return null;
  if (seg in THEMES) return seg as SectionId;
  return null;
}

export const SECTION_ORDER: SectionId[] = [
  "learn",
  "duel",
  "conversation",
  "leaderboard",
  "me",
];
