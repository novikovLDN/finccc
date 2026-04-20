"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataStore } from "@/lib/store/data-store";
import type { BudgetPeriodType } from "@/lib/types";
import type { CurrencyCode } from "@/lib/currency";

/**
 * Форма создания бюджета (TZ 7.4).
 * Вынесена в отдельный файл для lazy-load — dialog открывается по клику.
 */
export function BudgetCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const cats = useDataStore((s) => s.categories);
  const addBudget = useDataStore((s) => s.addBudget);
  const baseCurrency = useDataStore((s) => s.settings.baseCurrency);

  const [name, setName] = React.useState("");
  const [catId, setCatId] = React.useState<string>("all");
  const [amount, setAmount] = React.useState<number | null>(null);
  const [currency, setCurrency] = React.useState<CurrencyCode>(baseCurrency);
  const [periodType, setPeriodType] = React.useState<BudgetPeriodType>("month");

  React.useEffect(() => {
    if (!open) return;
    setName("");
    setCatId("all");
    setAmount(null);
    setCurrency(baseCurrency);
    setPeriodType("month");
  }, [open, baseCurrency]);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    addBudget({
      categoryId: catId === "all" ? null : catId,
      periodType,
      amountMinor: amount,
      currency,
      rollover: false,
      startDate: new Date().toISOString().slice(0, 10),
      name: name || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="center">
        <DialogTitle>Новый бюджет</DialogTitle>
        <DialogDescription>
          Мягкий лимит, который мы покажем как ориентир. Ничего не ограничиваем.
        </DialogDescription>

        <form onSubmit={onSave} className="mt-3 flex flex-col gap-4">
          <div>
            <Label>Название (необязательно)</Label>
            <Input
              className="mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="например, Кафе и обеды"
            />
          </div>
          <div>
            <Label>Категория</Label>
            <Select value={catId} onValueChange={setCatId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">💰 Общий (все категории)</SelectItem>
                {cats
                  .filter((c) => !c.isArchived && c.kind !== "income")
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Сумма на период</Label>
            <MoneyInput
              className="mt-1.5"
              valueMinor={amount}
              currency={currency}
              onValueChange={(v) => setAmount(v)}
              onCurrencyChange={setCurrency}
            />
          </div>
          <div>
            <Label>Период</Label>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {(["week", "month", "quarter"] as BudgetPeriodType[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriodType(p)}
                  className={`h-11 rounded-xl border text-xs font-medium transition-colors ${
                    periodType === p
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]"
                      : "border-[var(--border-strong)] text-[var(--text-secondary)]"
                  }`}
                >
                  {p === "week" ? "Неделя" : p === "quarter" ? "Квартал" : "Месяц"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" className="flex-1" disabled={!amount || amount <= 0}>
              Создать
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
