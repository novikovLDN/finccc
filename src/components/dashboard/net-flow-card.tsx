"use client";

import * as React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { NumericDisplay } from "@/components/ui/numeric-display";
import { totalIncome, totalExpenses, netFlow, savingsRate, periodRange } from "@/lib/formulas";
import { useDataStore } from "@/lib/store/data-store";
import { useShellStore } from "@/components/shell/store";
import { formatMoney } from "@/lib/currency";

/**
 * NetFlowCard (TZ 6.1, 8.2.3).
 * Editorial-подача: Fraunces число, kicker mono-caps, hunter-green
 * accent для положительного, нейтральный для отрицательного.
 * Никакого красного. Savings rate в pill справа.
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

  const useCompact = Math.abs(net) >= 1_000_000_00 || Math.abs(income) >= 1_000_000_00;

  return (
    <GlassCard live className="md:col-span-2 overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="kicker">Net flow · {periodLabel(period)}</div>
        </div>
        {rate != null && (
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              background: rate >= 0 ? "var(--hunter-soft)" : "var(--surface-2)",
              color: rate >= 0 ? "var(--hunter)" : "var(--text-secondary)",
            }}
            title="Savings rate (TZ 8.2.4)"
          >
            <span className="tabular">
              {rate >= 0 ? "+" : ""}
              {rate.toFixed(1)}%
            </span>
            <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-wider opacity-70">
              savings
            </span>
          </span>
        )}
      </div>

      <div className="mt-5 flex items-baseline gap-3">
        <NumericDisplay
          valueMinor={net}
          currency={base}
          size="display"
          signDisplay="always"
          tone={net >= 0 ? "mint" : "neutral"}
          compact={useCompact}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-3">
        <TileRow
          label="Доходы"
          value={formatMoney(income, base, { compact: useCompact })}
          tone="sky"
        />
        <TileRow
          label="Расходы"
          value={formatMoney(expenses, base, { compact: useCompact })}
          tone="ink"
        />
      </div>
    </GlassCard>
  );
}

function TileRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "sky" | "ink";
}) {
  return (
    <div className="rounded-2xl bg-[var(--surface-2)] p-3.5 sm:p-4">
      <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
        {label}
      </div>
      <div
        className="font-display mt-1.5 truncate text-[18px] sm:text-[22px] font-medium leading-none"
        style={{
          color: tone === "sky" ? "var(--accent-sky)" : "var(--text-primary)",
          fontVariationSettings: '"SOFT" 40, "opsz" 144',
          letterSpacing: "-0.015em",
        }}
      >
        {value}
      </div>
    </div>
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
