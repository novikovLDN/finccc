"use client";

import * as React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { NumericDisplay } from "@/components/ui/numeric-display";
import { TrendingUp, TrendingDown } from "lucide-react";
import { totalIncome, totalExpenses, netFlow, savingsRate, periodRange } from "@/lib/formulas";
import { useDataStore } from "@/lib/store/data-store";
import { useShellStore } from "@/components/shell/store";
import { formatMoney } from "@/lib/currency";

/**
 * Net Flow widget (TZ 6.1, 8.2.3).
 * Нейтральный цвет, не красный. Sign display always.
 */
export function NetFlowCard() {
  const period = useShellStore((s) => s.period);
  const txns = useDataStore((s) => s.transactions);
  const base = useDataStore((s) => s.settings.baseCurrency);

  const range = React.useMemo(() => periodRange(period), [period]);
  const income = totalIncome(txns, range);
  const expenses = totalExpenses(txns, range);
  const net = netFlow(txns, range);
  const rate = savingsRate(txns, range);

  return (
    <GlassCard live className="md:col-span-2 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Net flow · {periodLabel(period)}
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <NumericDisplay
              valueMinor={net}
              currency={base}
              size="display"
              signDisplay="always"
              tone={net >= 0 ? "mint" : "neutral"}
            />
            {rate != null && (
              <span
                className="tabular text-sm font-medium text-[var(--text-secondary)]"
                title="Savings rate (TZ 8.2.4)"
              >
                {rate >= 0 ? "+" : ""}
                {rate.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[var(--surface-2)] p-4">
          <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--text-secondary)]">
            <TrendingUp className="size-3.5 text-[var(--accent-sky)]" aria-hidden />
            Доходы
          </div>
          <div className="tabular mt-1.5 text-[22px] font-semibold text-[var(--accent-sky)]">
            {formatMoney(income, base)}
          </div>
        </div>
        <div className="rounded-2xl bg-[var(--surface-2)] p-4">
          <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--text-secondary)]">
            <TrendingDown className="size-3.5 text-[var(--text-secondary)]" aria-hidden />
            Расходы
          </div>
          <div className="tabular mt-1.5 text-[22px] font-semibold text-[var(--text-primary)]">
            {formatMoney(expenses, base)}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function periodLabel(p: string) {
  return (
    { day: "за день", week: "за неделю", month: "за месяц", quarter: "за квартал", year: "за год", all: "за всё время" } as Record<string, string>
  )[p] ?? p;
}
