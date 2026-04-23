"use client";

import * as React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress";
import { useDataStore } from "@/lib/store/data-store";
import { categoryBreakdown, periodRange } from "@/lib/formulas";
import { useShellStore } from "@/components/shell/store";
import { formatMoney } from "@/lib/currency";
import { motion } from "motion/react";

/**
 * Top-5 категорий + Avg per category (TZ 7.9 ANL-07, ANL-08).
 */
export function TopCategories() {
  const period = useShellStore((s) => s.period);
  const txns = useDataStore((s) => s.transactions);
  const cats = useDataStore((s) => s.categories);
  const base = useDataStore((s) => s.settings.baseCurrency);
  const range = React.useMemo(() => periodRange(period), [period]);
  const breakdown = React.useMemo(
    () => categoryBreakdown(txns, range).slice(0, 5),
    [txns, range],
  );

  return (
    <GlassCard live className="p-5 sm:p-6">
      <div className="flex items-end justify-between">
        <div className="kicker">Топ-5 категорий</div>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
          за период
        </span>
      </div>
      {breakdown.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          Пока пусто. Появятся категории — появится и картина.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {breakdown.map((b, i) => {
            const c = cats.find((x) => x.id === b.categoryId);
            const count = txns.filter(
              (t) =>
                !t.deletedAt &&
                t.type === "expense" &&
                t.categoryId === b.categoryId &&
                t.transactionDate >= range.start.toISOString().slice(0, 10) &&
                t.transactionDate <= range.end.toISOString().slice(0, 10),
            ).length;
            const avg = count > 0 ? b.total / count : 0;
            return (
              <motion.li
                key={String(b.categoryId)}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{c?.icon ?? "•"}</span>
                    <span className="font-medium">{c?.name ?? "Без категории"}</span>
                  </span>
                  <span className="tabular text-[var(--text-secondary)]">
                    {formatMoney(b.total, base, { compact: true })}
                  </span>
                </div>
                <ProgressBar value={b.share} tone="sky" />
                <div className="mt-1.5 text-[11px] text-[var(--text-tertiary)]">
                  {count} операций · средняя {formatMoney(avg, base, { compact: true })}
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
