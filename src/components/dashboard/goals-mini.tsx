"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress";
import { useDataStore } from "@/lib/store/data-store";
import { formatMoney } from "@/lib/currency";

/**
 * Прогресс целей на dashboard (TZ 6.1).
 */
export function GoalsMini() {
  const goals = useDataStore((s) => s.goals);
  const base = useDataStore((s) => s.settings.baseCurrency);

  return (
    <GlassCard live className="p-6">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Цели
        </div>
        <Link
          href="/app/goals"
          className="flex items-center gap-1 text-xs text-[var(--accent-primary)] hover:underline underline-offset-2"
        >
          Все <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="mt-6 text-sm text-[var(--text-secondary)] leading-relaxed">
          Цели — это не обязательство. Это ориентир. Создайте первую, когда захочется.
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
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <div className="mb-1 flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-2 font-medium">
                    <span>{g.icon}</span> {g.name}
                  </span>
                  <span className="tabular text-[var(--text-secondary)]">
                    {formatMoney(g.currentSavedMinor, base, { compact: true })} /{" "}
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
