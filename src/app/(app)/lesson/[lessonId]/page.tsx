import { notFound } from "next/navigation";
import { getLesson } from "@/lib/curriculum/units";
import { Lesson } from "@/components/lesson/Lesson";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();

  return (
    <ErrorBoundary>
      <Lesson lesson={lesson} />
    </ErrorBoundary>
  );
}
