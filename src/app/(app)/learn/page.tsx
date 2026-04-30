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
import { PageHero } from "@/components/ui/PageHero";
import { SectionShell } from "@/components/ui/SectionShell";

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

  const totalLessons = UNITS.reduce((n, u) => n + u.lessons.length, 0);
  const completedCount = completedLessonIds.length;

  return (
    <div className="space-y-6">
      <SectionShell section="learn">
        <PageHero
          section="learn"
          title={nextLesson ? `Continue: ${nextLesson.title}` : "All caught up!"}
          subtitle={nextLesson ? nextLesson.titleEnglish : "More units arriving soon — explore the world map below."}
          actions={
            nextLesson && (
              <Link href={`/lesson/${nextLesson.id}`}>
                <Button className="gap-2 bg-white text-[var(--color-jade-700)] hover:bg-white/90">
                  Start lesson <ArrowRight size={18} />
                </Button>
              </Link>
            )
          }
          meta={
            <div className="text-center">
              <div className="text-[10px] font-display uppercase tracking-wider text-white/80">Progress</div>
              <div className="font-display text-2xl font-extrabold">{completedCount}<span className="text-sm text-white/70">/{totalLessons}</span></div>
              <div className="text-[10px] text-white/70">lessons</div>
            </div>
          }
        />
      </SectionShell>

      {/* Speed lesson — themed accent */}
      <Link
        href="/speed"
        className="card-soft flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5 hover:border-[var(--color-tone-hoi)]"
      >
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[var(--color-tone-hoi)] to-[var(--color-gold-500)] text-white shadow-[0_4px_10px_-4px_var(--color-tone-hoi)]">
          <Zap size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm font-bold">Speed Lesson · Tốc Độ</div>
          <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            Race the clock — 45s timer, +4s per correct
          </div>
        </div>
        <ArrowRight size={18} className="text-[var(--color-tone-hoi)]" />
      </Link>

      {/* Adaptive focus */}
      {focusLessons.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--color-lotus-100)] text-[var(--color-lotus-600)]">
              <Brain size={14} />
            </div>
            <h2 className="font-display font-bold text-sm">Focus Practice</h2>
            <span className="text-[10px] text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">· Luyện tập có mục tiêu</span>
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
        </section>
      )}

      <section>
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="font-display font-bold text-sm">World Map</h2>
          <span className="text-[10px] text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">· Bản đồ Việt Nam</span>
        </div>
        <WorldMap completedLessonIds={completedLessonIds} avatarVariant={profile.avatarVariant} />
      </section>
    </div>
  );
}
