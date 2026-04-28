import Link from "next/link";
import { notFound } from "next/navigation";
import { Lesson } from "@/components/lesson/Lesson";
import { getLesson } from "@/lib/curriculum/units";

export default async function DemoLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();

  return (
    <div className="min-h-dvh bg-[var(--color-silk-cream)]">
      <div className="mx-auto max-w-2xl px-4 pt-3">
        <Link
          href="/demo"
          className="inline-block rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-display font-semibold text-[var(--color-lotus-600)]"
        >
          Demo mode · no save
        </Link>
      </div>
      <Lesson lesson={lesson} demoMode />
    </div>
  );
}
