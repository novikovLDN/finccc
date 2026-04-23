"use client";

import * as React from "react";
import { motion } from "motion/react";
import { GlassCard } from "@/components/ui/glass-card";
import { projectMonthExpenses } from "@/lib/formulas";
import { useDataStore } from "@/lib/store/data-store";
import { formatMoney } from "@/lib/currency";
import { ProgressBar } from "@/components/ui/progress";

/**
 * BurnProjectionCard (TZ 8.3.1). Editorial: Fraunces display number,
 * honey-accent pill с «осталось дней».
 */
export function BurnProjectionCard() {
  const txns = useDataStore((s) => s.transactions);
  const base = useDataStore((s) => s.settings.baseCurrency);
  const proj = React.useMemo(() => projectMonthExpenses(txns), [txns]);
  const useCompact = proj.projectedMonthTotal >= 1_000_000_00;

  const percent =
    proj.projectedMonthTotal > 0
      ? Math.min(100, (proj.totalSoFar / proj.projectedMonthTotal) * 100)
      : 0;

  return (
    <GlassCard live className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="kicker">Прогноз месяца</div>
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.25 }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={{
            background: "color-mix(in oklab, var(--accent-peach) 15%, transparent)",
            color: "var(--accent-peach)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent-peach)" }} />
          осталось {proj.daysRemaining} дн.
        </motion.span>
      </div>

      <div className="mt-4">
        <div
          className="font-display whitespace-nowrap text-[clamp(1.6rem,3.8vw,2.2rem)] font-medium leading-none"
          style={{
            fontVariationSettings: '"SOFT" 40, "opsz" 144',
            letterSpacing: "-0.015em",
            color: "var(--text-primary)",
          }}
        >
          {formatMoney(proj.projectedMonthTotal, base, { compact: useCompact })}
        </div>
        <div className="mt-2.5 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
          Если ритм сохранится — выйдет примерно столько.{" "}
          <span
            className="font-display-italic"
            style={{ color: "var(--hunter)" }}
          >
            Точка вашего выбора.
          </span>
        </div>
      </div>

      <div className="mt-4">
        <ProgressBar value={percent} tone="mint" />
        <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
          <span className="tabular truncate pr-2">
            Уже: {formatMoney(proj.totalSoFar, base, { compact: useCompact })}
          </span>
          <span className="shrink-0 font-mono uppercase tracking-[0.14em]">
            {Math.round(percent)}% пути
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
