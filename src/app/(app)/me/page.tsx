import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles, stats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { MascotSlot } from "@/components/game/MascotSlot";
import { StatRadar } from "@/components/game/StatRadar";
import { XPBar } from "@/components/game/XPBar";
import { LEVEL_UNLOCKS } from "@/lib/game/xp";
import { Coins, Gem, Flame } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { SignOutButton } from "./SignOutButton";

export default async function MePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
  const [statRow] = await db.select().from(stats).where(eq(stats.userId, user.id));
  if (!profile) redirect("/login");

  const statValues = {
    thinh: statRow?.thinh ?? 0,
    khau: statRow?.khau ?? 0,
    van: statRow?.van ?? 0,
    but: statRow?.but ?? 0,
    tuVung: statRow?.tuVung ?? 0,
    thanhDieu: statRow?.thanhDieu ?? 0,
    nguPhap: statRow?.nguPhap ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="card-soft flex flex-wrap items-center gap-6 p-6">
        <div className="grid h-32 w-32 place-items-center rounded-3xl bg-gradient-to-br from-[var(--color-lotus-100)] to-[var(--color-river-mist)]">
          <MascotSlot size={120} variant={profile.avatarVariant} emote="cheer" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
            @{profile.username}
          </div>
          <h1 className="font-display text-3xl font-extrabold">{profile.displayName}</h1>
          <div className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)] mb-3">
            {profile.dialect === "southern" ? "Southern (Sài Gòn)" : "Northern (Hà Nội)"} · {profile.dailyGoalMinutes} min/day goal
          </div>
          <XPBar totalXp={profile.totalXp} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Stat icon={<Flame className="text-[var(--color-gold-500)]" size={16} />} label="Streak" value={`${profile.streakDays}d`} />
            <Stat icon={<Coins className="text-[var(--color-gold-500)]" size={16} />} label="Đồng" value={formatNumber(profile.gold)} />
            <Stat icon={<Gem className="text-[var(--color-tone-nga)]" size={16} />} label="Ngọc" value={formatNumber(profile.gems)} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card-soft p-4">
          <h2 className="font-display text-lg font-bold mb-2">Stats</h2>
          <div className="grid place-items-center">
            <StatRadar stats={statValues} />
          </div>
        </div>

        <div className="card-soft p-5">
          <h2 className="font-display text-lg font-bold mb-3">Unlocks</h2>
          <ul className="space-y-2">
            {Object.entries(LEVEL_UNLOCKS).map(([lvl, name]) => (
              <li key={lvl} className="flex items-center justify-between text-sm">
                <span>{name}</span>
                <span className="font-display font-bold text-[var(--color-gold-600)]">L{lvl}</span>
              </li>
            ))}
          </ul>
          <h2 className="font-display text-lg font-bold mt-6 mb-2">League</h2>
          <div className="rounded-2xl bg-gradient-to-br from-[var(--color-lotus-100)] to-[var(--color-gold-100)] p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-700)]">Bậc Trà Sữa</div>
            <div className="font-display font-bold capitalize">{profile.league.replace(/-/g, " ")}</div>
          </div>
        </div>
      </div>

      <div className="card-soft p-5">
        <h2 className="font-display text-lg font-bold mb-2">Account</h2>
        <SignOutButton />
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5">
      {icon}
      <span className="text-xs uppercase tracking-wider text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">{label}</span>
      <span className="font-display font-bold tabular-nums">{value}</span>
    </div>
  );
}
