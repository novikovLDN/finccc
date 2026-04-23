"use client";

import * as React from "react";
import { motion, useReducedMotion, useTime, useTransform } from "motion/react";
import { GlassCard } from "@/components/ui/glass-card";
import { NumericDisplay } from "@/components/ui/numeric-display";
import {
  totalIncome,
  totalExpenses,
  netFlow,
  savingsRate,
  periodRange,
  inRange,
  addDays,
  startOfDay,
  endOfDay,
} from "@/lib/formulas";
import { useDataStore } from "@/lib/store/data-store";
import { useShellStore } from "@/components/shell/store";
import { formatMoney } from "@/lib/currency";

/**
 * NetFlowCard (TZ 6.1, 8.2.3) с живым sparkline как в landing preview.
 * Editorial-подача: Fraunces для hero-числа, kicker, hunter-accent pill.
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

  const useCompact =
    Math.abs(net) >= 1_000_000_00 || Math.abs(income) >= 1_000_000_00;

  // Построение sparkline дневного net-flow за период
  const sparkData = React.useMemo(() => {
    const days = Math.min(
      60,
      Math.max(
        7,
        Math.round((range.end.getTime() - range.start.getTime()) / 86_400_000),
      ),
    );
    const points: number[] = [];
    let cumulative = 0;
    for (let i = 0; i < days; i++) {
      const d = addDays(range.start, i);
      const dayRange = { start: startOfDay(d), end: endOfDay(d) };
      const dayIncome = txns
        .filter(
          (t) =>
            !t.deletedAt && t.type === "income" && inRange(t.transactionDate, dayRange),
        )
        .reduce((a, b) => a + b.amountBaseMinor, 0);
      const dayExpense = txns
        .filter(
          (t) =>
            !t.deletedAt && t.type === "expense" && inRange(t.transactionDate, dayRange),
        )
        .reduce((a, b) => a + b.amountBaseMinor, 0);
      cumulative += dayIncome - dayExpense;
      points.push(cumulative);
    }
    return points;
  }, [txns, range]);

  return (
    <GlassCard live className="md:col-span-2 overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="kicker">Net flow · {periodLabel(period)}</div>
        {rate != null && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.3 }}
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
          </motion.span>
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

      {/* Editorial sparkline */}
      {sparkData.length >= 3 && <MiniSparkline values={sparkData} />}

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
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

/**
 * Мини-sparkline в стиле landing preview — с running dot.
 */
function MiniSparkline({ values }: { values: number[] }) {
  const reduce = useReducedMotion();
  const time = useTime();

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const W = 480;
  const H = 56;
  const stepX = W / Math.max(1, values.length - 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = H - ((v - min) / span) * H;
    return { x, y };
  });

  const path =
    points.length < 2
      ? ""
      : `M ${points[0].x},${points[0].y} ` +
        points
          .slice(1)
          .map((p, i) => {
            const prev = points[i];
            const cx = (prev.x + p.x) / 2;
            return `Q ${cx},${prev.y} ${p.x},${p.y}`;
          })
          .join(" ");

  const areaPath = path ? `${path} L ${W},${H} L 0,${H} Z` : "";

  // Running dot: движется по path раз в 5s
  const dotProgress = useTransform(time, (t) =>
    reduce ? 1 : ((t / 1000) % 5) / 5,
  );
  const dotIndex = useTransform(dotProgress, (p) =>
    Math.min(points.length - 1, Math.floor(p * points.length)),
  );
  const dotX = useTransform(dotIndex, (i) => points[i]?.x ?? 0);
  const dotY = useTransform(dotIndex, (i) => points[i]?.y ?? 0);
  const dotOpacity = useTransform(dotProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

  return (
    <div className="mt-4 -mx-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-12 w-full">
        <defs>
          <linearGradient id="net-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--hunter)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--hunter)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={areaPath}
          fill="url(#net-spark-fill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke="var(--hunter)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
        />
        {!reduce && (
          <motion.circle
            r="3.5"
            fill="var(--hunter)"
            cx={dotX}
            cy={dotY}
            style={{ opacity: dotOpacity, filter: "drop-shadow(0 0 6px rgba(30,58,46,0.5))" }}
          />
        )}
      </svg>
    </div>
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
