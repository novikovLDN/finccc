"use client";

import * as React from "react";
import { motion } from "motion/react";
import { GlassCard } from "@/components/ui/glass-card";
import { useDataStore } from "@/lib/store/data-store";
import { addDays, startOfDay } from "@/lib/formulas";
import { formatMoney } from "@/lib/currency";

/**
 * Calendar heatmap (TZ 7.9 ANL-05).
 * Показывает интенсивность трат по дням — GitHub-style.
 * Без красного: градация по mint→primary.
 */
export function CalendarHeatmap({ days = 84 }: { days?: number }) {
  const txns = useDataStore((s) => s.transactions);
  const base = useDataStore((s) => s.settings.baseCurrency);

  const grid = React.useMemo(() => {
    const today = startOfDay(new Date());
    const map = new Map<string, number>();
    for (const t of txns) {
      if (t.deletedAt || t.type !== "expense") continue;
      map.set(t.transactionDate, (map.get(t.transactionDate) ?? 0) + t.amountBaseMinor);
    }
    const start = addDays(today, -days + 1);
    // Align to Monday
    const dow = (start.getDay() + 6) % 7;
    const alignedStart = addDays(start, -dow);
    const cells: Array<{ date: string; value: number; col: number; row: number }> = [];
    let cursor = new Date(alignedStart);
    let col = 0;
    while (cursor <= today) {
      for (let r = 0; r < 7; r++) {
        const iso = cursor.toISOString().slice(0, 10);
        const value = map.get(iso) ?? 0;
        cells.push({ date: iso, value, col, row: r });
        cursor = addDays(cursor, 1);
        if (cursor > today) break;
      }
      col++;
    }
    const max = Math.max(1, ...cells.map((c) => c.value));
    return { cells, max, cols: col + 1 };
  }, [txns, days]);

  const size = 14;
  const gap = 3;
  const width = grid.cols * (size + gap);
  const height = 7 * (size + gap);

  return (
    <GlassCard live className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="kicker">Темп по дням</div>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
          {days} дней
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg width={width} height={height} role="img" aria-label="Календарь трат">
          {grid.cells.map((c) => {
            const intensity = c.value / grid.max;
            const inPast = new Date(c.date) <= new Date();
            return (
              <motion.rect
                key={`${c.col}-${c.row}`}
                x={c.col * (size + gap)}
                y={c.row * (size + gap)}
                width={size}
                height={size}
                rx={3}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(c.col * 0.01, 0.3) }}
                fill={
                  !inPast
                    ? "transparent"
                    : c.value === 0
                      ? "var(--surface-3)"
                      : `color-mix(in oklab, var(--hunter) ${10 + intensity * 75}%, transparent)`
                }
              >
                <title>
                  {c.date}: {formatMoney(c.value, base, { compact: true })}
                </title>
              </motion.rect>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
        <span>Меньше</span>
        {[0.1, 0.3, 0.55, 0.85].map((v, i) => (
          <span
            key={i}
            className="h-3 w-3 rounded-[3px]"
            style={{
              background: `color-mix(in oklab, var(--hunter) ${v * 100}%, transparent)`,
            }}
          />
        ))}
        <span>Больше</span>
      </div>
    </GlassCard>
  );
}
