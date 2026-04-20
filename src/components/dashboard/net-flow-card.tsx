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
 * Большое число — compact для предотвращения переноса.
 * Под ним 2 mini-tile с доходами/расходами в фиксированной высоте.
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

  // Если число большое — используем compact (12,3K ₽), иначе полное.
  const useCompact = Math.abs(net) >= 1_000_000_00 || Math.abs(income) >= 1_000_000_00;

  return (
    <GlassCard live className="md:col-span-2 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] sm:text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Net flow · {periodLabel(period)}
        </div>
        {rate != null && (
          <span
            className="tabular shrink-0 rounded-full bg-[var(--accent-mint-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent-mint)]"
            title="Savings rate (TZ 8.2.4)"
          >
            {rate >= 0 ? "+" : ""}
            {rate.toFixed(1)}%
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <NumericDisplay
          valueMinor={net}
          currency={base}
          size="display"
          signDisplay="always"
          tone={net >= 0 ? "mint" : "neutral"}
          compact={useCompact}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
        <div className="rounded-xl bg-[var(--surface-2)] p-3 sm:p-4 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
            <TrendingUp className="size-3.5 text-[var(--accent-sky)] shrink-0" aria-hidden />
            <span>Доходы</span>
          </div>
          <div className="tabular mt-1 truncate text-[16px] sm:text-[20px] font-semibold text-[var(--accent-sky)]">
            {formatMoney(income, base, { compact: useCompact })}
          </div>
        </div>
        <div className="rounded-xl bg-[var(--surface-2)] p-3 sm:p-4 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
            <TrendingDown className="size-3.5 text-[var(--text-secondary)] shrink-0" aria-hidden />
            <span>Расходы</span>
          </div>
          <div className="tabular mt-1 truncate text-[16px] sm:text-[20px] font-semibold text-[var(--text-primary)]">
            {formatMoney(expenses, base, { compact: useCompact })}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function periodLabel(p: string) {
  return (
    {
      day: "за день",
      week: "за неделю",
      month: "за месяц",
      quarter: "за квартал",
      year: "за год",
      all: "за всё время",
    } as Record<string, string>
  )[p] ?? p;
}
