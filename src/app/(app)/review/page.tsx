import Link from "next/link";
import { ArrowRight, Brain, Calendar, CheckCircle2, Sparkles } from "lucide-react";
import { getDueReviews, getReviewSummary } from "@/server/actions/study";
import { UNITS } from "@/lib/curriculum/units";
import { PageHero } from "@/components/ui/PageHero";
import { SectionShell } from "@/components/ui/SectionShell";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const [due, summary] = await Promise.all([getDueReviews(50), getReviewSummary()]);

  // Hydrate lesson metadata
  const allLessons = UNITS.flatMap((u) => u.lessons.map((l) => ({ ...l, unitTitle: u.titleEnglish })));
  const lessonMeta = new Map(allLessons.map((l) => [l.id, l]));
  const dueWithMeta = due
    .map((r) => ({ ...r, lesson: lessonMeta.get(r.lessonId) }))
    .filter((r) => r.lesson);

  return (
    <div className="space-y-6">
      <SectionShell section="learn">
        <PageHero
          section="learn"
          eyebrow="Daily Review · Ôn Tập"
          title={dueWithMeta.length === 0 ? "All caught up!" : `${dueWithMeta.length} lesson${dueWithMeta.length === 1 ? "" : "s"} due for review`}
          subtitle="Spaced repetition resurfaces lessons at the perfect moment to fight the forgetting curve. Even a 5-minute daily review beats hour-long cram sessions."
          emoji="🧠"
        />
      </SectionShell>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile
          label="Due now"
          value={summary.dueNow}
          accent="var(--color-tone-sac)"
          icon={<Brain size={14} />}
        />
        <SummaryTile
          label="Learning"
          value={summary.learning}
          accent="var(--color-tone-hoi)"
          icon={<Sparkles size={14} />}
        />
        <SummaryTile
          label="Reviewing"
          value={summary.reviewing}
          accent="var(--color-jade-500)"
          icon={<Calendar size={14} />}
        />
        <SummaryTile
          label="Mastered"
          value={summary.mastered}
          accent="var(--color-gold-500)"
          icon={<CheckCircle2 size={14} />}
        />
      </div>

      {dueWithMeta.length === 0 ? (
        <div className="card-soft p-8 text-center">
          <div className="text-4xl">🎉</div>
          <h2 className="mt-3 font-display text-xl font-bold">Nothing due right now</h2>
          <p className="mt-1.5 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_65%,transparent)]">
            Come back tomorrow — your reviews will be ready. Or learn a new lesson to add it
            to the schedule.
          </p>
          <Link
            href="/learn"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-jade-500)] px-5 py-2.5 font-display text-sm font-bold text-white shadow-[0_3px_0_0_var(--color-jade-700)] hover:-translate-y-0.5 transition-transform"
          >
            Back to lessons <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display font-bold text-sm">Review queue</h2>
            <span className="text-[10px] text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
              · oldest first
            </span>
          </div>
          <ul className="space-y-2">
            {dueWithMeta.map(({ lesson, intervalDays, lapses, stage, nextReviewAt }) => {
              if (!lesson) return null;
              const overdue = nextReviewAt && Date.now() - new Date(nextReviewAt).getTime() > 86400000;
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/lesson/${lesson.id}`}
                    className="card-soft flex items-center gap-3 p-3 hover:-translate-y-0.5 transition-transform hover:border-[var(--color-jade-300)]"
                  >
                    <div
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-white text-xs font-bold"
                      style={{ background: STAGE_COLOR[stage] }}
                      title={`${stage} stage`}
                    >
                      {STAGE_EMOJI[stage]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-semibold truncate">{lesson.title}</div>
                      <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
                        {lesson.titleEnglish} · {lesson.unitTitle}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className="text-[10px] font-display font-bold uppercase tracking-wider"
                        style={{ color: overdue ? "var(--color-tone-sac)" : "var(--color-jade-700)" }}
                      >
                        {overdue ? "Overdue" : "Due"}
                      </div>
                      <div className="text-[10px] text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
                        {intervalDays === 0 ? "today" : `every ${intervalDays}d`}
                        {lapses > 0 && <> · {lapses} lapse{lapses === 1 ? "" : "s"}</>}
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-[var(--color-jade-500)] shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 rounded-2xl bg-[color-mix(in_oklab,var(--color-jade-500)_8%,white)] p-4 text-xs text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]">
            💡 <strong>Tip:</strong> Be honest with the rating after each lesson. Tapping
            &ldquo;Easy&rdquo; for everything looks productive but the algorithm pushes those
            items out so far you&apos;ll have forgotten them by the next review.
          </div>
        </section>
      )}
    </div>
  );
}

const STAGE_COLOR = {
  new: "var(--color-river-mist)",
  learning: "var(--color-tone-hoi)",
  review: "var(--color-jade-500)",
  mastered: "var(--color-gold-500)",
} as const;

const STAGE_EMOJI = {
  new: "✨",
  learning: "📖",
  review: "🔁",
  mastered: "🏆",
} as const;

function SummaryTile({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: number;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl bg-white p-3 text-center"
      style={{
        border: `1px solid color-mix(in oklab, ${accent} 22%, transparent)`,
        boxShadow: `0 1px 0 rgba(26,20,35,0.04), 0 8px 16px -10px color-mix(in oklab, ${accent} 35%, transparent)`,
      }}
    >
      <div
        className="inline-flex items-center gap-1 text-[10px] font-display font-bold uppercase tracking-wider"
        style={{ color: accent }}
      >
        {icon} {label}
      </div>
      <div className="mt-0.5 font-display text-2xl font-extrabold tabular-nums">{value}</div>
    </div>
  );
}
