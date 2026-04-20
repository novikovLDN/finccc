"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * BudgetBar — горизонтальный прогресс-бар для бюджета (TZ 4.6, 7.4 BDG-02).
 * Мягкие цвета: без красного. Overrun → peach (не critical).
 */
export interface ProgressBarProps {
  value: number; // 0..100+
  className?: string;
  tone?: "mint" | "sky" | "peach" | "auto";
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  className,
  tone = "auto",
  showLabel = false,
  label,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(value, 100));
  const overrun = value > 100;

  // Мягкая градация цвета: mint → sky → peach по ходу заполнения.
  const autoTone =
    value >= 100 ? "peach" : value >= 80 ? "peach" : value >= 50 ? "sky" : "mint";
  const resolvedTone = tone === "auto" ? autoTone : tone;

  const toneColor: Record<string, string> = {
    mint: "var(--accent-mint)",
    sky: "var(--accent-sky)",
    peach: "var(--accent-peach)",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>{label}</span>
          <span className="tabular">
            {Math.round(value)}
            %{overrun && <span className="ml-1 text-[var(--accent-peach)]">свыше</span>}
          </span>
        </div>
      )}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--surface-3)]"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 24,
            mass: 0.8,
          }}
          style={{ background: toneColor[resolvedTone] }}
        />
        {overrun && (
          <motion.div
            className="absolute inset-y-0 right-0 w-[2px] bg-[var(--accent-peach)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          />
        )}
      </div>
    </div>
  );
}
