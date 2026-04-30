"use client";

import { Volume2 } from "lucide-react";
import { playVietnamese } from "@/lib/game/audio";
import { TONE_BY_ID } from "@/lib/game/tones";
import type { KnowledgeResponse } from "@/lib/tutor/knowledge-base";

export function KnowledgeCard({ card, compact }: { card: KnowledgeResponse; compact?: boolean }) {
  switch (card.kind) {
    case "word":
      return <WordCardView card={card} compact={compact} />;
    case "phrase":
      return <PhraseCardView card={card} compact={compact} />;
    case "tone":
      return <ToneCardView card={card} compact={compact} />;
    case "grammar":
      return <GrammarCardView card={card} compact={compact} />;
    case "culture":
      return <CultureCardView card={card} compact={compact} />;
  }
}

function PlayButton({ text, label }: { text: string; label?: string }) {
  return (
    <button
      onClick={() => playVietnamese(text)}
      aria-label={label ?? `Play ${text}`}
      className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-jade-100)] text-[var(--color-jade-700)] hover:bg-[var(--color-jade-200)] transition-colors"
    >
      <Volume2 size={14} />
    </button>
  );
}

function CardShell({
  badge,
  badgeColor,
  children,
  compact,
}: {
  badge: string;
  badgeColor?: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`card-soft ${compact ? "p-3" : "p-4"} space-y-2`}>
      <div
        className="text-[10px] font-display font-bold uppercase tracking-wider"
        style={{ color: badgeColor ?? "var(--color-jade-600)" }}
      >
        {badge}
      </div>
      {children}
    </div>
  );
}

function WordCardView({ card, compact }: { card: Extract<KnowledgeResponse, { kind: "word" }>; compact?: boolean }) {
  const tone = card.tone ? TONE_BY_ID[card.tone] : undefined;
  return (
    <CardShell badge="Word" badgeColor={tone?.color} compact={compact}>
      <div className="flex items-center gap-2">
        <span className="font-display text-2xl font-extrabold text-[var(--color-lacquer)]">{card.vi}</span>
        <PlayButton text={card.vi} />
        {tone && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white"
            style={{ background: tone.color }}
          >
            {tone.name} · {tone.english}
          </span>
        )}
      </div>
      <div className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_75%,transparent)]">{card.en}</div>
      {card.notes && (
        <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)] leading-relaxed">
          {card.notes}
        </div>
      )}
      {card.examples && card.examples.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {card.examples.map((ex, i) => (
            <div key={i} className="rounded-lg bg-[color-mix(in_oklab,var(--color-jade-100)_50%,transparent)] px-3 py-2 text-sm">
              <button
                onClick={() => playVietnamese(ex.vi)}
                className="font-display font-semibold text-[var(--color-lacquer)] hover:underline"
              >
                {ex.vi}
              </button>
              <span className="ml-2 text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">— {ex.en}</span>
            </div>
          ))}
        </div>
      )}
    </CardShell>
  );
}

function PhraseCardView({ card, compact }: { card: Extract<KnowledgeResponse, { kind: "phrase" }>; compact?: boolean }) {
  return (
    <CardShell badge="Phrase" badgeColor="var(--color-lotus-600)" compact={compact}>
      <div className="flex items-center gap-2">
        <span className="font-display text-xl font-extrabold text-[var(--color-lacquer)]">{card.vi}</span>
        <PlayButton text={card.vi} />
      </div>
      <div className="text-sm font-semibold text-[var(--color-lacquer)]">{card.en}</div>
      {card.literal && (
        <div className="text-xs italic text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
          literally: {card.literal}
        </div>
      )}
      <div className="text-xs leading-relaxed text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]">
        {card.whenToUse}
      </div>
    </CardShell>
  );
}

