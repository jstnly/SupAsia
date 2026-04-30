"use client";

import { useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { PracticeTab } from "@/components/tutor/PracticeTab";
import { AskBoTab } from "@/components/tutor/AskBoTab";
import { PageHero } from "@/components/ui/PageHero";
import { SectionShell } from "@/components/ui/SectionShell";

type Tab = "practice" | "tutor";

export function ConversationPractice({
  userLevel,
  dialect,
}: {
  userLevel: number;
  dialect: string;
}) {
  const [tab, setTab] = useState<Tab>("practice");

  return (
    <div className="space-y-5">
      <SectionShell section="conversation">
        <PageHero
          section="conversation"
          eyebrow="Hội Thoại · Conversation"
          title="Chat & Learn with Bồ"
          subtitle="Practice real-life scenarios or ask Bồ to explain anything about Vietnamese — vocab, tones, grammar, culture."
        />
      </SectionShell>

      <div className="flex gap-1 rounded-full bg-[color-mix(in_oklab,var(--color-lacquer)_8%,transparent)] p-1">
        <TabButton active={tab === "practice"} onClick={() => setTab("practice")} icon={<MessageCircle size={14} />}>
          Practice
        </TabButton>
        <TabButton active={tab === "tutor"} onClick={() => setTab("tutor")} icon={<Sparkles size={14} />}>
          Ask Bồ
        </TabButton>
      </div>

      {tab === "practice" ? (
        <PracticeTab userLevel={userLevel} dialect={dialect} />
      ) : (
        <AskBoTab />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-display font-bold transition-colors ${
        active
          ? "bg-white text-[var(--color-lacquer)] shadow-[0_2px_6px_rgba(26,20,35,0.08)]"
          : "text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)] hover:text-[var(--color-lacquer)]"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
