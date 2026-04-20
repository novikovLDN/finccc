"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { Input, DateInput, Label } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { useDataStore } from "@/lib/store/data-store";
import type { CurrencyCode } from "@/lib/currency";
import type { TxnType, RecurrenceFrequency, Category } from "@/lib/types";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/**
 * TransactionDrawer (TZ 6.3 Flow 2).
 * Открывается справа как Sheet, glass-surface.
 * Фокус на поле «Сумма», AI-подсказка категории справа.
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
  const [desc, setDesc] = React.useState("");
  const [catId, setCatId] = React.useState<string | null>(null);
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [recurring, setRecurring] = React.useState(false);
  const [frequency, setFrequency] = React.useState<RecurrenceFrequency>("monthly");

  // Сброс формы при закрытии / заполнение при редактировании
  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.type);
      setAmount(editing.amountMinor);
      setCurrency(editing.currency);
      setDesc(editing.description);
      setCatId(editing.categoryId);
      setDate(editing.transactionDate);
      setRecurring(editing.isRecurring);
      setFrequency(editing.recurrenceFrequency ?? "monthly");
    } else {
      setType(initialType);
      setAmount(null);
      setCurrency(baseCurrency);
      setDesc("");
      setCatId(null);
      setDate(new Date().toISOString().slice(0, 10));
      setRecurring(false);
      setFrequency("monthly");
    }
  }, [open, editing, initialType, baseCurrency]);

  // AI-подсказка категории (keyword-based, TZ 7.2 TXN-06 + 7.3 CAT-06)
  const suggested = React.useMemo(() => suggestCategory(desc, type, categories), [desc, type, categories]);

  const kindFilter = type === "income" ? "income" : "expense";
  const visibleCats = categories
    .filter((c) => !c.isArchived)
    .filter((c) => c.kind === kindFilter || c.kind === "both");

  const canSave = amount != null && amount > 0 && desc.trim().length > 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || amount == null) return;
    const payload = {
      type,
      amountMinor: amount,
      currency,
      description: desc.trim(),
      categoryId: catId ?? suggested?.id ?? null,
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

  // Cmd+Enter = save shortcut (TZ 6.3 Flow 2)
  const handleKey: React.KeyboardEventHandler<HTMLFormElement> = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSave) {
      e.preventDefault();
      (e.currentTarget as HTMLFormElement).requestSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="right" onKeyDown={handleKey as unknown as React.KeyboardEventHandler<HTMLDivElement>}>
        <DialogTitle>{editing ? "Редактировать операцию" : "Новая операция"}</DialogTitle>
        <DialogDescription>Занимает секунд 10. Всё можно поменять позже.</DialogDescription>

        <form onSubmit={onSubmit} onKeyDown={handleKey} className="mt-3 flex flex-col gap-4 overflow-y-auto pr-1">
          <div role="tablist" className="glass flex items-center gap-1 rounded-full p-1">
            {([
              { v: "expense" as const, label: "Расход" },
              { v: "income" as const, label: "Доход" },
              { v: "transfer" as const, label: "Перевод" },
            ]).map((opt) => {
              const active = type === opt.v;
              return (
                <button
                  key={opt.v}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setType(opt.v)}
                  className={`relative h-8 flex-1 rounded-full text-[13px] font-medium transition-colors ${
                    active ? "text-white" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="txn-type"
                      className="absolute inset-0 rounded-full"
                      style={{ background: "var(--accent-primary)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <Label>Сумма</Label>
            <MoneyInput
              valueMinor={amount}
              currency={currency}
              availableCurrencies={["RUB", "USD", "EUR", "GBP", "KZT", "GEL"]}
              onValueChange={(m) => setAmount(m)}
              onCurrencyChange={setCurrency}
              autoFocus
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Описание</Label>
            <Input
              className="mt-1.5"
              placeholder="например, Espresso Starbucks"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            {suggested && catId == null && (
              <button
                type="button"
                onClick={() => setCatId(suggested.id)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--accent-primary)] px-2.5 py-1 text-xs text-[var(--accent-primary)] hover:bg-[var(--accent-primary-soft)]"
              >
                <Sparkles className="size-3" aria-hidden />
                Похоже на «{suggested.icon} {suggested.name}» — принять
              </button>
            )}
          </div>

          <div>
            <Label>Категория</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5 max-h-[168px] overflow-y-auto">
              {visibleCats.map((c) => (
                <Chip
                  key={c.id}
                  color={c.color}
                  icon={<span>{c.icon}</span>}
                  interactive
                  active={c.id === catId}
                  onClick={() => setCatId(c.id === catId ? null : c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setCatId(c.id === catId ? null : c.id);
                    }
                  }}
                >
                  {c.name}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Дата</Label>
              <DateInput
                className="mt-1.5"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Повторять</Label>
              <div className="mt-1.5 flex gap-1.5">
                <motion.button
                  type="button"
                  onClick={() => setRecurring(!recurring)}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className={`flex h-11 flex-1 items-center justify-center rounded-xl border text-xs font-medium transition-colors ${
                    recurring
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]"
                      : "border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]"
                  }`}
                >
                  {recurring ? "Регулярно" : "Один раз"}
                </motion.button>
              </div>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {recurring && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
                className="overflow-hidden"
              >
                <Label>Периодичность</Label>
                <Select
                  value={frequency}
                  onValueChange={(v) => setFrequency(v as RecurrenceFrequency)}
                >
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

          <div className="mt-auto flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={!canSave} className="flex-1">
              Сохранить <kbd className="ml-1 opacity-60 text-[11px]">⌘↵</kbd>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Простой keyword-classifier для smart-категоризации (TZ 7.3 CAT-06, 7.2 TXN-06).
 * Это стаб — на Шаге 9 заменится LLM-вспомогателем (опционально).
 */
