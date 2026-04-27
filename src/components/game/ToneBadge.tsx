"use client";

import { cn } from "@/lib/utils";
import { TONE_BY_ID, type ToneId } from "@/lib/game/tones";

const SHAPE_PATHS: Record<string, string> = {
  line: "M 4 12 L 20 12",
  rising: "M 4 18 L 20 6",
  falling: "M 4 6 L 20 18",
  questioning: "M 6 8 Q 12 18 18 8",
  wavy: "M 4 12 Q 8 6 12 12 T 20 12",
  dot: "M 12 12 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0",
};

export function ToneBadge({
  toneId,
  size = "md",
  showLabel = false,
  highlighted = false,
  className,
}: {
  toneId: ToneId;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  highlighted?: boolean;
  className?: string;
}) {
  const tone = TONE_BY_ID[toneId];
  const dim = size === "sm" ? 20 : size === "lg" ? 36 : 28;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 px-2 py-1 transition-all",
        highlighted && "ring-4 ring-offset-2 scale-110",
        className
      )}
      style={{
        borderColor: tone.color,
        backgroundColor: highlighted ? tone.color : `color-mix(in oklab, ${tone.color} 12%, transparent)`,
        color: highlighted ? "white" : tone.color,
        ["--tw-ring-color" as string]: tone.color,
      }}
    >
      <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={SHAPE_PATHS[tone.shape]}
          stroke="currentColor"
          strokeWidth={tone.shape === "dot" ? 0 : 2.5}
          fill={tone.shape === "dot" ? "currentColor" : "none"}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <span className="font-display text-sm font-semibold">
          {tone.diacritic} <span className="opacity-70">— {tone.name}</span>
        </span>
      )}
    </div>
  );
}
