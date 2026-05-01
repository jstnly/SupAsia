import { getShopItems, getMyInventory } from "@/server/actions/shop";
import { ShopClient } from "./ShopClient";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHero } from "@/components/ui/PageHero";
import { SectionShell } from "@/components/ui/SectionShell";

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
      <SectionShell section="shop">
        <PageHero
          section="shop"
          eyebrow="Shop · Cửa Hàng"
          title="Spend your gems"
          subtitle="Cosmetics, boosts, and accessories for Bồ. Earn gems by beating city bosses."
          meta={
            <div className="text-center">
              <div className="text-[10px] font-display uppercase tracking-wider text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">Wallet</div>
              <div className="font-display text-2xl font-extrabold">💎 {wallet.gems}</div>
              <div className="text-[10px] text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">gems</div>
            </div>
          }
        />
      </SectionShell>
      <ShopClient shopItems={shopItems} myInventory={myInventory} gems={wallet.gems} />
    </div>
  );
}
