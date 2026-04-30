"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, History } from "lucide-react";
import { MascotSlot } from "@/components/game/MascotSlot";
import { askTutor, type TutorResult } from "@/lib/tutor/respond";
import { SUGGESTED_TOPICS } from "@/lib/tutor/knowledge-base";
import { KnowledgeCard } from "./KnowledgeCard";

const RECENT_LIMIT = 5;

export function AskBoTab() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);

  const result: TutorResult | null = useMemo(() => {
    if (!submitted) return null;
    return askTutor(submitted);
  }, [submitted]);

  function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setSubmitted(trimmed);
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((x) => x !== trimmed)].slice(0, RECENT_LIMIT);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    ask(query);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2 items-stretch">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color-mix(in_oklab,var(--color-lacquer)_45%,transparent)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hỏi Bồ bất cứ điều gì… [Ask Bồ anything…]"
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-jade-400)]"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-[var(--color-jade-500)] px-5 font-display font-bold text-white text-sm shadow-[0_3px_0_0_rgba(26,20,35,0.15)] disabled:opacity-40"
          disabled={!query.trim()}
        >
          Ask
        </button>
      </form>

      {!submitted && (
        <EmptyState onPick={ask} />
      )}

      {recent.length > 0 && submitted && (
        <div className="flex flex-wrap gap-1.5 items-center text-xs">
          <History size={12} className="text-[color-mix(in_oklab,var(--color-lacquer)_45%,transparent)]" />
          <span className="text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">Recent:</span>
          {recent.map((q, i) => (
            <button
              key={i}
              onClick={() => ask(q)}
              className="rounded-full bg-[var(--color-jade-50)] border border-[var(--color-border)] px-2 py-0.5 text-[var(--color-lacquer)] hover:bg-[var(--color-jade-100)] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {result && <ResultView result={result} onPickSuggestion={ask} />}
    </div>
  );
}

function ResultView({ result, onPickSuggestion }: { result: TutorResult; onPickSuggestion: (q: string) => void }) {
  if (result.kind === "fallback") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="card-soft p-4 flex items-start gap-3">
          <MascotSlot size={48} emote="shrug" />
          <div className="flex-1">
            <div className="font-display font-bold text-sm text-[var(--color-lacquer)]">Hmm…</div>
            <div className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)] mt-1">
              {result.message}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {result.suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onPickSuggestion(s.query)}
              className="rounded-full bg-white border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-lacquer)] hover:border-[var(--color-jade-400)] hover:bg-[var(--color-jade-50)] transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <KnowledgeCard card={result.primary} />
      {result.related.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-display font-bold uppercase tracking-wider text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
            Related
          </div>
          <div className="space-y-2">
            {result.related.map((c, i) => (
              <KnowledgeCard key={i} card={c} compact />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="card-soft p-5 flex items-center gap-4">
        <MascotSlot size={64} emote="idle" />
        <div>
          <div className="font-display font-bold text-base text-[var(--color-lacquer)]">Mình là Bồ — gia sư của bạn</div>
          <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)] mt-1">
            Hỏi mình về từ vựng, ngữ pháp, thanh điệu, hay văn hóa Việt Nam.
            <br />
            Ask me about vocabulary, grammar, tones, or Vietnamese culture.
          </div>
        </div>
      </div>
      <div>
        <div className="text-xs font-display font-bold uppercase tracking-wider text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)] mb-2">
          Try one
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TOPICS.map((s, i) => (
            <button
              key={i}
              onClick={() => onPick(s.query)}
              className="rounded-full bg-white border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-lacquer)] hover:border-[var(--color-jade-400)] hover:bg-[var(--color-jade-50)] transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
