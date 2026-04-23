"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * PageHeader — editorial-шапка для страниц приложения.
 *
 * Структура:
 *   [kicker mono-caps tracking] — · · ·
 *   [Fraunces display title] с опциональной italic-вставкой
 *   [subtitle Inter]
 *   [trailing actions, опционально]
 *
 * Анимация: staggered reveal на ~180ms.
 */
export interface PageHeaderProps {
  kicker?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  kicker,
  title,
  subtitle,
  trailing,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("relative flex flex-wrap items-end justify-between gap-5", className)}>
      <div className="min-w-0">
        {kicker && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.33, 1, 0.68, 1] }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-7 bg-[var(--warm-line)]" aria-hidden />
            <span className="kicker">{kicker}</span>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.06, ease: [0.33, 1, 0.68, 1] }}
          className="font-display mt-3 text-balance font-medium text-[var(--text-primary)]"
          style={{
            fontSize: "clamp(1.75rem, 3.6vw, 2.75rem)",
            lineHeight: 1.04,
          }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.14, ease: [0.33, 1, 0.68, 1] }}
            className="mt-2.5 max-w-[560px] text-[14px] leading-[1.65] text-[var(--text-secondary)]"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {trailing && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
          className="flex shrink-0 items-center gap-2"
        >
          {trailing}
        </motion.div>
      )}
    </header>
  );
}

/** Inline italic span с Fraunces italic для акцентов внутри заголовков. */
export function TitleItalic({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontStyle: "italic",
        fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
        color: "var(--hunter)",
      }}
    >
      {children}
    </span>
  );
}
