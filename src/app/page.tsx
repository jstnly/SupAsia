import Link from "next/link";
import { ArrowRight, Flame, Sparkles, Users, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MascotSlot } from "@/components/game/MascotSlot";
import { ToneBadge } from "@/components/game/ToneBadge";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-8">
      {/* Header */}
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-lotus-400)] font-display font-bold text-white shadow-[0_3px_0_0_var(--color-lotus-600)]">
            B
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Biết Tiếng Việt
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/login?signup=1">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="grid flex-1 items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--color-lotus-700)]">
            <Sparkles size={14} className="text-[var(--color-gold-500)]" />
            Southern dialect · Free to play
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl text-balance">
            Learn Vietnamese like it&apos;s an{" "}
            <span className="text-[var(--color-lotus-500)]">RPG</span>.
          </h1>
          <p className="max-w-xl text-lg text-[color-mix(in_oklab,var(--color-lacquer)_75%,transparent)] text-pretty">
            Level up stats, unlock cities from the Mekong to Hà Nội, and duel
            your friends on tone challenges. Built for English-speaking
            beginners — conversational in 2–3 months.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login?signup=1">
              <Button size="lg" className="gap-2">
                Start your journey <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="secondary" size="lg">How it works</Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <ToneBadge toneId="ngang" showLabel />
            <ToneBadge toneId="sac" showLabel />
            <ToneBadge toneId="huyen" showLabel />
            <ToneBadge toneId="nang" showLabel />
          </div>
        </div>

        <div className="relative grid place-items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[color-mix(in_oklab,var(--color-lotus-300)_24%,transparent)] to-transparent rounded-[2rem] blur-3xl" />
          <div className="relative flex flex-col items-center gap-4">
            <div className="card-soft px-8 py-6 text-center">
              <div className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
                Meet Bồ
              </div>
              <div className="font-display text-2xl font-bold">Your buffalo guide</div>
            </div>
            <MascotSlot size={240} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="py-12">
        <h2 className="font-display text-3xl font-bold mb-8">A learning journey, not a course</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Trophy,
              title: "Level up 7 stats",
              text: "Thính, Khẩu, Văn, Bút, Từ Vựng, Thanh Điệu, Ngữ Pháp — each grows from doing the thing.",
            },
            {
              icon: Zap,
              title: "Tone-aware lessons",
              text: "Built around Vietnamese's tones (5 spoken in the South). Color-coded, drilled, and never an afterthought.",
            },
            {
              icon: Users,
              title: "Play with friends",
              text: "Tone duels, speed lessons, and weekly Trà Sữa league rankings. Compete or co-op.",
            },
            {
              icon: Flame,
              title: "Streaks & comeback",
              text: "Daily quests + Lửa Việt streaks. Miss a day? Bùa Hộ Mệnh saves your fire.",
            },
            {
              icon: Sparkles,
              title: "9 cities to unlock",
              text: "Travel from the Mekong to Hà Nội. Each city ends with a dialogue boss.",
            },
            {
              icon: ArrowRight,
              title: "Conversational in months",
              text: "1,400 high-frequency words and the grammar to weave them. ~25 min/day, 2–3 months.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="card-soft">
              <Icon className="mb-3 text-[var(--color-lotus-500)]" />
              <div className="font-display text-lg font-semibold mb-1">{title}</div>
              <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto border-t border-[var(--color-border)] py-6 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>© Biết Tiếng Việt — Made for learners with a soft spot for trâu.</div>
          <div className="flex gap-3">
            <Link href="/login">Log in</Link>
            <Link href="/login?signup=1">Sign up</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
