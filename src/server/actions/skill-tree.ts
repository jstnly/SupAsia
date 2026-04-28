"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { levelFromTotalXp } from "@/lib/game/xp";
import {
  NODE_BY_ID,
  SKILL_TREE_UNLOCK_LEVEL,
  availableSkillPoints,
  canUnlock,
} from "@/lib/game/skill-tree";

export async function unlockSkillNode(nodeId: string): Promise<
  | { ok: true; unlockedNodes: string[] }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not authenticated" };

  if (!NODE_BY_ID[nodeId]) return { ok: false, error: "unknown node" };

  const [profile] = await db
    .select({
      totalXp: profiles.totalXp,
      unlockedSkillNodes: profiles.unlockedSkillNodes,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  if (!profile) return { ok: false, error: "profile missing" };

  const level = levelFromTotalXp(profile.totalXp).level;
  if (level < SKILL_TREE_UNLOCK_LEVEL) {
    return { ok: false, error: `Skill tree unlocks at L${SKILL_TREE_UNLOCK_LEVEL}` };
  }

  const unlocked = profile.unlockedSkillNodes ?? [];
  const unlockedSet = new Set(unlocked);
  if (!canUnlock(nodeId, unlockedSet)) {
    return { ok: false, error: "prerequisites not met" };
  }
  if (availableSkillPoints(level, unlocked.length) < 1) {
    return { ok: false, error: "not enough skill points" };
  }

  const next = [...unlocked, nodeId];
  await db
    .update(profiles)
    .set({ unlockedSkillNodes: sql`${profiles.unlockedSkillNodes} || ${JSON.stringify([nodeId])}::jsonb` })
    .where(eq(profiles.id, user.id));

  revalidatePath("/skills");
  revalidatePath("/me");
  return { ok: true, unlockedNodes: next };
}

export async function getSkillTreeState(): Promise<{
  level: number;
  unlocked: string[];
  totalXp: number;
} | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile] = await db
    .select({
      totalXp: profiles.totalXp,
      unlockedSkillNodes: profiles.unlockedSkillNodes,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  if (!profile) return null;
  const level = levelFromTotalXp(profile.totalXp).level;
  return {
    level,
    unlocked: profile.unlockedSkillNodes ?? [],
    totalXp: profile.totalXp,
  };
}
