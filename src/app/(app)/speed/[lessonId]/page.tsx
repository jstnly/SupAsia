import { notFound } from "next/navigation";
import { Lesson } from "@/components/lesson/Lesson";
import { getLesson } from "@/lib/curriculum/units";

export default async function SpeedLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  return <Lesson lesson={lesson} mode="speed" />;
}
