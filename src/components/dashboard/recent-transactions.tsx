"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Chip } from "@/components/ui/chip";
import { useDataStore } from "@/lib/store/data-store";
import { formatMoney } from "@/lib/currency";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
dayjs.locale("ru");

/**
 * Лента последних операций (TZ 6.1).
 * Доходы — sky, расходы — нейтральные. Без красного.
 */
export function RecentTransactions({ limit = 6 }: { limit?: number }) {
  const txns = useDataStore((s) => s.transactions);
  const cats = useDataStore((s) => s.categories);
  const base = useDataStore((s) => s.settings.baseCurrency);

  const recent = txns
    .filter((t) => !t.deletedAt)
    .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate))
    .slice(0, limit);

  return (
    <GlassCard live className="p-6">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Последние операции
        </div>
        <Link
          href="/app/transactions"
          className="flex items-center gap-1 text-xs text-[var(--accent-primary)] hover:underline underline-offset-2"
        >
          Все <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          Здесь появится картина ваших финансов.
          <br />
          Начнём с первой операции?
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {recent.map((t, i) => {
            const cat = cats.find((c) => c.id === t.categoryId);
            const isIncome = t.type === "income";
            return (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.3 }}
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[var(--accent-primary-soft)] transition-colors"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[18px]"
                  style={{
                    background: cat
                      ? `color-mix(in oklab, ${cat.color} 18%, transparent)`
                      : "var(--surface-3)",
                  }}
                  aria-hidden
                >
                  {cat?.icon ?? "•"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{t.description}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                    {cat && (
                      <Chip color={cat.color} size="sm">
                        {cat.name}
                      </Chip>
                    )}
                    <span>· {dayjs(t.transactionDate).fromNow()}</span>
                  </div>
                </div>
                <div
                  className={`tabular shrink-0 text-sm font-semibold ${
                    isIncome ? "text-[var(--accent-sky)]" : "text-[var(--text-primary)]"
                  }`}
                >
                  {isIncome ? "+" : "−"}
                  {formatMoney(t.amountBaseMinor, base, { signDisplay: "never" })}
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
