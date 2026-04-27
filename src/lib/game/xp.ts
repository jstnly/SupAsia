export const STAT_KEYS = [
  "thinh",
  "khau",
  "van",
  "but",
  "tuVung",
  "thanhDieu",
  "nguPhap",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

export const STAT_META: Record<
  StatKey,
  { name: string; english: string; description: string; color: string }
> = {
  thinh: { name: "Thính", english: "Listening", description: "Ear training", color: "var(--color-tone-huyen)" },
  khau: { name: "Khẩu", english: "Speaking", description: "Pronunciation", color: "var(--color-tone-sac)" },
  van: { name: "Văn", english: "Reading", description: "Decoding text", color: "var(--color-tone-nang)" },
  but: { name: "Bút", english: "Writing", description: "Production", color: "var(--color-tone-nga)" },
  tuVung: { name: "Từ Vựng", english: "Vocabulary", description: "Word breadth", color: "var(--color-gold-500)" },
  thanhDieu: { name: "Thanh Điệu", english: "Tone Mastery", description: "Tone accuracy", color: "var(--color-tone-hoi)" },
  nguPhap: { name: "Ngữ Pháp", english: "Grammar", description: "Structure", color: "var(--color-jade-500)" },
};

export function xpRequiredFor(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.6));
}

export function totalXpToReach(level: number): number {
  let sum = 0;
  for (let l = 1; l < level; l++) sum += xpRequiredFor(l);
  return sum;
}

export function levelFromTotalXp(totalXp: number): {
  level: number;
  intoLevel: number;
  needed: number;
  progress: number;
} {
  let level = 1;
  let acc = 0;
  while (true) {
    const needed = xpRequiredFor(level);
    if (acc + needed > totalXp) {
      return {
        level,
        intoLevel: totalXp - acc,
        needed,
        progress: (totalXp - acc) / needed,
      };
    }
    acc += needed;
    level += 1;
    if (level > 999) break;
  }
  return { level, intoLevel: 0, needed: 1, progress: 0 };
}

export const LEVEL_UNLOCKS: Record<number, string> = {
  5: "Skill Tree",
  10: "First Equipment Slot",
  15: "Pets (Linh Thú)",
  25: "Northern Dialect Pack",
  50: "Prestige (Tái Sinh)",
};
