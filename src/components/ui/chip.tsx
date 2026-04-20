"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * CategoryChip — pill с иконкой и цветом (TZ 4.6).
 * Motion-powered press: scale + subtle lift. Активное состояние —
 * ring с мягким pop.
 */
export interface ChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  color?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md";
  interactive?: boolean;
  active?: boolean;
}

export function Chip({
  children,
  color,
  icon,
  size = "md",
  interactive = false,
  active = false,
  className,
  ...props
}: ChipProps) {
  const style: React.CSSProperties = color
    ? {
        background: active
          ? `color-mix(in oklab, ${color} 28%, transparent)`
          : `color-mix(in oklab, ${color} 16%, transparent)`,
        color,
        borderColor: active ? color : "transparent",
      }
    : {
        borderColor: "transparent",
      };

  const Comp: any = interactive ? motion.span : "span";
  const motionProps = interactive
    ? {
        whileHover: { y: -1 },
        whileTap: { scale: 0.95 },
        transition: { type: "spring", stiffness: 500, damping: 24 },
      }
    : {};

  return (
    <Comp
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium tracking-tight select-none whitespace-nowrap will-change-transform",
        "transition-[background-color,border-color,color] duration-150 ease-[var(--ease-out-standard)]",
        size === "sm" ? "h-6 px-2.5 text-[11px]" : "h-7 px-3 text-xs",
        !color && "bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]",
        interactive && "cursor-pointer",
        active && "shadow-[0_0_0_1px_currentColor,0_2px_8px_color-mix(in_oklab,currentColor_25%,transparent)]",
        className,
      )}
      style={style}
      {...motionProps}
      {...props}
    >
      {icon && <span className="flex items-center text-[13px]">{icon}</span>}
      {children}
    </Comp>
  );
}