function suggestCategory(desc: string, type: TxnType, cats: Category[]): Category | null {
  if (!desc.trim()) return null;
  const low = desc.toLowerCase();
  const kindFilter = type === "income" ? "income" : "expense";
  const pool = cats.filter((c) => c.kind === kindFilter || c.kind === "both");

  const rules: Array<[string, RegExp]> = [
    ["Кофе и напитки", /starbucks|double\s?b|surf|cofix|кофе|coffee|latte|espresso|капучино/i],
    ["Еда и рестораны", /restaur|бар|кафе|food|lunch|dinner|ужин|обед|prime|white rabbit|доставк|деливер|yandex\.?еда|дост.?еда|pizza/i],
    ["Продукты", /вкусвилл|перекрёст|перекрест|пятёрочк|пятерочк|лавк|lavka|ashan|ашан|магнит|продукт|grocery/i],
    ["Транспорт", /такси|taxi|metro|метро|тройк|каршер|drive|yandex\.?такси|bolt|trol|bus|uber/i],
    ["Аренда и ЖКХ", /аренд|rent|жкх|utilit|коммунал/i],
    ["Подписки", /spotify|netflix|chatgpt|claude|openai|figma|notion|youtube|icloud|jetbrains|cursor|midjourney|github|subscription/i],
    ["Развлечения", /кино|cinema|concert|билет|театр|ticket|entertainment/i],
    ["Одежда", /zara|h\s*&\s*m|uniqlo|lamoda|clothing|одежда/i],
    ["Путешествия", /hotel|hostel|booking|aviasales|авиабилет|отпуск|travel|билет/i],
    ["Спорт", /фитнес|gym|sport|crossfit|yoga/i],
    ["Красота и здоровье", /салон|beauty|парикмах|барбер|barber|apteka|аптек|pharmacy/i],
    ["Зарплата", /salary|зарплат|salario|payroll/i],
    ["Фриланс", /upwork|freelance|фриланс|contract/i],
  ];

  for (const [name, re] of rules) {
    if (re.test(low)) {
      const c = pool.find((x) => x.name === name);
      if (c) return c;
    }
  }
  return null;
}
