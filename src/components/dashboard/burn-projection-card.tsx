"use client";

import * as React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { projectMonthExpenses } from "@/lib/formulas";
import { useDataStore } from "@/lib/store/data-store";
import { formatMoney } from "@/lib/currency";
import { ProgressBar } from "@/components/ui/progress";

/**
 * Burn rate projection (TZ 8.3.1): "при текущем ритме до конца месяца — X".
 * Мягкий tone: "Если сохранится такой ритм..." (TZ 9.3).
 */
export function BurnProjectionCard() {
  const txns = useDataStore((s) => s.transactions);
  const base = useDataStore((s) => s.settings.baseCurrency);
  const proj = React.useMemo(() => projectMonthExpenses(txns), [txns]);

  const percent = proj.projectedMonthTotal > 0
    ? (proj.totalSoFar / proj.projectedMonthTotal) * 100
    : 0;

  return (
    <GlassCard live className="p-6">
      <div className="text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
        Прогноз месяца
      </div>
      <div className="mt-3">
        <div className="tabular text-[28px] font-semibold">
          {formatMoney(proj.projectedMonthTotal, base, { compact: true })}
        </div>
        <div className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
          Если ритм сохранится до конца месяца — выйдет примерно столько.
          <br />
          Это точка вашего выбора.
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar value={percent} tone="sky" />
        <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
          <span className="tabular">Уже: {formatMoney(proj.totalSoFar, base, { compact: true })}</span>
          <span>Осталось {proj.daysRemaining} дн.</span>
        </div>
      </div>
    </GlassCard>
  );
}
