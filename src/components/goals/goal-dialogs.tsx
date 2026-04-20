"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input, DateInput, Label } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/store/data-store";
import type { CurrencyCode } from "@/lib/currency";
import { formatMoney } from "@/lib/currency";
import { requiredMonthlyContribution } from "@/lib/formulas";

const ICONS = ["🎯", "🏖️", "🏠", "✈️", "💍", "🚗", "📚", "🎁", "💻", "🎓"];

export function GoalCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const addGoal = useDataStore((s) => s.addGoal);
  const baseCurrency = useDataStore((s) => s.settings.baseCurrency);

  const [name, setName] = React.useState("");
  const [icon, setIcon] = React.useState("🎯");
  const [targetAmount, setTargetAmount] = React.useState<number | null>(null);
  const [targetCurrency, setTargetCurrency] = React.useState<CurrencyCode>(baseCurrency);
  const [targetDate, setTargetDate] = React.useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().slice(0, 10);
  });

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount || targetAmount <= 0) return;
    addGoal({
      name: name.trim(),
      icon,
      targetAmountMinor: targetAmount,
      currency: targetCurrency,
      targetDate,
      linkedCategoryId: null,
    });
    onOpenChange(false);
    setName("");
    setTargetAmount(null);
    setIcon("🎯");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="auto">
        <DialogTitle>Новая цель</DialogTitle>
        <DialogDescription>Ориентир, а не обязательство. Можно менять в любой момент.</DialogDescription>

        <form onSubmit={onCreate} className="mt-3 flex flex-col gap-4">
          <div>
            <Label>Иконка</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {ICONS.map((emo) => (
                <button
                  key={emo}
                  type="button"
                  onClick={() => setIcon(emo)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all ${
                    icon === emo
                      ? "bg-[var(--accent-primary-soft)] ring-2 ring-[var(--accent-primary)] scale-105"
                      : "bg-[var(--surface-2)] hover:scale-105"
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Название</Label>
            <Input
              className="mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="например, Отпуск в Грузию"
              autoFocus
            />
          </div>
          <div>
            <Label>Сумма</Label>
            <MoneyInput
              className="mt-1.5"
              valueMinor={targetAmount}
              currency={targetCurrency}
              onValueChange={(v) => setTargetAmount(v)}
              onCurrencyChange={setTargetCurrency}
            />
          </div>
          <div>
            <Label>Желаемая дата</Label>
            <DateInput
              className="mt-1.5"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          {targetAmount && targetAmount > 0 && (
            <div className="rounded-xl bg-[var(--surface-2)] p-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              Для этой цели нужно откладывать{" "}
              <span className="tabular font-medium text-[var(--text-primary)]">
                {formatMoney(
                  requiredMonthlyContribution({
                    id: "",
                    userId: "",
                    name: "",
                    icon: "",
                    targetAmountMinor: targetAmount,
                    currency: targetCurrency,
                    currentSavedMinor: 0,
                    targetDate,
                    linkedCategoryId: null,
                    createdAt: new Date().toISOString(),
                  }),
                  targetCurrency,
                  { compact: true },
                )}
              </span>{" "}
              в месяц. Это ваш темп — можно менять.
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" className="flex-1" disabled={!name || !targetAmount}>
              Создать
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GoalContributeDialog({
  goalId,
  onClose,
}: {
  goalId: string | null;
  onClose: () => void;
}) {
  const goal = useDataStore((s) => s.goals.find((g) => g.id === goalId) ?? null);
  const contribute = useDataStore((s) => s.contributeToGoal);
  const [amount, setAmount] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!goalId) setAmount(null);
  }, [goalId]);

  return (
    <Dialog open={!!goal} onOpenChange={onClose}>
      <DialogContent side="auto">
        <DialogTitle>Пополнить {goal?.icon}</DialogTitle>
        <DialogDescription>{goal?.name}</DialogDescription>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (goal && amount && amount > 0) {
              contribute(goal.id, amount);
              onClose();
            }
          }}
          className="mt-3 flex flex-col gap-3"
        >
          <MoneyInput
            valueMinor={amount}
            currency={goal?.currency ?? "RUB"}
            onValueChange={setAmount}
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" className="flex-1" disabled={!amount || amount <= 0}>
              Добавить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
