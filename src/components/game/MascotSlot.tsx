"use client";

import { motion, type TargetAndTransition, type Transition } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type BoEmote = "idle" | "cheer" | "hop" | "shrug" | "sleep" | "tilt";

const variants: Record<BoEmote, TargetAndTransition> = {
  idle:  { y: [0, -2, 0], rotate: 0 },
  cheer: { y: [0, -16, 0], scale: [1, 1.1, 1], rotate: [0, -8, 8, 0] },
  hop:   { y: [0, -24, 0], scale: [1, 1.05, 1] },
  shrug: { rotate: [0, -6, 6, -6, 0], y: 0 },
  sleep: { y: 0, scale: 0.95, opacity: 0.85 },
  tilt:  { rotate: [-12, 0], y: 0 },
};

const transition: Record<BoEmote, Transition> = {
  idle: { repeat: Infinity, duration: 3.2, ease: "easeInOut" },
  cheer: { duration: 0.7 },
  hop: { duration: 0.5 },
  shrug: { duration: 0.6 },
  sleep: { duration: 0.4 },
  tilt: { duration: 0.4 },
};

export function MascotSlot({
  emote = "idle",
  size = 120,
  className,
  variant = 0,
}: {
  emote?: BoEmote;
  size?: number;
  className?: string;
  variant?: number;
}) {
  // Lottie placeholder until art is commissioned. For now, an SVG-rigged buffalo.
  const [randomEmote, setRandomEmote] = useState<BoEmote>(emote);

  useEffect(() => {
    if (emote !== "idle") return;
    const id = setInterval(() => {
      const choices: BoEmote[] = ["idle", "idle", "idle", "hop", "cheer", "shrug"];
      setRandomEmote(choices[Math.floor(Math.random() * choices.length)] ?? "idle");
      setTimeout(() => setRandomEmote("idle"), 1000);
    }, 8000);
    return () => clearInterval(id);
  }, [emote]);

  const active = emote !== "idle" ? emote : randomEmote;

  // Bồ palette variants — different fur tones to pick at signup
  const PALETTES = [
    { body: "#3B5998", horn: "#E9B949", belly: "#7393C2", earring: "#FFD700" },
    { body: "#7E5C9E", horn: "#E9B949", belly: "#A88BC1", earring: "#FFD700" },
    { body: "#0E7C66", horn: "#E9B949", belly: "#6FB7A6", earring: "#FFD700" },
    { body: "#C93E60", horn: "#FAF6EC", belly: "#E78BA1", earring: "#FAF6EC" },
    { body: "#1A1423", horn: "#E9B949", belly: "#3D2F4F", earring: "#FFD700" },
    { body: "#D29A26", horn: "#1A1423", belly: "#EBC472", earring: "#1A1423" },
    { body: "#64748B", horn: "#E9B949", belly: "#94A3B8", earring: "#FFD700" },
    { body: "#a86332", horn: "#FAF6EC", belly: "#d49870", earring: "#FAF6EC" },
  ];
  const p = PALETTES[variant % PALETTES.length]!;

  return (
    <motion.div
      className={cn("inline-block", className)}
      style={{ width: size, height: size }}
      animate={variants[active]}
      transition={transition[active]}
      aria-label="Bồ the buffalo"
    >
      <svg viewBox="0 0 200 200" width={size} height={size}>
        {/* Body */}
        <ellipse cx="100" cy="130" rx="58" ry="46" fill={p.body} />
        {/* Belly */}
        <ellipse cx="100" cy="148" rx="38" ry="22" fill={p.belly} />
        {/* Head */}
        <ellipse cx="100" cy="80" rx="44" ry="38" fill={p.body} />
        {/* Snout */}
        <ellipse cx="100" cy="92" rx="22" ry="14" fill={p.belly} />
        {/* Nostrils */}
        <circle cx="93" cy="92" r="2" fill={p.body} />
        <circle cx="107" cy="92" r="2" fill={p.body} />
        {/* Horns — curving */}
        <path
          d="M 65 60 Q 50 40 60 28 Q 64 32 64 40 Q 70 50 75 56 Z"
          fill={p.horn}
          stroke={p.body}
          strokeWidth="1.5"
        />
        <path
          d="M 135 60 Q 150 40 140 28 Q 136 32 136 40 Q 130 50 125 56 Z"
          fill={p.horn}
          stroke={p.body}
          strokeWidth="1.5"
        />
        {/* Eyes */}
        {active === "sleep" ? (
          <>
            <path d="M 80 75 Q 86 80 92 75" stroke={p.belly} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 108 75 Q 114 80 120 75" stroke={p.belly} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="86" cy="74" r="5" fill="white" />
            <circle cx="86" cy="75" r="3" fill="#1A1423" />
            <circle cx="87" cy="74" r="1" fill="white" />
            <circle cx="114" cy="74" r="5" fill="white" />
            <circle cx="114" cy="75" r="3" fill="#1A1423" />
            <circle cx="115" cy="74" r="1" fill="white" />
          </>
        )}
        {/* Earring */}
        <circle cx="60" cy="92" r="3.5" fill={p.earring} stroke={p.body} strokeWidth="1" />
        {/* Mouth */}
        {active === "cheer" || active === "hop" ? (
          <path d="M 90 100 Q 100 112 110 100" stroke="#1A1423" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M 92 102 Q 100 106 108 102" stroke="#1A1423" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        {/* Legs */}
        <rect x="70" y="160" width="14" height="22" rx="4" fill={p.body} />
        <rect x="116" y="160" width="14" height="22" rx="4" fill={p.body} />
        {/* Tail */}
        <path d="M 158 130 Q 174 125 168 142" stroke={p.body} strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}
