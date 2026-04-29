import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { levelFromTotalXp } from "@/lib/game/xp";
import { ConversationPractice } from "./ConversationPractice";

export default async function ConversationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile] = await db
    .select({ totalXp: profiles.totalXp, dialect: profiles.dialect, displayName: profiles.displayName })
    .from(profiles)
    .where(eq(profiles.id, user.id));
  if (!profile) redirect("/login");

  const { level } = levelFromTotalXp(profile.totalXp);

  return <ConversationPractice userLevel={level} dialect={profile.dialect} />;
}
