"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useDataStore } from "@/lib/store/data-store";
import { formatMoney } from "@/lib/currency";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
dayjs.locale("ru");

/**
 * RecentTransactions — editorial лента последних операций.
 * Hover raise + sky-accent для доходов, нейтрал для расходов.
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
    <GlassCard live className="p-5 sm:p-6">
      <div className="flex items-end justify-between">
        <div className="kicker">Последние операции</div>
        <Link
          href="/app/transactions"
          className="group inline-flex items-center gap-1 text-[11px] font-medium text-[var(--hunter)] hover:text-[var(--text-primary)]"
        >
          Все
          <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          Здесь появится картина ваших финансов.
          <br />
          <span className="font-display-italic" style={{ color: "var(--hunter)" }}>
            Начнём с первой операции?
          </span>
        </div>
      ) : (
        <ul className="mt-4 space-y-1">
          {recent.map((t, i) => {
            const cat = cats.find((c) => c.id === t.categoryId);
            const isIncome = t.type === "income";
            return (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(i * 0.05, 0.35),
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="group relative flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-[var(--surface-2)]">
                  {/* thin hover marker */}
                  <span
                    aria-hidden
                    className="absolute inset-y-2 left-0 w-[2px] origin-top scale-y-0 rounded-full bg-[var(--hunter)] transition-transform duration-200 group-hover:scale-y-100"
                  />

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
                      {cat && <span>{cat.name}</span>}
                      <span>· {dayjs(t.transactionDate).fromNow()}</span>
                    </div>
                  </div>
                  <div
                    className={`tabular shrink-0 text-[13.5px] font-semibold ${
                      isIncome ? "text-[var(--accent-sky)]" : "text-[var(--text-primary)]"
                    }`}
                  >
                    {isIncome ? "+" : "−"}
                    {formatMoney(t.amountBaseMinor, base, { signDisplay: "never" })}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
