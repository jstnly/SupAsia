"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
