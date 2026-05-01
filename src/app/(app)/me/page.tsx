import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles, stats, xpEvents } from "@/lib/db/schema";
import { eq, gte, desc } from "drizzle-orm";
import { MascotSlot } from "@/components/game/MascotSlot";
import { StatRadar } from "@/components/game/StatRadar";
import { XPBar } from "@/components/game/XPBar";
import { LEVEL_UNLOCKS } from "@/lib/game/xp";
import { ACHIEVEMENTS } from "@/lib/game/achievements";
import { LEAGUE_BY_ID, LEAGUES, nextLeague } from "@/lib/game/league";
import { Coins, Gem, Flame, ChevronRight, Trophy, ShoppingBag, Sword, BarChart2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import { levelFromTotalXp } from "@/lib/game/xp";
import { SignOutButton } from "./SignOutButton";
import { AccessibilityToggle } from "./AccessibilityToggle";
import { SettingsPanel } from "./SettingsPanel";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";
import { SectionShell } from "@/components/ui/SectionShell";
import { getSectionTheme } from "@/lib/ui/sections";

export default async function MePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
  const [statRow] = await db.select().from(stats).where(eq(stats.userId, user.id));
  if (!profile) redirect("/login");
  const { level } = levelFromTotalXp(profile.totalXp);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentXp = await db
    .select({ amount: xpEvents.amount, createdAt: xpEvents.createdAt })
    .from(xpEvents)
    .where(eq(xpEvents.userId, user.id))
    .orderBy(desc(xpEvents.createdAt));

  // XP per day for the last 30 days (YYYY-MM-DD keys)
  const xpByDay: Record<string, number> = {};
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  let weekXp = 0;
  for (const ev of recentXp) {
    const day = ev.createdAt.toISOString().slice(0, 10);
    if (ev.createdAt >= thirtyDaysAgo) {
      xpByDay[day] = (xpByDay[day] ?? 0) + ev.amount;
    }
    if (ev.createdAt >= sevenDaysAgo) weekXp += ev.amount;
  }

  const statValues = {
    thinh: statRow?.thinh ?? 0,
    khau: statRow?.khau ?? 0,
    van: statRow?.van ?? 0,
    but: statRow?.but ?? 0,
    tuVung: statRow?.tuVung ?? 0,
    thanhDieu: statRow?.thanhDieu ?? 0,
    nguPhap: statRow?.nguPhap ?? 0,
  };

  // Build 30-day grid: last 30 days in order
  const days30: { date: string; xp: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    days30.push({ date: key, xp: xpByDay[key] ?? 0 });
  }
  const maxDayXp = Math.max(...days30.map((d) => d.xp), 1);

  const meTheme = getSectionTheme("me");

  return (
    <div className="space-y-6">
      {/* Hero — light card with mascot + identity + key stats */}
      <SectionShell section="me">
        <header
          className="relative rounded-3xl bg-white px-5 py-5 md:px-6 md:py-6"
          style={{
            border: "1px solid var(--color-border)",
            boxShadow: "0 1px 0 rgba(26,20,35,0.04), 0 12px 28px -16px rgba(26,20,35,0.18)",
          }}
        >
          <span
            aria-hidden
            className="absolute left-5 right-5 top-0 h-1 rounded-b-full md:left-6 md:right-6"
            style={{ background: meTheme.accent }}
          />
          <div className="flex flex-wrap items-center gap-5">
            <div
              className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl md:h-28 md:w-28"
              style={{
                background: `color-mix(in oklab, ${meTheme.accent} 12%, white)`,
                border: `1.5px solid color-mix(in oklab, ${meTheme.accent} 28%, transparent)`,
              }}
            >
              <MascotSlot size={88} variant={profile.avatarVariant} emote="cheer" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <div
                className="text-[11px] font-display font-bold uppercase tracking-[0.14em]"
                style={{ color: meTheme.accentStrong }}
              >
                @{profile.username} · L{level}
              </div>
              <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight text-[var(--color-lacquer)] md:text-3xl">
                {profile.displayName}
              </h1>
              <div className="mt-1 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                {profile.dialect === "southern"
                  ? "Southern Vietnamese (Saigon / Sài Gòn)"
                  : "Northern Vietnamese (Hanoi / Hà Nội)"}{" "}
                · {profile.dailyGoalMinutes} min/day goal
              </div>
              <div className="mt-3"><XPBar totalXp={profile.totalXp} /></div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Stat icon={<Flame className="text-[var(--color-gold-500)]" size={16} />} label="Streak" value={`${profile.streakDays}d`} />
                <Stat icon={<Coins className="text-[var(--color-gold-500)]" size={16} />} label="Gold" value={formatNumber(profile.gold)} />
                <Stat icon={<Gem className="text-[var(--color-tone-nga)]" size={16} />} label="Gems" value={formatNumber(profile.gems)} />
              </div>
            </div>
          </div>
        </header>
      </SectionShell>

      {/* Stats + Unlocks */}
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
          <LeagueCard leagueId={profile.league} />
          <div className="mt-3 flex gap-2">
            <Link
              href="/duel"
              className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-lotus-500)] to-[var(--color-gold-500)] py-2 font-display text-sm font-bold text-white shadow-[0_3px_0_0_rgba(26,20,35,0.2)] hover:-translate-y-0.5 transition-transform"
            >
              <Sword size={14} /> Tone Duel
            </Link>
            <Link
              href="/shop"
              className="flex-1 flex items-center justify-center gap-2 rounded-full border-2 border-[var(--color-gold-300)] bg-[var(--color-gold-50)] py-2 font-display text-sm font-bold text-[var(--color-gold-700)] hover:-translate-y-0.5 transition-transform"
            >
              <ShoppingBag size={14} /> Shop
            </Link>
          </div>
          <Link
            href="/conversation"
            className="mt-2 flex items-center justify-center gap-2 w-full rounded-full border-2 border-[var(--color-jade-300)] bg-[var(--color-jade-50)] py-2 font-display text-sm font-bold text-[var(--color-jade-700)] hover:-translate-y-0.5 transition-transform"
          >
            <MessageCircle size={14} /> Chat with Bồ
          </Link>
        </div>
      </div>

      {/* Analytics — 30-day activity */}
      <div className="card-soft p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <BarChart2 size={18} className="text-[var(--color-jade-500)]" />
            Activity · 30 Days
          </h2>
          <span className="text-sm font-display font-semibold text-[var(--color-jade-600)]">
            +{weekXp} XP this week
          </span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {days30.map(({ date, xp }) => {
            const intensity = xp === 0 ? 0 : Math.ceil((xp / maxDayXp) * 4);
            const colors = [
              "bg-[color-mix(in_oklab,var(--color-lacquer)_8%,transparent)]",
              "bg-[color-mix(in_oklab,var(--color-jade-400)_30%,transparent)]",
              "bg-[color-mix(in_oklab,var(--color-jade-400)_55%,transparent)]",
              "bg-[var(--color-jade-400)]",
              "bg-[var(--color-jade-600)]",
            ];
            const today = new Date().toISOString().slice(0, 10);
            return (
              <div
                key={date}
                title={`${date}: ${xp} XP`}
                className={cn(
                  "h-4 w-4 rounded-sm transition-colors",
                  colors[intensity],
                  date === today && "ring-1 ring-[var(--color-jade-400)]"
                )}
              />
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-[color-mix(in_oklab,var(--color-lacquer)_50%,transparent)]">
          <span>Less</span>
          {["bg-[color-mix(in_oklab,var(--color-lacquer)_8%,transparent)]","bg-[color-mix(in_oklab,var(--color-jade-400)_30%,transparent)]","bg-[var(--color-jade-400)]","bg-[var(--color-jade-600)]"].map((c, i) => (
            <div key={i} className={cn("h-3 w-3 rounded-sm", c)} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Achievements */}
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

      {/* Settings */}
      <div className="card-soft p-5">
        <h2 className="font-display text-lg font-bold mb-3">Settings</h2>
        <SettingsPanel
          currentDialect={profile.dialect}
          currentDailyGoal={profile.dailyGoalMinutes}
          userLevel={level}
        />
      </div>

      {/* Accessibility */}
      <div className="card-soft p-5">
        <h2 className="font-display text-lg font-bold mb-3">Accessibility</h2>
        <AccessibilityToggle />
      </div>

      {/* Account */}
      <div className="card-soft p-5 space-y-3">
        <h2 className="font-display text-lg font-bold">Account</h2>
        <PushNotificationToggle />
        <SignOutButton />
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_oklab,var(--color-lacquer)_5%,transparent)] px-3 py-1.5">
      {icon}
      <span className="text-[10px] uppercase tracking-wider text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">{label}</span>
      <span className="font-display font-bold tabular-nums text-[var(--color-lacquer)]">{value}</span>
    </div>
  );
}

function LeagueCard({ leagueId }: { leagueId: string }) {
  const league = LEAGUE_BY_ID[leagueId as keyof typeof LEAGUE_BY_ID] ?? LEAGUES[0];
  const next = nextLeague(league.id);
  const leagueIdx = LEAGUES.findIndex((l) => l.id === league.id);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-white to-[var(--color-gold-50)] p-4 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{league.emoji}</span>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-700)]">
            League · Bậc Trà Sữa
          </div>
          <div className="font-display text-xl font-extrabold">
            {league.english}{" "}
            <span className="text-sm font-normal text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
              ({league.name})
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        {LEAGUES.map((l, i) => (
          <div
            key={l.id}
            title={`${l.english} (${l.name}) — ${l.minXpWeekly}+ weekly XP`}
            className={cn(
              "h-2 flex-1 rounded-full",
              i <= leagueIdx
                ? "bg-gradient-to-r from-[var(--color-lotus-400)] to-[var(--color-gold-400)]"
                : "bg-[color-mix(in_oklab,var(--color-lacquer)_10%,transparent)]",
            )}
          />
        ))}
      </div>
      {next && (
        <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
          Next: {next.emoji} <span className="font-semibold">{next.english}</span>{" "}
          <span className="opacity-70">({next.name})</span> · earn {next.minXpWeekly} weekly XP
        </div>
      )}
    </div>
  );
}
