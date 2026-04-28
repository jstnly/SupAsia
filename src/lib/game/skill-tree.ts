import type { ExerciseKind } from "./types";

export type SkillBranch = "conversationalist" | "scholar" | "tone-master" | "storyteller";

export type SkillEffect =
  | { kind: "xp-multiplier"; appliesTo: ExerciseKind[]; multiplier: number }
  | { kind: "extra-heart"; appliesTo: ExerciseKind[] };

export type SkillNode = {
  id: string;
  branch: SkillBranch;
  position: number; // 1-6
  name: string;
  nameEnglish: string;
  description: string;
  effect: SkillEffect;
};

export const SKILL_BRANCHES: Record<
  SkillBranch,
  { name: string; nameEnglish: string; tagline: string; color: string }
> = {
  conversationalist: {
    name: "Đối Thoại",
    nameEnglish: "Conversationalist",
    tagline: "Speak with confidence",
    color: "var(--color-lotus-500)",
  },
  scholar: {
    name: "Học Giả",
    nameEnglish: "Scholar",
    tagline: "Read, write, recall",
    color: "var(--color-gold-500)",
  },
  "tone-master": {
    name: "Bậc Thầy Thanh",
    nameEnglish: "Tone Master",
    tagline: "Hit every tone clean",
    color: "var(--color-jade-500)",
  },
  storyteller: {
    name: "Người Kể Chuyện",
    nameEnglish: "Storyteller",
    tagline: "Listen, follow, retell",
    color: "var(--color-tone-huyen)",
  },
};

export const SKILL_TREE_UNLOCK_LEVEL = 5;

export const SKILL_NODES: readonly SkillNode[] = [
  // Conversationalist — speak focus
  { id: "c1", branch: "conversationalist", position: 1, name: "Lưỡi Mềm", nameEnglish: "Soft Tongue", description: "+5% XP on Speak exercises", effect: { kind: "xp-multiplier", appliesTo: ["speak"], multiplier: 1.05 } },
  { id: "c2", branch: "conversationalist", position: 2, name: "Tự Tin", nameEnglish: "Confidence", description: "+10% XP on Speak exercises", effect: { kind: "xp-multiplier", appliesTo: ["speak"], multiplier: 1.10 } },
  { id: "c3", branch: "conversationalist", position: 3, name: "Kể Chuyện", nameEnglish: "Storyteller", description: "+10% XP on Story exercises", effect: { kind: "xp-multiplier", appliesTo: ["story"], multiplier: 1.10 } },
  { id: "c4", branch: "conversationalist", position: 4, name: "Lưu Loát", nameEnglish: "Fluent", description: "+15% XP on Speak exercises", effect: { kind: "xp-multiplier", appliesTo: ["speak"], multiplier: 1.15 } },
  { id: "c5", branch: "conversationalist", position: 5, name: "Trao Đổi", nameEnglish: "Exchange", description: "+15% XP on Speak and Story", effect: { kind: "xp-multiplier", appliesTo: ["speak", "story"], multiplier: 1.15 } },
  { id: "c6", branch: "conversationalist", position: 6, name: "Người Bản Xứ", nameEnglish: "Native Speaker", description: "+1 heart in Speak/Story lessons", effect: { kind: "extra-heart", appliesTo: ["speak", "story"] } },

  // Scholar — translate / fill-blank / pair-match focus
  { id: "s1", branch: "scholar", position: 1, name: "Đọc Sách", nameEnglish: "Read Books", description: "+5% XP on Translate", effect: { kind: "xp-multiplier", appliesTo: ["translate"], multiplier: 1.05 } },
  { id: "s2", branch: "scholar", position: 2, name: "Trí Nhớ", nameEnglish: "Memory", description: "+10% XP on Pair-match", effect: { kind: "xp-multiplier", appliesTo: ["pair-match"], multiplier: 1.10 } },
  { id: "s3", branch: "scholar", position: 3, name: "Mở Rộng", nameEnglish: "Expand", description: "+10% XP on Fill-blank", effect: { kind: "xp-multiplier", appliesTo: ["fill-blank"], multiplier: 1.10 } },
  { id: "s4", branch: "scholar", position: 4, name: "Sâu Sắc", nameEnglish: "Deep Insight", description: "+15% XP on Translate and Fill-blank", effect: { kind: "xp-multiplier", appliesTo: ["translate", "fill-blank"], multiplier: 1.15 } },
  { id: "s5", branch: "scholar", position: 5, name: "Khám Phá", nameEnglish: "Explore", description: "+15% XP on Pair-match", effect: { kind: "xp-multiplier", appliesTo: ["pair-match"], multiplier: 1.15 } },
  { id: "s6", branch: "scholar", position: 6, name: "Học Giả", nameEnglish: "Scholar", description: "+1 heart in reading-heavy lessons", effect: { kind: "extra-heart", appliesTo: ["translate", "fill-blank", "pair-match"] } },

  // Tone Master — tone-match focus
  { id: "t1", branch: "tone-master", position: 1, name: "Tai Tinh", nameEnglish: "Sharp Ear", description: "+5% XP on Tone Match", effect: { kind: "xp-multiplier", appliesTo: ["tone-match"], multiplier: 1.05 } },
  { id: "t2", branch: "tone-master", position: 2, name: "Sáu Thanh", nameEnglish: "Six Tones", description: "+10% XP on Tone Match", effect: { kind: "xp-multiplier", appliesTo: ["tone-match"], multiplier: 1.10 } },
  { id: "t3", branch: "tone-master", position: 3, name: "Vững Vàng", nameEnglish: "Steady", description: "+10% XP on Speak", effect: { kind: "xp-multiplier", appliesTo: ["speak"], multiplier: 1.10 } },
  { id: "t4", branch: "tone-master", position: 4, name: "Phân Biệt", nameEnglish: "Distinguish", description: "+15% XP on Tone Match", effect: { kind: "xp-multiplier", appliesTo: ["tone-match"], multiplier: 1.15 } },
  { id: "t5", branch: "tone-master", position: 5, name: "Bậc Thầy", nameEnglish: "Master", description: "+20% XP on Tone Match and Speak", effect: { kind: "xp-multiplier", appliesTo: ["tone-match", "speak"], multiplier: 1.20 } },
  { id: "t6", branch: "tone-master", position: 6, name: "Âm Vực", nameEnglish: "Tonal Range", description: "+1 heart in Tone Match/Speak lessons", effect: { kind: "extra-heart", appliesTo: ["tone-match", "speak"] } },

  // Storyteller — listen / story focus
  { id: "st1", branch: "storyteller", position: 1, name: "Lắng Nghe", nameEnglish: "Attentive Listening", description: "+5% XP on Listen", effect: { kind: "xp-multiplier", appliesTo: ["listen"], multiplier: 1.05 } },
  { id: "st2", branch: "storyteller", position: 2, name: "Hiểu Ý", nameEnglish: "Comprehension", description: "+10% XP on Listen", effect: { kind: "xp-multiplier", appliesTo: ["listen"], multiplier: 1.10 } },
  { id: "st3", branch: "storyteller", position: 3, name: "Đọc Hiểu", nameEnglish: "Read & Understand", description: "+10% XP on Story", effect: { kind: "xp-multiplier", appliesTo: ["story"], multiplier: 1.10 } },
  { id: "st4", branch: "storyteller", position: 4, name: "Đối Thoại", nameEnglish: "Dialogue", description: "+15% XP on Listen and Story", effect: { kind: "xp-multiplier", appliesTo: ["listen", "story"], multiplier: 1.15 } },
  { id: "st5", branch: "storyteller", position: 5, name: "Phong Cách", nameEnglish: "Style", description: "+20% XP on Story", effect: { kind: "xp-multiplier", appliesTo: ["story"], multiplier: 1.20 } },
  { id: "st6", branch: "storyteller", position: 6, name: "Người Kể", nameEnglish: "Narrator", description: "+1 heart in Story/Listen lessons", effect: { kind: "extra-heart", appliesTo: ["listen", "story"] } },
];

