import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { UNITS } from "@/lib/curriculum/units";

export default function DemoIndex() {
  return (
    <div className="min-h-dvh bg-[var(--color-silk-cream)] px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
            Demo mode
          </div>
          <h1 className="font-display text-3xl font-extrabold">Try a lesson</h1>
          <p className="mt-2 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]">
            No login, no save. Pick any lesson and play it through. Mic and audio work normally
            (Web Speech / Web Audio in the browser).
          </p>
        </div>

        {UNITS.map((unit) => (
          <div key={unit.id} className="card-soft p-5 space-y-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
                Unit {unit.order} · {unit.titleEnglish}
              </div>
              <h2 className="font-display text-xl font-bold">{unit.title}</h2>
              <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                {unit.description}
              </p>
            </div>
            <ul className="space-y-2">
              {unit.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/demo/${lesson.id}`}
                    className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 hover:-translate-y-0.5 transition-transform"
                  >
                    <div className="min-w-0">
                      <div className="font-display font-semibold">{lesson.title}</div>
                      <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                        {lesson.titleEnglish} · {lesson.exercises.length} exercises ·{" "}
                        {lesson.xpReward} XP
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-[var(--color-lotus-600)]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
