import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

  // Find the next available lesson — first incomplete lesson in unlocked units (u0, u1).
  const completedSet = new Set(completedLessonIds);
  const nextLesson =
    UNITS.flatMap((u) => u.lessons)
      .find((l) => !completedSet.has(l.id) && (l.unitId === "u0" || l.unitId === "u1"));

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

      <WorldMap completedLessonIds={completedLessonIds} avatarVariant={profile.avatarVariant} />
    </div>
  );
}
