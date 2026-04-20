"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { Label } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/store/data-store";
import type { CurrencyCode } from "@/lib/currency";
import type { TxnType, RecurrenceFrequency, Category } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * TransactionDrawer (TZ 6.3 Flow 2).
 * Упрощён: только Расход/Доход, без «Перевод» и без «Описание»
 * (описание подставляем из категории).
 */
export function TransactionDrawer({
  open,
  onOpenChange,
  initialType = "expense",
  editingId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialType?: TxnType;
  editingId?: string | null;
}) {
  const addTransaction = useDataStore((s) => s.addTransaction);
  const updateTransaction = useDataStore((s) => s.updateTransaction);
  const refreshSubs = useDataStore((s) => s.refreshSubscriptions);
  const categories = useDataStore((s) => s.categories);
  const editing = useDataStore((s) =>
    editingId ? s.transactions.find((t) => t.id === editingId) ?? null : null,
  );

  const baseCurrency = useDataStore((s) => s.settings.baseCurrency);

  const [type, setType] = React.useState<TxnType>(initialType);
  const [amount, setAmount] = React.useState<number | null>(null);
  const [currency, setCurrency] = React.useState<CurrencyCode>(baseCurrency);
  const [catId, setCatId] = React.useState<string | null>(null);
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [recurring, setRecurring] = React.useState(false);
  const [frequency, setFrequency] = React.useState<RecurrenceFrequency>("monthly");

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.type === "transfer" ? "expense" : editing.type);
      setAmount(editing.amountMinor);
      setCurrency(editing.currency);
      setCatId(editing.categoryId);
      setDate(editing.transactionDate);
      setRecurring(editing.isRecurring);
      setFrequency(editing.recurrenceFrequency ?? "monthly");
    } else {
      setType(initialType === "transfer" ? "expense" : initialType);
      setAmount(null);
      setCurrency(baseCurrency);
      setCatId(null);
      setDate(new Date().toISOString().slice(0, 10));
      setRecurring(false);
      setFrequency("monthly");
    }
  }, [open, editing, initialType, baseCurrency]);

  const kindFilter = type === "income" ? "income" : "expense";
  const visibleCats = categories
    .filter((c) => !c.isArchived)
    .filter((c) => c.kind === kindFilter || c.kind === "both")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const selectedCat = catId ? categories.find((c) => c.id === catId) ?? null : null;
  const canSave = amount != null && amount > 0 && selectedCat != null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || amount == null || !selectedCat) return;
    const payload = {
      type,
      amountMinor: amount,
      currency,
      description: selectedCat.name,
      categoryId: selectedCat.id,
      transactionDate: date,
      tags: [],
      isRecurring: recurring,
      recurrenceFrequency: recurring ? frequency : undefined,
    };
    if (editing) {
      updateTransaction(editing.id, payload);
    } else {
      addTransaction(payload);
    }
    refreshSubs();
    onOpenChange(false);
  };

  const handleKey: React.KeyboardEventHandler<HTMLFormElement> = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSave) {
      e.preventDefault();
      (e.currentTarget as HTMLFormElement).requestSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        side="auto"
        onKeyDown={handleKey as unknown as React.KeyboardEventHandler<HTMLDivElement>}
      >
        <DialogTitle>{editing ? "Редактировать операцию" : "Новая операция"}</DialogTitle>
        <DialogDescription>Все поля можно поменять позже.</DialogDescription>

        <form
          onSubmit={onSubmit}
          onKeyDown={handleKey}
          className="mt-2 flex flex-col gap-5 overflow-y-auto pr-0.5"
        >
          {/* Тип — только 2 вкладки */}
          <div
            role="tablist"
            className="relative flex items-center gap-0 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-1"
          >
            {(
              [
                { v: "expense" as const, label: "Расход" },
                { v: "income" as const, label: "Доход" },
              ]
            ).map((opt) => {
              const active = type === opt.v;
              return (
                <button
                  key={opt.v}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setType(opt.v)}
                  className={cn(
                    "relative h-10 flex-1 rounded-xl text-[14px] font-semibold tracking-tight transition-colors",
                    active ? "text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="txn-type-v2"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background:
                          opt.v === "income"
                            ? "linear-gradient(135deg, var(--accent-mint), color-mix(in oklab, var(--accent-mint) 60%, var(--accent-sky)))"
                            : "linear-gradient(135deg, var(--accent-primary), color-mix(in oklab, var(--accent-primary) 60%, var(--accent-mint)))",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                      }}
                      transition={{ type: "spring", stiffness: 340, damping: 30 }}
                    />
                  )}
                  <span className="relative">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Сумма */}
          <div>
            <Label>Сумма</Label>
            <MoneyInput
              valueMinor={amount}
              currency={currency}
              availableCurrencies={["RUB", "USD", "EUR", "GBP", "KZT", "GEL"]}
              onValueChange={(m) => setAmount(m)}
              onCurrencyChange={setCurrency}
              autoFocus
              size="lg"
              className="mt-1.5"
            />
          </div>

          {/* Категория — uniform grid */}
          <div>
            <Label>Категория</Label>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5 sm:gap-2 max-h-[240px] overflow-y-auto no-scrollbar">
              {visibleCats.map((c) => (
                <CategoryTile
                  key={c.id}
                  category={c}
                  active={c.id === catId}
                  onSelect={() => setCatId(c.id === catId ? null : c.id)}
                />
              ))}
            </div>
          </div>

          {/* Дата + Повтор */}
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <Label>Дата</Label>
              <div className="mt-1.5">
                <DatePicker value={date} onChange={setDate} />
              </div>
            </div>
            <div>
              <Label>Повтор</Label>
              <motion.button
                type="button"
                onClick={() => setRecurring(!recurring)}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className={cn(
                  "mt-1.5 flex h-11 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium transition-colors",
                  recurring
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]"
                    : "border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]",
                )}
              >
                <span
                  className={cn(
                    "relative h-4 w-7 rounded-full transition-colors",
                    recurring ? "bg-[var(--accent-primary)]" : "bg-[var(--surface-3)]",
                  )}
                >
                  <motion.span
                    className="absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm"
                    animate={{ x: recurring ? 14 : 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                </span>
                {recurring ? "Регулярно" : "Один раз"}
              </motion.button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {recurring && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
                className="overflow-hidden"
              >
                <Label>Периодичность</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurrenceFrequency)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Каждую неделю</SelectItem>
                    <SelectItem value="biweekly">Раз в 2 недели</SelectItem>
                    <SelectItem value="monthly">Каждый месяц</SelectItem>
                    <SelectItem value="quarterly">Раз в квартал</SelectItem>
                    <SelectItem value="semiannual">Раз в полгода</SelectItem>
                    <SelectItem value="annual">Раз в год</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-2 flex items-center gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={!canSave} className="flex-1" size="lg">
              Сохранить
              <kbd className="ml-1 hidden sm:inline-flex opacity-60 text-[11px]">⌘↵</kbd>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Плитка категории — uniform grid tile */
function CategoryTile({
  category,
  active,
  onSelect,
}: {
  category: Category;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onSelect}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      className={cn(
        "relative flex h-[76px] flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border text-[11px] font-medium leading-tight transition-colors",
        active
          ? "border-[color:var(--cat)] bg-[color-mix(in_oklab,var(--cat)_16%,transparent)] text-[var(--text-primary)]"
          : "border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]",
      )}
      style={{ ["--cat" as string]: category.color }}
    >
      {active && (
        <motion.span
          layoutId="cat-halo"
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow:
              "0 6px 18px color-mix(in oklab, var(--cat) 35%, transparent), inset 0 0 0 1.5px var(--cat)",
          }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
        />
      )}
      <span className="relative text-[22px] leading-none">{category.icon}</span>
      <span className="relative line-clamp-2 px-1 text-center">{category.name}</span>
    </motion.button>
  );
}
