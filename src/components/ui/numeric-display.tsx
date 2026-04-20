"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { formatMoney, type CurrencyCode } from "@/lib/currency";

/**
 * NumericDisplay — большая цифра с анимацией count-up (TZ 4.6, 5.4).
 * Применение: hero numbers, Net Worth, Total.
 * Длительность 600ms, ease-emphasis.
 */
export interface NumericDisplayProps {
  valueMinor: number;
  currency?: CurrencyCode;
  size?: "display" | "h1" | "h2" | "h3";
  tone?: "neutral" | "mint" | "sky" | "muted";
  signDisplay?: "auto" | "never" | "always";
  className?: string;
  compact?: boolean;
}

const SIZE_CLASS: Record<NonNullable<NumericDisplayProps["size"]>, string> = {
  display: "text-[clamp(1.75rem,7vw,3rem)] leading-[1.1]",
  h1: "text-[clamp(1.5rem,5vw,2.25rem)] leading-[1.15]",
  h2: "text-[clamp(1.25rem,4vw,1.875rem)] leading-[1.2]",
  h3: "text-[1.375rem] leading-[1.25]",
};

const TONE_CLASS: Record<NonNullable<NumericDisplayProps["tone"]>, string> = {
  neutral: "text-[var(--text-primary)]",
  mint: "text-[var(--accent-mint)]",
  sky: "text-[var(--accent-sky)]",
  muted: "text-[var(--text-secondary)]",
};

export function NumericDisplay({
  valueMinor,
  currency = "RUB",
  size = "display",
  tone = "neutral",
  signDisplay = "auto",
  compact = false,
  className,
}: NumericDisplayProps) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const mv = useMotionValue(reduce ? valueMinor : 0);
  const spring = useSpring(mv, { stiffness: 120, damping: 24, mass: 0.8 });
  const display = useTransform(spring, (v) =>
    formatMoney(Math.round(v), currency, { compact, signDisplay }),
  );

  React.useEffect(() => {
    mv.set(valueMinor);
  }, [valueMinor, mv]);

  return (
    <motion.span
      className={cn(
        "tabular font-semibold tracking-tight whitespace-nowrap",
        SIZE_CLASS[size],
        TONE_CLASS[tone],
        className,
      )}
    >
      {display}
    </motion.span>
  );
}
