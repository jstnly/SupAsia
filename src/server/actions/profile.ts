"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { levelFromTotalXp } from "@/lib/game/xp";

export async function completeOnboarding(input: {
  displayName: string;
  avatarVariant: number;
  starterBuff: "listener" | "speaker" | "reader";
  motivation: "family" | "travel" | "heritage" | "fun";
  dailyGoalMinutes: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  await db
    .update(profiles)
    .set({
      displayName: input.displayName,
      avatarVariant: input.avatarVariant,
      starterBuff: input.starterBuff,
      motivation: input.motivation,
      dailyGoalMinutes: input.dailyGoalMinutes,
      onboardedAt: new Date(),
    })
    .where(eq(profiles.id, user.id));

  revalidatePath("/learn");
  revalidatePath("/me");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

/** Toggle between southern and northern dialect. Northern requires L25. */
export async function setDialect(
  dialect: "southern" | "northern",
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "not authenticated" };

  const [profile] = await db
    .select({ totalXp: profiles.totalXp })
    .from(profiles)
    .where(eq(profiles.id, user.id));
  if (!profile) return { success: false, error: "profile not found" };

  const level = levelFromTotalXp(profile.totalXp).level;
  if (dialect === "northern" && level < 25) {
    return { success: false, error: "Reach Level 25 to unlock the Northern dialect pack." };
  }

  await db.update(profiles).set({ dialect }).where(eq(profiles.id, user.id));
  revalidatePath("/me");
  return { success: true };
}

/** Update daily goal (5, 10, 15, 20, or 30 min). */
export async function setDailyGoal(
  minutes: number,
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await db.update(profiles).set({ dailyGoalMinutes: minutes }).where(eq(profiles.id, user.id));
  revalidatePath("/me");
  return { success: true };
}
