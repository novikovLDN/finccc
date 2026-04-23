"use client";

import * as React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { projectMonthExpenses } from "@/lib/formulas";
import { useDataStore } from "@/lib/store/data-store";
import { formatMoney } from "@/lib/currency";
import { ProgressBar } from "@/components/ui/progress";

/**
 * Burn projection (TZ 8.3.1) с Fraunces-числом и editorial-копирайтом.
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
      <div className="kicker">Прогноз месяца</div>
      <div className="mt-3">
        <div
          className="font-display whitespace-nowrap text-[clamp(1.5rem,3.5vw,2rem)] font-medium leading-none"
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
          <span className="font-display-italic">Точка вашего выбора.</span>
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
