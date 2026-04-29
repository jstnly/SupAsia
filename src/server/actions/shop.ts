"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles, items, inventory } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export type ShopItem = typeof items.$inferSelect;
export type InventoryRow = typeof inventory.$inferSelect;

export async function getShopItems(): Promise<ShopItem[]> {
  return db.select().from(items);
}

export async function getMyInventory(): Promise<InventoryRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  return db.select().from(inventory).where(eq(inventory.userId, user.id));
}

export async function purchaseItem(
  itemId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "not authenticated" };

  const [item] = await db.select().from(items).where(eq(items.id, itemId));
  if (!item) return { success: false, error: "Item not found." };

  const [profile] = await db
    .select({ gems: profiles.gems, gold: profiles.gold })
    .from(profiles)
    .where(eq(profiles.id, user.id));
  if (!profile) return { success: false, error: "Profile not found." };

  const cost = item.costGems ?? 0;
  if (cost > 0 && profile.gems < cost) {
    return { success: false, error: `Not enough gems. Need ${cost}, have ${profile.gems}.` };
  }

  await db.transaction(async (tx) => {
    if (cost > 0) {
      await tx
        .update(profiles)
        .set({ gems: profiles.gems })
        .where(eq(profiles.id, user.id));
    }
    await tx
      .insert(inventory)
      .values({ userId: user.id, itemId, qty: 1, equipped: false })
      .onConflictDoUpdate({
        target: [inventory.userId, inventory.itemId],
        set: { qty: (inventory.qty as unknown as number) + 1 },
      });
  });

  revalidatePath("/shop");
  revalidatePath("/me");
  return { success: true };
}

export async function toggleEquip(
  itemId: string,
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const [row] = await db
    .select()
    .from(inventory)
    .where(and(eq(inventory.userId, user.id), eq(inventory.itemId, itemId)));
  if (!row) return { success: false };

  await db
    .update(inventory)
    .set({ equipped: !row.equipped })
    .where(and(eq(inventory.userId, user.id), eq(inventory.itemId, itemId)));

  revalidatePath("/shop");
  revalidatePath("/me");
  return { success: true };
}
