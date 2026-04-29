"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { duels, profiles, xpEvents } from "@/lib/db/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type DuelRow = typeof duels.$inferSelect;

/** Create a new duel room (host side). Returns the duel id. */
export async function createDuel(): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  const [row] = await db
    .insert(duels)
    .values({ hostId: user.id, status: "waiting" })
    .returning({ id: duels.id });

  return { id: row.id };
}

/** Guest joins an existing duel room. Returns duel data or error. */
export async function joinDuel(
  duelId: string,
): Promise<{ success: boolean; error?: string; isHost?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "not authenticated" };

  const [row] = await db.select().from(duels).where(eq(duels.id, duelId));
  if (!row) return { success: false, error: "Duel not found." };
  if (row.hostId === user.id) return { success: true, isHost: true };
  if (row.status !== "waiting") return { success: false, error: "Game already in progress." };

  await db
    .update(duels)
    .set({ guestId: user.id, status: "active", startedAt: new Date() })
    .where(and(eq(duels.id, duelId), eq(duels.status, "waiting")));

  return { success: true, isHost: false };
}

/** Record the final scores and award XP to both players. */
export async function finalizeDuel(
  duelId: string,
  hostScore: number,
  guestScore: number,
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const [row] = await db.select().from(duels).where(eq(duels.id, duelId));
  if (!row || row.status === "finished") return;
  if (row.hostId !== user.id && row.guestId !== user.id) return;

  const winnerId =
    hostScore > guestScore ? row.hostId :
    guestScore > hostScore ? (row.guestId ?? undefined) : undefined;

  await db
    .update(duels)
    .set({
      hostScore,
      guestScore,
      winnerId,
      status: "finished",
      finishedAt: new Date(),
    })
    .where(eq(duels.id, duelId));

  // Award XP: 30 base + 10 for wins, minus host/guest proportional to score
  const hostXp = 30 + (winnerId === row.hostId ? 10 : 0) + hostScore * 3;
  const guestXp = 30 + (winnerId === row.guestId ? 10 : 0) + guestScore * 3;

  if (row.hostId) {
    await db.insert(xpEvents).values({
      userId: row.hostId,
      amount: hostXp,
      statKey: "thanhDieu",
      source: `duel:${duelId}`,
    });
    await db
      .update(profiles)
      .set({ totalXp: profiles.totalXp })
      .where(eq(profiles.id, row.hostId));
  }
  if (row.guestId) {
    await db.insert(xpEvents).values({
      userId: row.guestId,
      amount: guestXp,
      statKey: "thanhDieu",
      source: `duel:${duelId}`,
    });
  }

  revalidatePath("/leaderboard");
}

/** Fetch duel state — used by host/guest polling until Realtime syncs. */
export async function getDuel(duelId: string): Promise<DuelRow | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [row] = await db.select().from(duels).where(eq(duels.id, duelId));
  return row ?? null;
}

/** List a user's recent duels. */
export async function getMyDuels(): Promise<DuelRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  return db
    .select()
    .from(duels)
    .where(or(eq(duels.hostId, user.id), eq(duels.guestId, user.id)))
    .orderBy(desc(duels.createdAt))
    .limit(10);
}
