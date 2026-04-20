"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * GlassCard — основной контейнер с backdrop-filter (TZ 4.1, 4.6).
 * Применяем для dashboard cards, widget panels, floating navigation.
 * НЕ применяем для длинных форм и data-таблиц.
 */
type Variant = "default" | "strong" | "subtle";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  live?: boolean;
  as?: React.ElementType;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", live = false, as: Comp = "div", onMouseMove, ...props }, ref) => {
    const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
      if (live) {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      onMouseMove?.(e);
    };

    return (
      <Comp
        ref={ref}
        onMouseMove={handleMouseMove}
        className={cn(
          variant === "strong" ? "glass-strong" : variant === "subtle" ? "" : "glass",
          live && "glass-live",
          variant === "subtle" &&
            "bg-[var(--surface-1)] border border-[var(--border-subtle)] shadow-sm",
          "rounded-2xl",
          className,
        )}
        {...props}
      />
    );
  },
);
GlassCard.displayName = "GlassCard";

export const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1 p-5 pb-3", className)} {...props} />
));
GlassCardHeader.displayName = "GlassCardHeader";

export const GlassCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-[15px] font-medium text-[var(--text-secondary)]", className)}
    {...props}
  />
));
GlassCardTitle.displayName = "GlassCardTitle";

export const GlassCardBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-5 pb-5", className)} {...props} />
));
GlassCardBody.displayName = "GlassCardBody";
