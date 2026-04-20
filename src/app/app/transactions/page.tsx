"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Trash2, Pencil, Undo2, X, Filter } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { useDataStore } from "@/lib/store/data-store";
import { useTransactions } from "@/components/transactions/transactions-context";
import type { Transaction, TxnType } from "@/lib/types";
import { formatMoney } from "@/lib/currency";
import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");

export default function TransactionsPage() {
  const hydrated = useDataStore((s) => s._hydrated);
  const txns = useDataStore((s) => s.transactions);
  const cats = useDataStore((s) => s.categories);
  const base = useDataStore((s) => s.settings.baseCurrency);
  const deleteTransaction = useDataStore((s) => s.deleteTransaction);
  const restoreTransaction = useDataStore((s) => s.restoreTransaction);
  const refreshSubs = useDataStore((s) => s.refreshSubscriptions);
  const { openNew, openEdit } = useTransactions();

  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<TxnType | "all">("all");
  const [catFilter, setCatFilter] = React.useState<string | "all">("all");
  const [undoHint, setUndoHint] = React.useState<{
    id: string;
    name: string;
    expiresAt: number;
  } | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return txns
      .filter((t) => !t.deletedAt || (undoHint && undoHint.id === t.id))
      .filter((t) => (typeFilter === "all" ? true : t.type === typeFilter))
      .filter((t) => (catFilter === "all" ? true : t.categoryId === catFilter))
      .filter((t) =>
        !q
          ? true
          : t.description.toLowerCase().includes(q) ||
            String(t.amountMinor / 100).includes(q),
      )
      .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
  }, [txns, query, typeFilter, catFilter, undoHint]);

  // Group by date
  const groups = React.useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const arr = map.get(t.transactionDate) ?? [];
      arr.push(t);
      map.set(t.transactionDate, arr);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const handleDelete = (t: Transaction) => {
    deleteTransaction(t.id);
    setUndoHint({ id: t.id, name: t.description, expiresAt: Date.now() + 10_000 });
    refreshSubs();
  };

  // Undo hint auto-hide
  React.useEffect(() => {
    if (!undoHint) return;
    const timer = setTimeout(() => setUndoHint(null), 10_000);
    return () => clearTimeout(timer);
  }, [undoHint]);

  if (!hydrated) return null;

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-5">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Операции</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Все доходы и расходы. Редактируется кликом по строке.
          </p>
        </div>
        <Button onClick={() => openNew("expense")}>
          <Plus className="size-4" aria-hidden />
          Новая операция
        </Button>
      </section>

      {/* Filters */}
      <GlassCard className="flex flex-wrap items-center gap-3 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-tertiary)]"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти по описанию или сумме"
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center gap-1">
          <Filter className="size-3.5 text-[var(--text-tertiary)]" aria-hidden />
          <div className="flex items-center gap-1">
            {(
              [
                { v: "all" as const, label: "Все" },
                { v: "expense" as const, label: "Расходы" },
                { v: "income" as const, label: "Доходы" },
                { v: "transfer" as const, label: "Переводы" },
              ]
            ).map((o) => (
              <button
                key={o.v}
                onClick={() => setTypeFilter(o.v)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  typeFilter === o.v
                    ? "bg-[var(--accent-primary)] text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--accent-primary-soft)]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2 text-xs"
          aria-label="Фильтр по категории"
        >
          <option value="all">Все категории</option>
          {cats.filter((c) => !c.isArchived).map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        {(query || typeFilter !== "all" || catFilter !== "all") && (
          <button
            className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            onClick={() => {
              setQuery("");
              setTypeFilter("all");
              setCatFilter("all");
            }}
          >
            <X className="size-3" aria-hidden />
            Сбросить
          </button>
        )}
      </GlassCard>

      {/* Groups */}
      {groups.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <p className="text-[15px] font-medium">Тишина.</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Добавьте первую операцию — и лента заживёт.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button onClick={() => openNew("expense")}>
              <Plus className="size-4" aria-hidden />
              Добавить расход
            </Button>
            <Button variant="secondary" onClick={() => openNew("income")}>
              Добавить доход
            </Button>
          </div>
        </GlassCard>
      ) : (
        <ul className="flex flex-col gap-4">
          {groups.map(([date, list]) => {
            const total = list.reduce(
              (acc, t) => acc + (t.type === "expense" ? t.amountBaseMinor : 0),
              0,
            );
            return (
              <li key={date}>
                <div className="mb-1 flex items-center justify-between px-2 text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">
                  <span>{dayjs(date).format("dd, D MMMM")}</span>
                  {total > 0 && (
                    <span className="tabular">
                      Расходы: {formatMoney(total, base, { compact: true })}
                    </span>
                  )}
                </div>
                <GlassCard className="divide-y divide-[var(--border-subtle)] p-0">
                  {list.map((t, i) => {
                    const cat = cats.find((c) => c.id === t.categoryId);
                    const isIncome = t.type === "income";
                    return (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.03, 0.2) }}
                        className="group flex items-center gap-3 px-3 py-3"
                      >
                        <button
                          onClick={() => openEdit(t.id)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          aria-label={`Редактировать ${t.description}`}
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
                              {t.currency !== base && (
                                <span>
                                  · {formatMoney(t.amountMinor, t.currency, { compact: true })}
                                </span>
                              )}
                              {t.isRecurring && <span>· повторяется</span>}
                              {t.deletedAt && (
                                <span className="text-[var(--accent-peach)]">
                                  · удалено
                                </span>
                              )}
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
                        </button>

                        <div className="flex shrink-0 gap-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                          <Button
                            variant="icon"
                            size="icon"
                            onClick={() => openEdit(t.id)}
                            aria-label="Редактировать"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          {t.deletedAt ? (
                            <Button
                              variant="icon"
                              size="icon"
                              onClick={() => {
                                restoreTransaction(t.id);
                                setUndoHint(null);
                              }}
                              aria-label="Восстановить"
                            >
                              <Undo2 className="size-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="icon"
                              size="icon"
                              onClick={() => handleDelete(t)}
                              aria-label="Удалить"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </GlassCard>
              </li>
            );
          })}
        </ul>
      )}

      {/* Undo toast (TZ 7.2 TXN-03: soft-undo 10 сек) */}
      <AnimatePresence>
        {undoHint && (
          <motion.div
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
            className="glass-strong fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-3 rounded-full pl-5 pr-2 py-2 shadow-lg"
            role="alert"
          >
            <span className="text-sm">
              «{undoHint.name}» удалено. Можно восстановить.
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                restoreTransaction(undoHint.id);
                setUndoHint(null);
              }}
            >
              <Undo2 className="size-3" aria-hidden />
              Вернуть
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
