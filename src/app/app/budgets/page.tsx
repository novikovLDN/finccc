"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { Chip } from "@/components/ui/chip";
import { useDataStore } from "@/lib/store/data-store";
import { budgetStatus } from "@/lib/formulas";
import type { Budget, BudgetPeriodType } from "@/lib/types";
import type { CurrencyCode } from "@/lib/currency";
import { formatMoney } from "@/lib/currency";

// Lazy load: форма создания открывается только по кнопке
const BudgetCreateDialog = dynamic(
  () => import("@/components/budgets/budget-create-dialog").then((m) => m.BudgetCreateDialog),
  { ssr: false },
);

/**
 * Бюджеты (TZ 7.4).
 * Flexible бюджетирование. Прогресс-бары мягкие. Мягкое уведомление
 * при 80% (TZ 7.4 BDG-08). Прогноз по burn-rate (TZ 7.4 BDG-03).
 */
export default function BudgetsPage() {
  const hydrated = useDataStore((s) => s._hydrated);
  const budgets = useDataStore((s) => s.budgets);
  const cats = useDataStore((s) => s.categories);
  const txns = useDataStore((s) => s.transactions);
  const deleteBudget = useDataStore((s) => s.deleteBudget);
  const baseCurrency = useDataStore((s) => s.settings.baseCurrency);

  const [open, setOpen] = React.useState(false);

  if (!hydrated) return null;

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Бюджеты</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Мягкие лимиты. Никаких красных чисел — только ориентиры.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Новый бюджет
        </Button>
      </section>

      {budgets.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <p className="text-[15px] font-medium">Ещё нет бюджетов.</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Бюджет — это ориентир, а не правило. Создайте первый, когда захочется.
          </p>
        </GlassCard>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {budgets.map((b, i) => {
              const cat = cats.find((c) => c.id === b.categoryId);
              const status = budgetStatus(b, txns);
              const alertSoft = status.softAlert;
              return (
                <motion.li
                  layout
                  key={b.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <GlassCard live className="h-full p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[16px]"
                          style={{
                            background: cat
                              ? `color-mix(in oklab, ${cat.color} 18%, transparent)`
                              : "var(--accent-primary-soft)",
                          }}
                          aria-hidden
                        >
                          {cat?.icon ?? "💰"}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {b.name ?? (cat ? cat.name : "Общий бюджет")}
                          </div>
                          <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">
                            {periodLabel(b.periodType)}
                          </div>
                        </div>
                      </div>
                      <button
                        aria-label="Удалить бюджет"
                        className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--accent-primary-soft)] hover:text-[var(--text-primary)]"
                        onClick={() => deleteBudget(b.id)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-baseline justify-between">
                        <span className="tabular text-[24px] font-semibold">
                          {formatMoney(status.usedMinor, baseCurrency, { compact: true })}
                        </span>
                        <span className="tabular text-xs text-[var(--text-secondary)]">
                          из {formatMoney(b.amountMinor, b.currency, { compact: true })}
                        </span>
                      </div>
                      <ProgressBar
                        className="mt-2"
                        value={status.percent}
                        tone="auto"
                        showLabel
                        label={`${Math.round(status.percent)}% использовано`}
                      />
                    </div>

                    <div className="mt-4 rounded-xl bg-[var(--surface-2)] p-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="size-3.5 text-[var(--accent-sky)]" aria-hidden />
                        <span>
                          При текущем ритме к концу периода —{" "}
                          <span className="tabular font-medium text-[var(--text-primary)]">
                            {Math.round(status.projectedEndPercent)}%
                          </span>
                        </span>
                      </div>
                      {alertSoft && (
                        <p className="mt-2 text-[var(--accent-peach)]">
                          Бюджет прошёл 80% — хотите посмотреть, на что именно?
                        </p>
                      )}
                    </div>

                    {cat && (
                      <div className="mt-3">
                        <Chip color={cat.color} size="sm">
                          {cat.name}
                        </Chip>
                      </div>
                    )}
                  </GlassCard>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {open && <BudgetCreateDialog open={open} onOpenChange={setOpen} />}
    </div>
  );
}

function periodLabel(p: BudgetPeriodType) {
  return p === "week" ? "Неделя" : p === "quarter" ? "Квартал" : "Месяц";
}
