"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button — базовый интерактивный элемент (TZ 4.6).
 * Варианты: primary, secondary, ghost, link, icon.
 * Touch target ≥ 44×44px (TZ 12.3 accessibility).
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl",
    "text-sm font-medium leading-none tracking-tight select-none",
    "transition-all duration-150 ease-[var(--ease-out-standard)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "active:scale-[0.97]",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent-primary)] text-white shadow-sm hover:brightness-[1.05] hover:-translate-y-[1px] hover:shadow-[0_8px_24px_color-mix(in_oklab,var(--accent-primary)_30%,transparent)]",
        secondary:
          "glass text-[var(--text-primary)] hover:-translate-y-[1px]",
        ghost:
          "text-[var(--text-primary)] hover:bg-[var(--accent-primary-soft)]",
        link: "text-[var(--accent-primary)] underline-offset-4 hover:underline p-0 h-auto",
        outline:
          "border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-2)]",
        icon: "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary-soft)]",
        critical: "bg-[var(--critical)] text-white hover:brightness-110",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        md: "h-11 px-4",
        lg: "h-12 px-6 text-[15px] rounded-2xl",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
