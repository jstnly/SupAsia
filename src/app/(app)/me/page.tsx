import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles, stats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { MascotSlot } from "@/components/game/MascotSlot";
import { StatRadar } from "@/components/game/StatRadar";
import { XPBar } from "@/components/game/XPBar";
import { LEVEL_UNLOCKS } from "@/lib/game/xp";
import { ACHIEVEMENTS } from "@/lib/game/achievements";
import { Coins, Gem, Flame, ChevronRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import { SignOutButton } from "./SignOutButton";
import { AccessibilityToggle } from "./AccessibilityToggle";

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
          <Link
            href="/skills"
            className="mt-3 flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm hover:-translate-y-0.5 transition-transform"
          >
            <span className="font-display font-semibold">Open skill tree</span>
            <ChevronRight size={16} className="text-[var(--color-lotus-600)]" />
          </Link>
          <h2 className="font-display text-lg font-bold mt-6 mb-2">League</h2>
          <div className="rounded-2xl bg-gradient-to-br from-[var(--color-lotus-100)] to-[var(--color-gold-100)] p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-700)]">Bậc Trà Sữa</div>
            <div className="font-display font-bold capitalize">{profile.league.replace(/-/g, " ")}</div>
          </div>
        </div>
      </div>

      <div className="card-soft p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Trophy size={18} className="text-[var(--color-gold-500)]" />
            Achievements
          </h2>
          <span className="font-display text-xs font-semibold tabular-nums text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            {(profile.earnedAchievements ?? []).length}/{ACHIEVEMENTS.length}
          </span>
        </div>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ACHIEVEMENTS.map((a) => {
            const earned = (profile.earnedAchievements ?? []).includes(a.id);
            return (
              <li
                key={a.id}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border-2 p-3 transition-all",
                  earned
                    ? "border-[var(--color-gold-300)] bg-gradient-to-br from-[var(--color-gold-50)] to-[var(--color-lotus-50)]"
                    : "border-[var(--color-border)] bg-white opacity-60",
                )}
              >
                <div
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                    earned
                      ? "bg-[var(--color-gold-400)] text-white"
                      : "bg-[color-mix(in_oklab,var(--color-lacquer)_8%,transparent)] text-[color-mix(in_oklab,var(--color-lacquer)_40%,transparent)]",
                  )}
                >
                  <Trophy size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm font-semibold">
                    {a.name}{" "}
                    <span className="font-normal opacity-60">({a.nameEnglish})</span>
                  </div>
                  <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                    {a.description}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="card-soft p-5">
        <h2 className="font-display text-lg font-bold mb-3">Accessibility</h2>
        <AccessibilityToggle />
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
