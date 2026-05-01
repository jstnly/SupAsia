"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Wraps a Vietnamese term (or any term needing explanation) with a subtle dotted
 * underline. Hover/tap reveals a tooltip with the English meaning. Friendly to
 * absolute beginners who can't read Vietnamese.
 *
 * Use anywhere a Vietnamese label appears in app chrome:
 *   <TermHint en="baby water buffalo">Bồ</TermHint>
 *   <TermHint en="thank you">Cảm ơn</TermHint>
 */
export function TermHint({
  en,
  children,
  className = "",
}: {
  en: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Close on outside click (mobile tap-to-open behavior)
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <span
      ref={ref}
      className={`relative inline-flex cursor-help items-baseline ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setOpen((v) => !v);
      }}
    >
      <span
        className="border-b border-dotted border-current/50"
        style={{ textDecorationSkipInk: "none" }}
      >
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-lacquer)] px-2 py-1 text-[11px] font-medium text-white shadow-[0_4px_12px_rgba(26,20,35,0.25)]"
        >
          {en}
        </span>
      )}
    </span>
  );
}
