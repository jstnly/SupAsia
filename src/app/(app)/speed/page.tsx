import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { UNITS } from "@/lib/curriculum/units";
import { PageHero } from "@/components/ui/PageHero";
import { SectionShell } from "@/components/ui/SectionShell";

export default function SpeedIndex() {
  return (
    <div className="space-y-6">
      <SectionShell section="speed">
        <PageHero
          section="speed"
          eyebrow="Speed Lesson · Tốc Độ"
          title="Race the clock"
          subtitle="45-second timer. +4 seconds for every correct answer. No hearts, no Tips — just go."
        />
      </SectionShell>

      {UNITS.map((unit) => (
        <div key={unit.id} className="card-soft p-5 space-y-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
              Unit {unit.order} · {unit.titleEnglish}
            </div>
            <h2 className="font-display text-xl font-bold">{unit.title}</h2>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {unit.lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link
                  href={`/speed/${lesson.id}`}
                  className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 hover:-translate-y-0.5 transition-transform"
                >
                  <div className="min-w-0">
                    <div className="font-display font-semibold">{lesson.title}</div>
                    <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                      {lesson.exercises.length} exercises
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-[var(--color-gold-500)]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
