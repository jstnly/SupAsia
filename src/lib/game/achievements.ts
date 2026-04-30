import { UNITS } from "@/lib/curriculum/units";
import { levelFromTotalXp } from "./xp";

export type Achievement = {
  id: string;
  name: string;
  nameEnglish: string;
  description: string;
};

export const ACHIEVEMENTS: readonly Achievement[] = [
  // ── Progress ──
  { id: "first-step",        name: "Bước Đầu",          nameEnglish: "First Step",          description: "Complete your first lesson" },
  { id: "beginner",          name: "Tập Sự",             nameEnglish: "Beginner",            description: "Complete 5 lessons" },
  { id: "student",           name: "Học Sinh",           nameEnglish: "Student",             description: "Complete 10 lessons" },
  { id: "scholar",           name: "Học Giả",            nameEnglish: "Scholar",             description: "Complete 25 lessons" },
  { id: "master",            name: "Bậc Thầy",           nameEnglish: "Master",              description: "Complete 50 lessons" },
  // ── Streaks ──
  { id: "streak-3",          name: "Ba Ngày Liền",       nameEnglish: "3-Day Streak",        description: "Practice 3 days in a row" },
  { id: "streak-7",          name: "Tuần Vàng",          nameEnglish: "7-Day Streak",        description: "Practice 7 days in a row" },
  { id: "streak-30",         name: "Tháng Kiên Trì",     nameEnglish: "30-Day Streak",       description: "Practice 30 days in a row" },
  // ── Levels ──
  { id: "level-3",           name: "Tăng Bậc",           nameEnglish: "Level 3 Reached",     description: "Reach Level 3" },
  { id: "level-5",           name: "Mở Khoá Kỹ Năng",   nameEnglish: "Skill Tree Unlocked", description: "Reach Level 5 and unlock the skill tree" },
  { id: "level-10",          name: "Đẳng Cấp 10",        nameEnglish: "Level 10",            description: "Reach Level 10" },
  { id: "level-25",          name: "Phương Ngữ Bắc",     nameEnglish: "Northern Pack",       description: "Reach Level 25 and unlock the Northern dialect" },
  // ── Social ──
  { id: "first-duel",        name: "Chiến Binh Đầu",    nameEnglish: "First Duel",          description: "Complete your first Tone Duel" },
  { id: "duel-winner",       name: "Đấu Thủ",           nameEnglish: "Duel Champion",       description: "Win a Tone Duel" },
  { id: "coop-debut",        name: "Đôi Bạn",           nameEnglish: "Study Pair",          description: "Complete a Co-op lesson" },
  // ── City mastery ──
  { id: "unit-u0-mastered",  name: "Chinh Phục Mê Kông", nameEnglish: "Mekong Mastered",     description: "Complete every lesson in Unit 0" },
  { id: "unit-u1-mastered",  name: "Chinh Phục Sài Gòn", nameEnglish: "Sài Gòn Mastered",   description: "Complete every lesson in Unit 1" },
  { id: "unit-u2-mastered",  name: "Chinh Phục Đà Lạt",  nameEnglish: "Đà Lạt Mastered",    description: "Complete every lesson in Unit 2" },
  { id: "unit-u3-mastered",  name: "Chinh Phục Hội An",  nameEnglish: "Hội An Mastered",    description: "Complete every lesson in Unit 3" },
  { id: "unit-u4-mastered",  name: "Chinh Phục Đà Nẵng", nameEnglish: "Đà Nẵng Mastered",   description: "Complete every lesson in Unit 4" },
  { id: "unit-u5-mastered",  name: "Chinh Phục Huế",     nameEnglish: "Huế Mastered",       description: "Complete every lesson in Unit 5" },
  { id: "unit-u8-mastered",  name: "Chinh Phục Hà Nội",  nameEnglish: "Hà Nội Mastered",    description: "Complete every lesson in Unit 8" },
  { id: "unit-u12-mastered", name: "Đỉnh Fansipan",      nameEnglish: "Summit Reached",     description: "Complete every lesson in Unit 12 — the roof of Indochina" },
  // ── Mastery ──
  { id: "perfect-lesson",    name: "Hoàn Hảo",          nameEnglish: "Perfect Lesson",      description: "Complete a lesson without a single mistake" },
  { id: "shop-first",        name: "Khách Hàng Đầu",    nameEnglish: "First Purchase",      description: "Buy your first item from the shop" },
];

export const ACHIEVEMENT_BY_ID: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);

type EvalContext = {
  totalXp: number;
  streakDays: number;
  completedLessonIds: ReadonlySet<string>;
  wonDuels?: number;
  completedDuels?: number;
  coopLessons?: number;
  perfectLessons?: number;
  purchaseCount?: number;
};

/** Returns the full set of achievement IDs that should be considered earned given the context.
 *  Caller diffs against profiles.earnedAchievements to discover newly-earned IDs. */
export function evalEarnedAchievements(ctx: EvalContext): string[] {
  const earned: string[] = [];
  const lessonsCompleted = ctx.completedLessonIds.size;

  // Progress
  if (lessonsCompleted >= 1)  earned.push("first-step");
  if (lessonsCompleted >= 5)  earned.push("beginner");
  if (lessonsCompleted >= 10) earned.push("student");
  if (lessonsCompleted >= 25) earned.push("scholar");
  if (lessonsCompleted >= 50) earned.push("master");

  // Streaks
  if (ctx.streakDays >= 3)  earned.push("streak-3");
  if (ctx.streakDays >= 7)  earned.push("streak-7");
  if (ctx.streakDays >= 30) earned.push("streak-30");

  // Levels
  const level = levelFromTotalXp(ctx.totalXp).level;
  if (level >= 3)  earned.push("level-3");
  if (level >= 5)  earned.push("level-5");
  if (level >= 10) earned.push("level-10");
  if (level >= 25) earned.push("level-25");

  // Social
  if ((ctx.completedDuels ?? 0) >= 1) earned.push("first-duel");
  if ((ctx.wonDuels ?? 0) >= 1)       earned.push("duel-winner");
  if ((ctx.coopLessons ?? 0) >= 1)    earned.push("coop-debut");

  // City mastery
  for (const u of UNITS) {
    if (u.lessons.length === 0) continue;
    if (u.lessons.every((l) => ctx.completedLessonIds.has(l.id))) {
      earned.push(`unit-${u.id}-mastered`);
    }
  }

  // Mastery
  if ((ctx.perfectLessons ?? 0) >= 1) earned.push("perfect-lesson");
  if ((ctx.purchaseCount ?? 0) >= 1)  earned.push("shop-first");

  return earned;
}
