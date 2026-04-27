import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Map, User, Users, Trophy } from "lucide-react";
import { TopBar } from "./TopBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
  if (!profile) redirect("/login");
  if (!profile.onboardedAt) redirect("/onboarding");

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 pb-24 pt-4 md:pb-6">
      <TopBar profile={profile} />
      <div className="flex-1 py-4">{children}</div>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const items = [
    { href: "/learn", label: "Learn", icon: Map },
    { href: "/leaderboard", label: "Ranks", icon: Trophy },
    { href: "/friends", label: "Friends", icon: Users },
    { href: "/me", label: "Me", icon: User },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center md:relative md:mt-6 md:bottom-auto">
      <div className="m-3 flex w-full max-w-lg items-center justify-around rounded-full border border-[var(--color-border)] bg-white/90 p-2 backdrop-blur shadow-[0_8px_24px_-12px_rgba(26,20,35,0.25)]">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-full px-3 py-2 text-xs font-medium text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)] hover:bg-[color-mix(in_oklab,var(--color-lotus-200)_50%,transparent)]"
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
