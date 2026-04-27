"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium ring-offset-background transition-all disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-lotus-400)] text-white shadow-[0_4px_0_0_var(--color-lotus-600)] hover:bg-[var(--color-lotus-500)] hover:shadow-[0_6px_0_0_var(--color-lotus-600)] hover:-translate-y-0.5",
        secondary:
          "bg-white text-[var(--color-lacquer)] shadow-[0_3px_0_0_rgba(26,20,35,0.15)] hover:-translate-y-0.5",
        ghost:
          "hover:bg-[color-mix(in_oklab,var(--color-lacquer)_6%,transparent)]",
        outline:
          "border-2 border-[var(--color-lacquer)] text-[var(--color-lacquer)] hover:bg-[var(--color-lacquer)] hover:text-white",
        success:
          "bg-[var(--color-jade-500)] text-white shadow-[0_4px_0_0_var(--color-jade-700)] hover:bg-[var(--color-jade-600)]",
        gold:
          "bg-[var(--color-gold-400)] text-[var(--color-lacquer)] shadow-[0_4px_0_0_var(--color-gold-600)] hover:-translate-y-0.5",
      },
      size: {
        default: "h-12 px-6 text-base",
        sm: "h-9 px-4 text-sm",
        lg: "h-14 px-8 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
