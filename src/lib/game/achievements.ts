import { UNITS } from "@/lib/curriculum/units";
import { levelFromTotalXp } from "./xp";

export type Achievement = {
  id: string;
  name: string;
  nameEnglish: string;
  description: string;
};

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: "first-step",       name: "Bước Đầu",         nameEnglish: "First Step",      description: "Complete your first lesson" },
  { id: "beginner",         name: "Tập Sự",           nameEnglish: "Beginner",        description: "Complete 5 lessons" },
  { id: "student",          name: "Học Sinh",         nameEnglish: "Student",         description: "Complete 10 lessons" },
  { id: "streak-3",         name: "Ba Ngày Liền",     nameEnglish: "3-Day Streak",    description: "Practice 3 days in a row" },
  { id: "streak-7",         name: "Tuần Vàng",        nameEnglish: "7-Day Streak",    description: "Practice 7 days in a row" },
  { id: "level-3",          name: "Tăng Bậc",         nameEnglish: "Level 3 Reached", description: "Reach Level 3" },
  { id: "level-5",          name: "Mở Khoá Kỹ Năng",  nameEnglish: "Skill Tree Unlocked", description: "Reach Level 5 and unlock the skill tree" },
  { id: "unit-u0-mastered", name: "Chinh Phục Mê Kông", nameEnglish: "Mekong Mastered", description: "Complete every lesson in Unit 0" },
  { id: "unit-u1-mastered", name: "Chinh Phục Sài Gòn", nameEnglish: "Sài Gòn Mastered", description: "Complete every lesson in Unit 1" },
  { id: "unit-u2-mastered", name: "Chinh Phục Đà Lạt",  nameEnglish: "Đà Lạt Mastered",  description: "Complete every lesson in Unit 2" },
  { id: "unit-u3-mastered", name: "Chinh Phục Hội An",  nameEnglish: "Hội An Mastered",  description: "Complete every lesson in Unit 3" },
  { id: "unit-u4-mastered", name: "Chinh Phục Đà Nẵng", nameEnglish: "Đà Nẵng Mastered", description: "Complete every lesson in Unit 4" },
];

export const ACHIEVEMENT_BY_ID: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);

type EvalContext = {
  totalXp: number;
  streakDays: number;
  completedLessonIds: ReadonlySet<string>;
};

/** Returns the full set of achievement IDs that should be considered earned given the context.
 *  Caller diffs against profiles.earnedAchievements to discover newly-earned IDs. */
export function evalEarnedAchievements(ctx: EvalContext): string[] {
  const earned: string[] = [];
  const lessonsCompleted = ctx.completedLessonIds.size;

  if (lessonsCompleted >= 1) earned.push("first-step");
  if (lessonsCompleted >= 5) earned.push("beginner");
  if (lessonsCompleted >= 10) earned.push("student");
  if (ctx.streakDays >= 3) earned.push("streak-3");
  if (ctx.streakDays >= 7) earned.push("streak-7");

  const level = levelFromTotalXp(ctx.totalXp).level;
  if (level >= 3) earned.push("level-3");
  if (level >= 5) earned.push("level-5");

  for (const u of UNITS) {
    if (u.lessons.length === 0) continue;
    if (u.lessons.every((l) => ctx.completedLessonIds.has(l.id))) {
      earned.push(`unit-${u.id}-mastered`);
    }
  }

  return earned;
}