function ToneCardView({ card, compact }: { card: Extract<KnowledgeResponse, { kind: "tone" }>; compact?: boolean }) {
  const t = TONE_BY_ID[card.toneId];
  return (
    <CardShell badge={`${t.name} (${t.english}) tone`} badgeColor={t.color} compact={compact}>
      <div className="flex items-center gap-3">
        <div
          className="grid h-12 w-12 place-items-center rounded-2xl text-2xl font-display font-extrabold text-white"
          style={{ background: t.color }}
        >
          {t.diacritic}
        </div>
        <div>
          <div className="font-display text-lg font-bold text-[var(--color-lacquer)]">
            {t.example}
            <button
              onClick={() => playVietnamese(t.example)}
              className="ml-2 text-xs text-[var(--color-jade-600)] hover:underline"
            >
              ▶ play
            </button>
          </div>
          <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            example: <span className="italic">{t.exampleMeaning}</span>
          </div>
        </div>
      </div>
      <div className="text-sm leading-relaxed text-[color-mix(in_oklab,var(--color-lacquer)_75%,transparent)]">
        {card.description}
      </div>
      {card.examples.length > 0 && (
        <div className="grid gap-1.5 pt-1 sm:grid-cols-3">
          {card.examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => playVietnamese(ex.vi)}
              className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1.5 text-left hover:border-[var(--color-jade-400)] transition-colors"
            >
              <div className="font-display font-bold text-sm text-[var(--color-lacquer)]">{ex.vi}</div>
              <div className="text-[10px] text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">{ex.en}</div>
            </button>
          ))}
        </div>
      )}
      {card.tips && (
        <div className="rounded-lg bg-[color-mix(in_oklab,var(--color-gold-100)_60%,transparent)] px-3 py-2 text-xs text-[var(--color-lacquer)] leading-relaxed">
          💡 {card.tips}
        </div>
      )}
    </CardShell>
  );
}

function GrammarCardView({ card, compact }: { card: Extract<KnowledgeResponse, { kind: "grammar" }>; compact?: boolean }) {
  return (
    <CardShell badge="Grammar" badgeColor="var(--color-gold-600)" compact={compact}>
      <div className="rounded-lg bg-[var(--color-lacquer)] px-3 py-2 font-mono text-sm text-white">
        {card.pattern}
      </div>
      <div className="text-sm leading-relaxed text-[color-mix(in_oklab,var(--color-lacquer)_75%,transparent)]">
        {card.explanation}
      </div>
      {card.examples.length > 0 && (
        <div className="space-y-1.5">
          {card.examples.map((ex, i) => (
            <div key={i} className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playVietnamese(ex.vi)}
                  className="font-display font-semibold text-sm text-[var(--color-lacquer)] hover:underline"
                >
                  {ex.vi}
                </button>
              </div>
              <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)] mt-0.5">{ex.en}</div>
            </div>
          ))}
        </div>
      )}
    </CardShell>
  );
}

function CultureCardView({ card, compact }: { card: Extract<KnowledgeResponse, { kind: "culture" }>; compact?: boolean }) {
  return (
    <CardShell badge="Culture" badgeColor="var(--color-lotus-700)" compact={compact}>
      <div className="font-display text-lg font-bold text-[var(--color-lacquer)]">{card.topic}</div>
      <div className="prose prose-sm text-sm leading-relaxed text-[color-mix(in_oklab,var(--color-lacquer)_75%,transparent)] whitespace-pre-line">
        {renderMarkdownLite(card.body)}
      </div>
    </CardShell>
  );
}

// Tiny markdown renderer: bold (**), bullet (- ), and paragraphs (blank lines).
function renderMarkdownLite(text: string): React.ReactNode {
  const blocks = text.split(/\n\n+/);
  return blocks.map((block, bi) => {
    if (block.startsWith("- ") || /^\n?- /.test(block)) {
      const items = block.split(/\n- |^- /).filter(Boolean);
      return (
        <ul key={bi} className="list-disc space-y-1 pl-4 my-1">
          {items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={bi} className="my-1.5">
        {renderInline(block)}
      </p>
    );
  });
}

function renderInline(text: string): React.ReactNode {
  // **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i} className="font-bold text-[var(--color-lacquer)]">{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}
