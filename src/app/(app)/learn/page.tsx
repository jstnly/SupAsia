import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Zap, Brain } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles, progress, stats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { WorldMap } from "@/components/map/WorldMap";
import { UNITS } from "@/lib/curriculum/units";
import { STAT_META } from "@/lib/game/xp";
import { getFocusLessons } from "@/lib/game/adaptive";
import { Button } from "@/components/ui/button";

export default async function LearnPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
  if (!profile) redirect("/login");

  const [statRow] = await db.select().from(stats).where(eq(stats.userId, user.id));

  const progressRows = await db
    .select({ lessonId: progress.lessonId, status: progress.status })
    .from(progress)
    .where(eq(progress.userId, user.id));

  const completedLessonIds = progressRows.filter((r) => r.status === "completed" || r.status === "mastered").map((r) => r.lessonId);
  const masteredIds = new Set(progressRows.filter((r) => r.status === "mastered").map((r) => r.lessonId));
  const completedSet = new Set(completedLessonIds);

  // Compute available unit IDs (same gate as WorldMap)
  const availableUnitIds = new Set<string>();
  let allPrevComplete = true;
  for (const u of UNITS) {
    if (allPrevComplete) availableUnitIds.add(u.id);
    if (!u.lessons.every((l) => completedSet.has(l.id))) allPrevComplete = false;
  }

  // Next lesson to continue
  const nextLesson = UNITS.flatMap((u) => u.lessons)
    .find((l) => !completedSet.has(l.id) && availableUnitIds.has(l.unitId));

  // Adaptive focus recommendations
  const statScores = {
    thinh: statRow?.thinh ?? 0,
    khau: statRow?.khau ?? 0,
    van: statRow?.van ?? 0,
    but: statRow?.but ?? 0,
    tuVung: statRow?.tuVung ?? 0,
    thanhDieu: statRow?.thanhDieu ?? 0,
    nguPhap: statRow?.nguPhap ?? 0,
  };
  const hasAnyStats = Object.values(statScores).some((v) => v > 0);
  const focusLessons = hasAnyStats
    ? getFocusLessons(UNITS, statScores, completedSet, masteredIds, availableUnitIds, 3)
    : [];

  return (
    <div className="space-y-6">
      {/* Continue banner */}
      <div className="card-soft flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">Continue your journey</div>
          <h1 className="font-display text-xl font-bold">
            {nextLesson ? nextLesson.title : "All caught up — more units coming!"}
          </h1>
          {nextLesson && (
            <div className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">{nextLesson.titleEnglish}</div>
          )}
        </div>
        {nextLesson && (
          <Link href={`/lesson/${nextLesson.id}`}>
            <Button className="gap-2">Start lesson <ArrowRight size={18} /></Button>
          </Link>
        )}
      </div>

      {/* Speed lesson */}
      <Link
        href="/speed"
        className="card-soft flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5"
      >
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-gold-400)] to-[var(--color-lotus-400)] text-white">
          <Zap size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm font-bold">Speed Lesson · Tốc Độ</div>
          <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            Race the clock — 45s timer, +4s per correct
          </div>
        </div>
        <ArrowRight size={16} className="text-[var(--color-gold-500)]" />
      </Link>

      {/* Adaptive focus */}
      {focusLessons.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-[var(--color-lotus-500)]" />
            <h2 className="font-display font-bold text-sm">Focus Practice · Luyện Tập Có Mục Tiêu</h2>
          </div>
          <p className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)] -mt-1">
            Tailored to your weakest skills
          </p>
          <div className="space-y-2">
            {focusLessons.map(({ lesson, unit, targetStat, reason }) => {
              const meta = STAT_META[targetStat];
              return (
                <Link
                  key={lesson.id}
                  href={`/lesson/${lesson.id}`}
                  className="card-soft flex items-center gap-3 p-3 hover:border-[var(--color-lotus-300)] hover:bg-[var(--color-lotus-50)] transition-colors"
                >
                  <div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white text-xs font-bold"
                    style={{ background: meta.color }}
                  >
                    {meta.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-semibold text-sm truncate">{lesson.title}</div>
                    <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
                      {unit.titleEnglish} · {reason}
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[var(--color-lotus-400)] shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <WorldMap completedLessonIds={completedLessonIds} avatarVariant={profile.avatarVariant} />
    </div>
  );
}
