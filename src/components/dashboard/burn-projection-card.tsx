"use client";

import * as React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { projectMonthExpenses } from "@/lib/formulas";
import { useDataStore } from "@/lib/store/data-store";
import { formatMoney } from "@/lib/currency";
import { ProgressBar } from "@/components/ui/progress";

/**
 * Burn rate projection (TZ 8.3.1).
 * Адаптивно: компактное число, мягкий копирайт по TZ 9.3.
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
      <div className="text-[11px] sm:text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
        Прогноз месяца
      </div>
      <div className="mt-3">
        <div className="tabular whitespace-nowrap text-[24px] sm:text-[28px] font-semibold leading-none">
          {formatMoney(proj.projectedMonthTotal, base, { compact: useCompact })}
        </div>
        <div className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
          Если ритм сохранится — выйдет примерно столько. Это точка вашего выбора.
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar value={percent} tone="sky" />
        <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
          <span className="tabular truncate pr-2">
            Уже: {formatMoney(proj.totalSoFar, base, { compact: useCompact })}
          </span>
          <span className="shrink-0">Осталось {proj.daysRemaining} дн.</span>
        </div>
      </div>
    </GlassCard>
  );
}
