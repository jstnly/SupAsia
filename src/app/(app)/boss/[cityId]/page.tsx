import { notFound } from "next/navigation";
import { BOSS_BY_CITY } from "@/lib/game/bosses";
import { BossEncounter } from "./BossEncounter";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { levelFromTotalXp } from "@/lib/game/xp";

export default async function BossPage({
  params,
}: {
  params: Promise<{ cityId: string }>;
}) {
  const { cityId } = await params;
  const boss = BOSS_BY_CITY[cityId];
  if (!boss) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [profile] = await db
    .select({ totalXp: profiles.totalXp })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  const level = profile ? levelFromTotalXp(profile.totalXp).level : 1;

  return <BossEncounter boss={boss} userLevel={level} />;
}