export const NODE_BY_ID: Record<string, SkillNode> = Object.fromEntries(
  SKILL_NODES.map((n) => [n.id, n]),
);

export const BRANCH_NODES: Record<SkillBranch, SkillNode[]> = {
  conversationalist: SKILL_NODES.filter((n) => n.branch === "conversationalist").sort((a, b) => a.position - b.position),
  scholar: SKILL_NODES.filter((n) => n.branch === "scholar").sort((a, b) => a.position - b.position),
  "tone-master": SKILL_NODES.filter((n) => n.branch === "tone-master").sort((a, b) => a.position - b.position),
  storyteller: SKILL_NODES.filter((n) => n.branch === "storyteller").sort((a, b) => a.position - b.position),
};

/** Total skill points granted by a level. 1 SP at L5, +1 per level after. */
export function totalSkillPoints(level: number): number {
  return Math.max(0, level - SKILL_TREE_UNLOCK_LEVEL + 1);
}

export function availableSkillPoints(level: number, unlockedCount: number): number {
  return Math.max(0, totalSkillPoints(level) - unlockedCount);
}

/** A node is unlockable iff it's not unlocked and its branch predecessor is unlocked. */
export function canUnlock(nodeId: string, unlocked: ReadonlySet<string>): boolean {
  const node = NODE_BY_ID[nodeId];
  if (!node) return false;
  if (unlocked.has(nodeId)) return false;
  if (node.position === 1) return true;
  const predecessor = BRANCH_NODES[node.branch][node.position - 2];
  return predecessor ? unlocked.has(predecessor.id) : false;
}

/** Multiplier on per-exercise XP. Effects stack multiplicatively. */
export function xpMultiplierFor(
  exerciseKind: ExerciseKind,
  unlockedNodeIds: readonly string[],
): number {
  let mul = 1;
  for (const id of unlockedNodeIds) {
    const node = NODE_BY_ID[id];
    if (!node) continue;
    if (node.effect.kind === "xp-multiplier" && node.effect.appliesTo.includes(exerciseKind)) {
      mul *= node.effect.multiplier;
    }
  }
  return mul;
}

/** Bonus hearts granted by capstone nodes for a lesson, given the kinds present. */
export function bonusHeartsFor(
  exerciseKinds: readonly ExerciseKind[],
  unlockedNodeIds: readonly string[],
): number {
  const kindSet = new Set(exerciseKinds);
  let bonus = 0;
  for (const id of unlockedNodeIds) {
    const node = NODE_BY_ID[id];
    if (!node || node.effect.kind !== "extra-heart") continue;
    if (node.effect.appliesTo.some((k) => kindSet.has(k))) bonus += 1;
  }
  return bonus;
}
