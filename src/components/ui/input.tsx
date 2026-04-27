import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2 text-base outline-none transition-colors placeholder:text-[color-mix(in_oklab,var(--color-lacquer)_40%,transparent)] focus-visible:border-[var(--color-lotus-400)] focus-visible:ring-4 focus-visible:ring-[color-mix(in_oklab,var(--color-lotus-400)_20%,transparent)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
