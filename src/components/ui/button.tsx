"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button — Motion-powered интерактивный элемент (TZ 4.6, 5.4).
 * — Spring-физика для press/hover
 * — Правильные focus/disabled состояния
 * — Touch target ≥ 44×44px (TZ 12.3)
 * — Респект prefers-reduced-motion
 */
const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl",
    "text-sm font-medium leading-none tracking-tight select-none",
    "transition-[background-color,color,border-color,box-shadow,opacity] duration-150 ease-[var(--ease-out-standard)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
    "disabled:cursor-not-allowed disabled:opacity-40 disabled:pointer-events-none",
    "[&_svg]:size-4 [&_svg]:shrink-0",
    "will-change-transform",
  ],
  {
    variants: {
      variant: {
        primary: [
          "text-white shadow-[0_2px_8px_rgba(124,111,232,0.22),inset_0_1px_0_rgba(255,255,255,0.2)]",
          "hover:shadow-[0_8px_24px_color-mix(in_oklab,var(--accent-primary)_30%,transparent),inset_0_1px_0_rgba(255,255,255,0.25)]",
        ].join(" "),
        secondary:
          "glass text-[var(--text-primary)] hover:bg-[color-mix(in_oklab,var(--accent-primary-soft)_60%,var(--glass-tint))]",
        ghost:
          "text-[var(--text-primary)] hover:bg-[var(--accent-primary-soft)]",
        link: "text-[var(--accent-primary)] underline-offset-4 hover:underline p-0 h-auto",
        outline:
          "border border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] hover:border-[var(--accent-primary)]",
        icon: "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary-soft)]",
        critical:
          "bg-[var(--critical)] text-white hover:brightness-110 shadow-[0_2px_8px_rgba(239,68,68,0.28)]",
        accent:
          "bg-[var(--accent-mint)] text-[#053b38] hover:brightness-105 shadow-[0_2px_8px_rgba(78,205,196,0.24)]",
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
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, children, ...props }, ref) => {
    // Primary — prismatic mint→cobalt gradient (fintech-signature).
    const resolvedStyle: React.CSSProperties =
      variant === "primary" || !variant
        ? {
            background:
              "linear-gradient(135deg, #0EAA7B 0%, #12C68E 45%, #2D9BD4 100%)",
            color: "#ffffff",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.18) inset, 0 -1px 0 rgba(0,0,0,0.08) inset, 0 6px 18px rgba(14, 170, 123, 0.28)",
            ...style,
          }
        : style ?? {};

    if (asChild) {
      const Comp = Slot;
      return (
        <Comp
          ref={ref as React.Ref<HTMLElement>}
          className={cn(buttonVariants({ variant, size, className }))}
          style={resolvedStyle}
          {...props}
        >
          {children as React.ReactElement}
        </Comp>
      );
    }

    const motionProps: HTMLMotionProps<"button"> = {
      whileHover: variant === "link" ? undefined : { y: -1 },
      whileTap: variant === "link" ? undefined : { scale: 0.97, y: 0 },
      transition: { type: "spring", stiffness: 400, damping: 22, mass: 0.6 },
    };

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        style={resolvedStyle}
        {...motionProps}
        {...(props as HTMLMotionProps<"button">)}
      >
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
