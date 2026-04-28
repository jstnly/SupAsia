"use client";

import { useAccessibilityHydrated, useAccessibilityStore } from "@/lib/stores/accessibility";

export function AccessibilityToggle() {
  const hydrated = useAccessibilityHydrated();
  const micOptional = useAccessibilityStore((s) => s.micOptional);
  const setMicOptional = useAccessibilityStore((s) => s.setMicOptional);
  const checked = hydrated && micOptional;
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span className="min-w-0">
        <span className="block font-display text-sm font-semibold">Skip Speak exercises</span>
        <span className="block text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
          Replace mic-based prompts with tap-only Tone Match.
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setMicOptional(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-jade-500)]"
      />
    </label>
  );
}
