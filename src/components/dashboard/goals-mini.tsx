"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress";
import { useDataStore } from "@/lib/store/data-store";
import { formatMoney } from "@/lib/currency";

/**
 * GoalsMini — editorial прогресс целей на dashboard.
 */
export function GoalsMini() {
  const goals = useDataStore((s) => s.goals);
  const base = useDataStore((s) => s.settings.baseCurrency);

  return (
    <GlassCard live className="p-5 sm:p-6">
      <div className="flex items-end justify-between">
        <div className="kicker">Цели</div>
        <Link
          href="/app/goals"
          className="group inline-flex items-center gap-1 text-[11px] font-medium text-[var(--hunter)] hover:text-[var(--text-primary)]"
        >
          Все
          <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="mt-5 text-sm text-[var(--text-secondary)] leading-relaxed">
          Цели — это{" "}
          <span
            className="font-display-italic"
            style={{ color: "var(--hunter)" }}
          >
            ориентир
          </span>
          , не обязательство. Создайте первую, когда захочется.
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {goals.slice(0, 3).map((g, i) => {
            const pct = Math.min(100, (g.currentSavedMinor / g.targetAmountMinor) * 100);
            return (
              <motion.li
                key={g.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="text-[16px]">{g.icon}</span> {g.name}
                  </span>
                  <span className="tabular text-[11.5px] text-[var(--text-secondary)]">
                    {formatMoney(g.currentSavedMinor, base, { compact: true })}
                    <span className="text-[var(--text-tertiary)] mx-1">/</span>
                    {formatMoney(g.targetAmountMinor, base, { compact: true })}
                  </span>
                </div>
                <ProgressBar value={pct} tone="mint" />
              </motion.li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
