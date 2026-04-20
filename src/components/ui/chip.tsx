"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * CategoryChip — pill с иконкой и цветом категории (TZ 4.6).
 * Mini-pill (tabs/chips) радиус 999px (TZ 4.4).
 */
export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
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
        background: `color-mix(in oklab, ${color} 18%, transparent)`,
        color,
      }
    : {};

  return (
    <span
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium tracking-tight select-none whitespace-nowrap",
        size === "sm" ? "h-6 px-2.5 text-[11px]" : "h-7 px-3 text-xs",
        !color && "bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]",
        interactive &&
          "cursor-pointer transition-transform duration-150 hover:-translate-y-[1px] active:scale-[0.97]",
        active && "ring-2 ring-[var(--accent-primary)] ring-offset-1 ring-offset-[var(--bg-primary)]",
        className,
      )}
      style={style}
      {...props}
    >
      {icon && <span className="flex items-center text-[13px]">{icon}</span>}
      {children}
    </span>
  );
}
