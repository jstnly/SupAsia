"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Check, Package } from "lucide-react";
import { purchaseItem, toggleEquip } from "@/server/actions/shop";
import type { ShopItem, InventoryRow } from "@/server/actions/shop";
import { cn } from "@/lib/utils";

const RARITY_COLOR: Record<string, string> = {
  common: "var(--color-river-mist)",
  uncommon: "var(--color-jade-400)",
  rare: "var(--color-tone-hoi)",
  epic: "var(--color-lotus-500)",
  legendary: "var(--color-gold-500)",
};

const SLOT_LABEL: Record<string, string> = {
  consumable: "Consumable",
  cosmetic: "Cosmetic",
  background: "Background",
};

const SLOT_EMOJI: Record<string, string> = {
  consumable: "🧪",
  cosmetic: "✨",
  background: "🖼️",
};

type Tab = "all" | "consumable" | "cosmetic" | "background";

export function ShopClient({
  shopItems,
  myInventory,
  gems,
}: {
  shopItems: ShopItem[];
  myInventory: InventoryRow[];
  gems: number;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const ownedIds = new Set(myInventory.map((i) => i.itemId));
  const equippedIds = new Set(myInventory.filter((i) => i.equipped).map((i) => i.itemId));

  const filtered =
    tab === "all" ? shopItems : shopItems.filter((i) => i.slot === tab);

  function buy(item: ShopItem) {
    startTransition(async () => {
      const res = await purchaseItem(item.id);
      setMessage({ text: res.success ? `Bought ${item.name}!` : (res.error ?? "Error"), ok: res.success });
      setTimeout(() => setMessage(null), 3000);
    });
  }

  function equip(itemId: string) {
    startTransition(async () => {
      await toggleEquip(itemId);
    });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "consumable", label: "Boosts" },
    { id: "cosmetic", label: "Cosmetics" },
    { id: "background", label: "Backgrounds" },
  ];

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm font-semibold",
            message.ok
              ? "bg-[var(--color-jade-50)] border border-[var(--color-jade-300)] text-[var(--color-jade-700)]"
              : "bg-[var(--color-lotus-50)] border border-[var(--color-lotus-300)] text-[var(--color-lotus-700)]",
          )}
        >
          {message.text}
        </div>
      )}

      <div className="inline-flex rounded-full border border-[var(--color-border)] bg-white p-1 flex-wrap gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-display font-semibold transition-colors",
              tab === t.id
                ? "bg-[var(--color-gold-400)] text-white"
                : "text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((item) => {
          const owned = ownedIds.has(item.id);
          const equipped = equippedIds.has(item.id);
          const canAfford = gems >= (item.costGems ?? 0);
          const rarityColor = RARITY_COLOR[item.rarity] ?? RARITY_COLOR.common;

          return (
            <div
              key={item.id}
              className={cn(
                "card-soft p-4 space-y-3 transition-all",
                owned && "ring-1 ring-[var(--color-jade-300)]",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl"
                  style={{ background: `color-mix(in oklab,${rarityColor} 20%,white)` }}
                >
                  {SLOT_EMOJI[item.slot] ?? "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold leading-tight">{item.name}</div>
                  <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
                    {SLOT_LABEL[item.slot] ?? item.slot} ·{" "}
                    <span
                      className="font-semibold capitalize"
                      style={{ color: rarityColor }}
                    >
                      {item.rarity}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 font-display font-bold text-[var(--color-gold-600)]">
                  💎 {item.costGems ?? 0}
                </div>
              </div>

              {owned ? (
                item.slot !== "consumable" ? (
                  <button
                    onClick={() => equip(item.id)}
                    disabled={pending}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-full py-2 font-display text-sm font-bold transition-all",
                      equipped
                        ? "bg-[var(--color-jade-500)] text-white shadow-[0_3px_0_0_rgba(26,20,35,0.2)]"
                        : "border-2 border-[var(--color-jade-300)] text-[var(--color-jade-700)]",
                    )}
                  >
                    {equipped ? <><Check size={14} /> Equipped</> : <><Package size={14} /> Equip</>}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 justify-center rounded-full bg-[var(--color-jade-50)] border border-[var(--color-jade-200)] py-2 text-sm font-display font-semibold text-[var(--color-jade-700)]">
                    <Check size={14} /> Owned ×{myInventory.find((i) => i.itemId === item.id)?.qty ?? 1}
                  </div>
                )
              ) : (
                <button
                  onClick={() => buy(item)}
                  disabled={pending || !canAfford}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-full py-2 font-display text-sm font-bold shadow-[0_3px_0_0_rgba(26,20,35,0.2)] active:scale-[0.98] transition-all",
                    canAfford
                      ? "bg-gradient-to-r from-[var(--color-gold-400)] to-[var(--color-lotus-400)] text-white"
                      : "bg-[color-mix(in_oklab,var(--color-lacquer)_8%,transparent)] text-[color-mix(in_oklab,var(--color-lacquer)_40%,transparent)] shadow-none",
                  )}
                >
                  <ShoppingCart size={14} />
                  {canAfford ? "Buy" : "Not enough gems"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
