"use client";

import * as React from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, sankeyLeft } from "d3-sankey";
import { GlassCard } from "@/components/ui/glass-card";
import { periodRange, totalIncome, categoryBreakdown } from "@/lib/formulas";
import { useDataStore } from "@/lib/store/data-store";
import { useShellStore } from "@/components/shell/store";
import { formatMoney } from "@/lib/currency";
import { motion } from "motion/react";

/**
 * Sankey-диаграмма: доход → категории расходов (TZ 7.9 ANL-04).
 * Ключевой уникум Mindful Money (TZ 3.6 feature matrix).
 */
export function SankeyFlow() {
  const period = useShellStore((s) => s.period);
  const txns = useDataStore((s) => s.transactions);
  const cats = useDataStore((s) => s.categories);
  const base = useDataStore((s) => s.settings.baseCurrency);
  const range = React.useMemo(() => periodRange(period), [period]);

  const data = React.useMemo(() => {
    const income = totalIncome(txns, range);
    const breakdown = categoryBreakdown(txns, range).slice(0, 8);

    if (income === 0 && breakdown.length === 0) return null;

    const totalExpense = breakdown.reduce((a, b) => a + b.total, 0);
    const nodes = [
      { name: "Доход", type: "source" as const, color: "var(--accent-sky)" },
      ...breakdown.map((b) => {
        const c = cats.find((x) => x.id === b.categoryId);
        return { name: c?.name ?? "Без категории", type: "expense" as const, color: c?.color ?? "#9CA3AF" };
      }),
      ...(income > totalExpense ? [{ name: "Накопления", type: "savings" as const, color: "var(--accent-mint)" }] : []),
    ];

    const links = breakdown.map((b, i) => ({
      source: 0,
      target: i + 1,
      value: b.total,
    }));
    if (income > totalExpense) {
      links.push({
        source: 0,
        target: nodes.length - 1,
        value: income - totalExpense,
      });
    }
    return { nodes, links };
  }, [txns, cats, range]);

  const [size, setSize] = React.useState({ w: 800, h: 340 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        setSize({ w, h: Math.max(280, Math.min(400, w * 0.45)) });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const rendered = React.useMemo(() => {
    if (!data) return null;
    const sankeyGen = sankey<{ name: string; type: string; color: string }, {}>()
      .nodeWidth(14)
      .nodePadding(14)
      .nodeAlign(sankeyLeft)
      .extent([
        [10, 10],
        [size.w - 10, size.h - 10],
      ]);
    const graph = sankeyGen({
      nodes: data.nodes.map((n) => ({ ...n })),
      links: data.links.map((l) => ({ ...l })),
    });
    return graph;
  }, [data, size]);

  return (
    <GlassCard live className="p-6">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Потоки денег
        </div>
        <span className="text-[11px] text-[var(--text-tertiary)]">Доход → категории</span>
      </div>
      <div ref={containerRef} className="mt-4">
        {!rendered ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-[var(--text-secondary)]">
            Sankey покажет потоки, когда появятся операции.
          </div>
        ) : (
          <motion.svg
            width={size.w}
            height={size.h}
            role="img"
            aria-label="Sankey: доход и категории"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <g>
              {rendered.links.map((link, i) => {
                const path = sankeyLinkHorizontal()(link as any);
                const target = link.target as any;
                return (
                  <motion.path
                    key={i}
                    d={path ?? ""}
                    fill="none"
                    stroke={target.color}
                    strokeOpacity={0.25}
                    strokeWidth={Math.max(1, link.width ?? 0)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.03, duration: 0.6 }}
                  >
                    <title>
                      {(link.source as any).name} → {target.name}:{" "}
                      {formatMoney((link.value ?? 0) as number, base, { compact: true })}
                    </title>
                  </motion.path>
                );
              })}
            </g>
            <g>
              {rendered.nodes.map((n: any, i: number) => (
                <motion.g
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <rect
                    x={n.x0}
                    y={n.y0}
                    width={n.x1 - n.x0}
                    height={Math.max(1, n.y1 - n.y0)}
                    fill={n.color}
                    rx={4}
                    ry={4}
                  />
                  <text
                    x={(n.x0 ?? 0) < size.w / 2 ? (n.x1 ?? 0) + 6 : (n.x0 ?? 0) - 6}
                    y={((n.y0 ?? 0) + (n.y1 ?? 0)) / 2}
                    textAnchor={(n.x0 ?? 0) < size.w / 2 ? "start" : "end"}
                    dominantBaseline="middle"
                    fill="var(--text-primary)"
                    fontSize={12}
                    fontWeight={500}
                  >
                    {n.name} · {formatMoney((n.value ?? 0) as number, base, { compact: true })}
                  </text>
                </motion.g>
              ))}
            </g>
          </motion.svg>
        )}
      </div>
    </GlassCard>
  );
}
