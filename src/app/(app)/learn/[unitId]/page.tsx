import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Lock, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { progress } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getUnit, CITIES } from "@/lib/curriculum/units";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/PageHero";
import { SectionShell } from "@/components/ui/SectionShell";
import { BackLink } from "@/components/ui/BackLink";

export default async function UnitPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const unit = getUnit(unitId);
  if (!unit) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const completedSet = new Set<string>();
  if (user) {
    const rows = await db
      .select({ lessonId: progress.lessonId, status: progress.status })
      .from(progress)
      .where(eq(progress.userId, user.id));
    rows.filter((r) => r.status === "completed").forEach((r) => completedSet.add(r.lessonId));
  }

  const city = CITIES.find((c) => c.unitId === unit.id);

  const completedCount = unit.lessons.filter((l) => completedSet.has(l.id)).length;

  return (
    <div className="space-y-6">
      <SectionShell section="learn">
        <BackLink href="/learn" label="World Map" />
        <div className="mt-3">
          <PageHero
            section="learn"
            eyebrow={`Unit ${unit.order}${city ? ` · ${city.englishName}` : ""}`}
            title={unit.title}
            subtitle={`${unit.titleEnglish} — ${unit.description}`}
            meta={
              <div className="text-center">
                <div className="text-[10px] font-display uppercase tracking-wider text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">Progress</div>
                <div className="font-display text-2xl font-extrabold">{completedCount}<span className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">/{unit.lessons.length}</span></div>
                <div className="text-[10px] text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">lessons</div>
              </div>
            }
          />
        </div>
      </SectionShell>

      <ol className="space-y-3">
        {unit.lessons.map((lesson, i) => {
          const done = completedSet.has(lesson.id);
          const prevDone = i === 0 || completedSet.has(unit.lessons[i - 1]!.id);
          const locked = !done && !prevDone;
          return (
            <li key={lesson.id}>
              <div
                className={`card-soft flex items-center justify-between gap-3 p-4 ${
                  locked ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-full ${
                      done
                        ? "bg-[var(--color-jade-400)] text-white"
                        : locked
                        ? "bg-[color-mix(in_oklab,var(--color-lacquer)_8%,transparent)] text-[color-mix(in_oklab,var(--color-lacquer)_50%,transparent)]"
                        : "bg-[var(--color-lotus-400)] text-white"
                    }`}
                  >
                    {done ? <Check size={18} /> : locked ? <Lock size={16} /> : <Star size={18} className="fill-white" />}
                  </div>
                  <div>
                    <div className="font-display font-semibold">{lesson.title}</div>
                    <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
                      {lesson.titleEnglish} · +{lesson.xpReward} XP
                    </div>
                  </div>
                </div>
                {locked ? (
                  <div className="text-xs">Finish previous</div>
                ) : (
                  <Link href={`/lesson/${lesson.id}`}>
                    <Button size="sm" variant={done ? "secondary" : "default"} className="gap-1">
                      {done ? "Replay" : "Start"} <ArrowRight size={14} />
                    </Button>
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
