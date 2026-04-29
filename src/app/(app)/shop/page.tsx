import { ShoppingBag } from "lucide-react";
import { getShopItems, getMyInventory } from "@/server/actions/shop";
import { ShopClient } from "./ShopClient";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [shopItems, myInventory, profileRows] = await Promise.all([
    getShopItems(),
    getMyInventory(),
    user
      ? db
          .select({ gems: profiles.gems, gold: profiles.gold })
          .from(profiles)
          .where(eq(profiles.id, user.id))
      : Promise.resolve([]),
  ]);

  const wallet = profileRows[0] ?? { gems: 0, gold: 0 };

  return (
    <div className="space-y-6">
      <div className="card-soft flex items-center gap-4 p-5">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--color-gold-400)] to-[var(--color-jade-400)] text-white">
          <ShoppingBag size={28} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-600)]">
            Cửa Hàng · Shop
          </div>
          <h1 className="font-display text-2xl font-extrabold">Shop</h1>
          <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            Cosmetics, boosts, and accessories for Bồ.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">Wallet</div>
          <div className="font-display font-bold text-[var(--color-gold-600)]">
            💎 {wallet.gems}
          </div>
        </div>
      </div>
      <ShopClient shopItems={shopItems} myInventory={myInventory} gems={wallet.gems} />
    </div>
  );
}
