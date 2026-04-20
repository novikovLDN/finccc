"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { periodRange, inRange, addDays, startOfDay, endOfDay } from "@/lib/formulas";
import { useDataStore } from "@/lib/store/data-store";
import { useShellStore } from "@/components/shell/store";
import { formatMoney, type CurrencyCode } from "@/lib/currency";

/**
 * Линейный график расходов по дням (TZ 7.9 ANL-02).
 */
export function SpendingTrend() {
  const period = useShellStore((s) => s.period);
  const txns = useDataStore((s) => s.transactions);
  const base = useDataStore((s) => s.settings.baseCurrency);
  const range = React.useMemo(() => periodRange(period), [period]);

  const data = React.useMemo(() => {
    const days: { label: string; date: string; value: number }[] = [];
    const totalDays = Math.min(
      90,
      Math.max(1, Math.round((range.end.getTime() - range.start.getTime()) / 86_400_000)),
    );
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(range.start, i);
      const dayRange = { start: startOfDay(d), end: endOfDay(d) };
      const value = txns
        .filter(
          (t) => !t.deletedAt && t.type === "expense" && inRange(t.transactionDate, dayRange),
        )
        .reduce((acc, t) => acc + t.amountBaseMinor, 0);
      days.push({
        label: `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`,
        date: d.toISOString().slice(0, 10),
        value,
      });
    }
    return days;
  }, [txns, range]);

  const hasData = data.some((d) => d.value > 0);

  return (
    <GlassCard live className="p-6 md:col-span-2">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Темп расходов
        </div>
      </div>

      <div className="mt-4 h-[180px]">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-[var(--text-secondary)]">
            Линия появится, когда добавите первые операции.
          </div>
        ) : (
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="mm-spending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                tickLine={false}
                axisLine={false}
                interval={Math.max(0, Math.floor(data.length / 6))}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatMoney(Number(v), base, { compact: true })}
              />
              <Tooltip
                cursor={{ stroke: "var(--accent-primary)", strokeOpacity: 0.2 }}
                content={({ payload }) => {
                  if (!payload?.[0]) return null;
                  const p = payload[0].payload as (typeof data)[number];
                  return (
                    <div className="glass rounded-xl px-3 py-2 text-xs">
                      <div>{p.label}</div>
                      <div className="tabular font-medium">
                        {formatMoney(p.value, base as CurrencyCode)}
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--accent-primary)"
                strokeWidth={2}
                fill="url(#mm-spending)"
                animationDuration={800}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}
