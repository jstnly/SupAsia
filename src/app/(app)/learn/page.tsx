import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles, progress } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { WorldMap } from "@/components/map/WorldMap";
import { UNITS } from "@/lib/curriculum/units";
import { Button } from "@/components/ui/button";

export default async function LearnPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
  if (!profile) redirect("/login");

  const completedRows = await db
    .select({ lessonId: progress.lessonId, status: progress.status })
    .from(progress)
    .where(eq(progress.userId, user.id));
  const completedLessonIds = completedRows.filter((r) => r.status === "completed").map((r) => r.lessonId);

  // Find the next available lesson — first incomplete lesson in any unit whose
  // predecessors are all completed (the same gating as WorldMap).
  const completedSet = new Set(completedLessonIds);
  const availableUnitIds = new Set<string>();
  let allPrevComplete = true;
  for (const u of UNITS) {
    if (allPrevComplete) availableUnitIds.add(u.id);
    if (!u.lessons.every((l) => completedSet.has(l.id))) allPrevComplete = false;
  }
  const nextLesson =
    UNITS.flatMap((u) => u.lessons)
      .find((l) => !completedSet.has(l.id) && availableUnitIds.has(l.unitId));

  return (
    <div className="space-y-6">
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

      <WorldMap completedLessonIds={completedLessonIds} avatarVariant={profile.avatarVariant} />
    </div>
  );
}
