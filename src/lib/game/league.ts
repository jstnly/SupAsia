export type LeagueId =
  | "tra-da"
  | "tra-sua"
  | "bac-ha"
  | "hoa-mai"
  | "hoang-kim"
  | "thien-long";

export type League = {
  id: LeagueId;
  name: string;
  english: string;
  emoji: string;
  minXpWeekly: number; // minimum weekly XP to stay (avoid demotion)
  color: string;
};

export const LEAGUES: readonly League[] = [
  {
    id: "tra-da",
    name: "Trà Đá",
    english: "Iced Tea",
    emoji: "🫖",
    minXpWeekly: 0,
    color: "var(--color-river-mist)",
  },
  {
    id: "tra-sua",
    name: "Trà Sữa",
    english: "Milk Tea",
    emoji: "🧋",
    minXpWeekly: 50,
    color: "var(--color-gold-400)",
  },
  {
    id: "bac-ha",
    name: "Bạc Hà",
    english: "Mint",
    emoji: "🌿",
    minXpWeekly: 150,
    color: "var(--color-jade-500)",
  },
  {
    id: "hoa-mai",
    name: "Hoa Mai",
    english: "Apricot Blossom",
    emoji: "🌺",
    minXpWeekly: 400,
    color: "var(--color-lotus-500)",
  },
  {
    id: "hoang-kim",
    name: "Hoàng Kim",
    english: "Golden",
    emoji: "✨",
    minXpWeekly: 1000,
    color: "var(--color-gold-500)",
  },
  {
    id: "thien-long",
    name: "Thiên Long",
    english: "Celestial Dragon",
    emoji: "🐉",
    minXpWeekly: 2500,
    color: "var(--color-lotus-600)",
  },
];

export const LEAGUE_BY_ID: Record<LeagueId, League> = Object.fromEntries(
  LEAGUES.map((l) => [l.id, l]),
) as Record<LeagueId, League>;

export function getLeague(id: string): League {
  return LEAGUE_BY_ID[id as LeagueId] ?? LEAGUES[0];
}

/** Returns the next higher league, or null if already at top. */
export function nextLeague(id: LeagueId): League | null {
  const idx = LEAGUES.findIndex((l) => l.id === id);
  return idx >= 0 && idx < LEAGUES.length - 1 ? LEAGUES[idx + 1] : null;
}

/** Returns the next lower league, or null if already at bottom. */
export function prevLeague(id: LeagueId): League | null {
  const idx = LEAGUES.findIndex((l) => l.id === id);
  return idx > 0 ? LEAGUES[idx - 1] : null;
}
