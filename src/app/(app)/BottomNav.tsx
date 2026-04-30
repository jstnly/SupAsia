"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, User, Trophy, Sword, MessageCircle } from "lucide-react";
import { getSectionTheme } from "@/lib/ui/sections";

const ITEMS = [
  { href: "/learn", section: "learn" as const, label: "Learn", icon: Map },
  { href: "/duel", section: "duel" as const, label: "Duel", icon: Sword },
  { href: "/conversation", section: "conversation" as const, label: "Chat", icon: MessageCircle },
  { href: "/leaderboard", section: "leaderboard" as const, label: "Ranks", icon: Trophy },
  { href: "/me", section: "me" as const, label: "Me", icon: User },
];

export function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center md:relative md:mt-6 md:bottom-auto">
      <div className="m-3 flex w-full max-w-lg items-center justify-around rounded-full border border-[var(--color-border)] bg-white/90 p-2 backdrop-blur shadow-[0_8px_24px_-12px_rgba(26,20,35,0.25)]">
        {ITEMS.map(({ href, section, label, icon: Icon }) => {
          const t = getSectionTheme(section);
          const active =
            pathname === href ||
            pathname.startsWith(href + "/") ||
            // /coop and /shop and /skills also belong to "more" but don't have nav slots
            false;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[11px] font-medium transition-colors ${
                active
                  ? "font-bold"
                  : "text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)] hover:bg-[color-mix(in_oklab,var(--color-lotus-200)_50%,transparent)]"
              }`}
              style={
                active
                  ? {
                      background: `color-mix(in oklab, ${t.accent} 14%, white)`,
                      color: t.accentStrong,
                    }
                  : undefined
              }
            >
              <Icon size={20} />
              <span>{label}</span>
              {active && (
                <span
                  aria-hidden
                  className="absolute -top-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full"
                  style={{ background: t.accent }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
