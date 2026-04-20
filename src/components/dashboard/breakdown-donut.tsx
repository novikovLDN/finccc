"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "motion/react";
import { GlassCard } from "@/components/ui/glass-card";
import { categoryBreakdown, periodRange } from "@/lib/formulas";
import { useDataStore } from "@/lib/store/data-store";
import { useShellStore } from "@/components/shell/store";
import { formatMoney } from "@/lib/currency";

/**
 * Donut chart — breakdown по категориям (TZ 6.1, 7.9 ANL-03).
 * Плавная анимация secторов (TZ 5.4).
 */
export function BreakdownDonut() {
  const period = useShellStore((s) => s.period);
  const txns = useDataStore((s) => s.transactions);
  const cats = useDataStore((s) => s.categories);
  const base = useDataStore((s) => s.settings.baseCurrency);
  const range = React.useMemo(() => periodRange(period), [period]);
  const breakdown = React.useMemo(() => categoryBreakdown(txns, range), [txns, range]);

  const data = breakdown
    .slice(0, 7)
    .map((b) => {
      const c = cats.find((x) => x.id === b.categoryId);
      return {
        name: c?.name ?? "Без категории",
        icon: c?.icon ?? "•",
        value: b.total,
        share: b.share,
        color: c?.color ?? "#9CA3AF",
      };
    })
    .filter((d) => d.value > 0);

  const otherTotal = breakdown.slice(7).reduce((a, b) => a + b.total, 0);
  if (otherTotal > 0) {
    data.push({ name: "Другое", icon: "•", value: otherTotal, share: 0, color: "#D1D5DB" });
  }

  const totalSum = data.reduce((a, b) => a + b.value, 0);

  return (
    <GlassCard live className="p-6">
      <div className="text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
        Расходы по категориям
      </div>

      {totalSum === 0 ? (
        <div className="mt-10 flex h-[220px] flex-col items-center justify-center text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Тишина. Как появятся операции, здесь загорится радуга категорий.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-5">
          <div className="relative h-[180px] w-[180px] shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={86}
                  paddingAngle={2}
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                  animationDuration={600}
                  animationEasing="ease-out"
                >
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={false}
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const p = payload[0].payload as (typeof data)[number];
                    return (
                      <div className="glass rounded-xl px-3 py-2 text-xs shadow-lg">
                        <div className="font-medium">
                          {p.icon} {p.name}
                        </div>
                        <div className="tabular text-[var(--text-secondary)]">
                          {formatMoney(p.value, base)}
                        </div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">
                Всего
              </span>
              <span className="tabular text-[18px] font-semibold">
                {formatMoney(totalSum, base, { compact: true })}
              </span>
            </div>
          </div>

          <ul className="flex-1 space-y-1.5">
            {data.map((d, i) => (
              <motion.li
                key={d.name}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="flex items-center gap-2 text-[13px]"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: d.color }}
                  aria-hidden
                />
                <span className="flex-1 truncate text-[var(--text-primary)]">{d.name}</span>
                <span className="tabular text-[var(--text-secondary)]">
                  {((d.value / totalSum) * 100).toFixed(0)}%
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </GlassCard>
  );
}
