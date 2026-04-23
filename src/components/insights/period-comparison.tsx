"use client";

import * as React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useDataStore } from "@/lib/store/data-store";
import {
  totalExpenses,
  totalIncome,
  startOfMonth,
  endOfMonth,
  addDays,
} from "@/lib/formulas";
import { formatMoney } from "@/lib/currency";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

/**
 * Сравнение периодов side-by-side (TZ 6.3 Flow 3, 7.9 ANL-06).
 * Стрелки серого цвета — без красно-зелёной кодировки.
 */
export function PeriodComparison() {
  const txns = useDataStore((s) => s.transactions);
  const base = useDataStore((s) => s.settings.baseCurrency);

  const now = new Date();
  const thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };
  const prevMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = { start: startOfMonth(prevMonthRef), end: endOfMonth(prevMonthRef) };
  const last7 = { start: addDays(new Date(now), -6), end: now };
  const prev7 = { start: addDays(new Date(now), -13), end: addDays(new Date(now), -7) };

  const rows = [
    {
      label: "Расходы · этот месяц vs прошлый",
      current: totalExpenses(txns, thisMonth),
      previous: totalExpenses(txns, prevMonth),
    },
    {
      label: "Доходы · этот месяц vs прошлый",
      current: totalIncome(txns, thisMonth),
      previous: totalIncome(txns, prevMonth),
    },
    {
      label: "Расходы · 7 дн vs предыдущие 7",
      current: totalExpenses(txns, last7),
      previous: totalExpenses(txns, prev7),
    },
  ];

  return (
    <GlassCard live className="p-5 sm:p-6">
      <div className="kicker">Сравнение периодов</div>
      <ul className="mt-4 space-y-4">
        {rows.map((r) => {
          const delta = r.current - r.previous;
          const pct = r.previous > 0 ? (delta / r.previous) * 100 : null;
          const dir = Math.abs(delta) < 1 ? "flat" : delta > 0 ? "up" : "down";
          return (
            <li key={r.label}>
              <div className="text-xs text-[var(--text-secondary)]">{r.label}</div>
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <span className="tabular text-[20px] font-semibold">
                  {formatMoney(r.current, base, { compact: true })}
                </span>
                <span className="tabular inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  {dir === "up" ? (
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  ) : dir === "down" ? (
                    <ArrowDownRight className="size-3.5" aria-hidden />
                  ) : (
                    <Minus className="size-3.5" aria-hidden />
                  )}
                  {pct == null ? (
                    <>новое</>
                  ) : (
                    <>
                      {pct >= 0 ? "+" : ""}
                      {pct.toFixed(1)}%
                    </>
                  )}
                  <span className="text-[var(--text-tertiary)]">· было {formatMoney(r.previous, base, { compact: true })}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
