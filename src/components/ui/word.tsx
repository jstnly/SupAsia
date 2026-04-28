"use client";

import { useState, useRef, useEffect } from "react";
import { lookup } from "@/lib/curriculum/dictionary";
import { playVietnamese } from "@/lib/game/audio";
import { cn } from "@/lib/utils";

/**
 * A Vietnamese word/phrase with hover-to-define and tap-to-play behavior.
 * If the word is in the auto-built dictionary, it's underlined; otherwise renders plain.
 */
export function Word({
  vi,
  en,
  className,
}: {
  vi: string;
  en?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const meaning = en ?? lookup(vi)?.en;
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  if (!meaning) return <span className={className}>{vi}</span>;

  return (
    <span
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setOpen((v) => !v);
        playVietnamese(vi);
      }}
      className={cn(
        "relative inline-block cursor-pointer underline decoration-dotted decoration-[var(--color-lotus-400)] underline-offset-4",
        className,
      )}
    >
      {vi}
      {open && (
        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--color-lacquer)] px-3 py-1.5 text-xs font-display text-white shadow-[0_4px_12px_rgba(26,20,35,0.25)]">
          {meaning}
        </span>
      )}
    </span>
  );
}

/**
 * Render a Vietnamese sentence with each known word/phrase wrapped in <Word>.
 * Tries phrase-level lookups (largest-first) before falling back to single tokens.
 */
export function VietnameseText({ text, className }: { text: string; className?: string }) {
  const segments = tokenizePreservingWhitespace(text);
  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.kind === "ws" || seg.kind === "punct") return <span key={i}>{seg.text}</span>;
        const def = lookup(seg.text);
        if (!def) return <span key={i}>{seg.text}</span>;
        return <Word key={i} vi={seg.text} en={def.en} />;
      })}
    </span>
  );
}

type Segment = { kind: "word" | "ws" | "punct"; text: string };

function tokenizePreservingWhitespace(text: string): Segment[] {
  const segments: Segment[] = [];
  const re = /([\p{L}\p{M}\dÀ-ỹ'-]+)|(\s+)|([^\p{L}\p{M}\d\s])/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[1]) segments.push({ kind: "word", text: m[1] });
    else if (m[2]) segments.push({ kind: "ws", text: m[2] });
    else if (m[3]) segments.push({ kind: "punct", text: m[3] });
  }
  return segments;
}
