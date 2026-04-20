"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Sparkles, Archive, Trash2, PiggyBank } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { ProgressBar } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDataStore } from "@/lib/store/data-store";
import { formatMoney, type CurrencyCode } from "@/lib/currency";
import { projectGoal, requiredMonthlyContribution } from "@/lib/formulas";
import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");

/**
 * Цели накоплений (TZ 7.5).
 * Расчёт необходимой ежемесячной суммы (GOAL-02).
 * Прогноз даты достижения (GOAL-03).
 * Celebration при 25/50/75/100% (GOAL-07).
 */
export default function GoalsPage() {
  const hydrated = useDataStore((s) => s._hydrated);
  const goals = useDataStore((s) => s.goals);
  const txns = useDataStore((s) => s.transactions);
  const addGoal = useDataStore((s) => s.addGoal);
  const contribute = useDataStore((s) => s.contributeToGoal);
  const deleteGoal = useDataStore((s) => s.deleteGoal);
  const baseCurrency = useDataStore((s) => s.settings.baseCurrency);

  const [open, setOpen] = React.useState(false);
  const [contributeOpen, setContributeOpen] = React.useState<string | null>(null);

  // Form state
  const [name, setName] = React.useState("");
  const [icon, setIcon] = React.useState("🎯");
  const [targetAmount, setTargetAmount] = React.useState<number | null>(null);
  const [targetCurrency, setTargetCurrency] = React.useState<CurrencyCode>(baseCurrency);
  const [targetDate, setTargetDate] = React.useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().slice(0, 10);
  });

  const ICONS = ["🎯", "🏖️", "🏠", "✈️", "💍", "🚗", "📚", "🎁", "💻", "🎓"];

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
    setOpen(false);
    setName("");
    setTargetAmount(null);
    setIcon("🎯");
  };

  const contribTarget = goals.find((g) => g.id === contributeOpen);

  if (!hydrated) return null;

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Цели</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Цели — это ориентир, а не обязательство. Движемся с комфортной скоростью.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Новая цель
        </Button>
      </section>

      {goals.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <p className="text-[15px] font-medium">Ещё нет целей.</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Цели — это не обязательство. Это ориентир. Создайте первую, когда захочется.
          </p>
        </GlassCard>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {goals.map((g, i) => {
              const pct = Math.min(100, (g.currentSavedMinor / g.targetAmountMinor) * 100);
              const proj = projectGoal(g, txns);
              const reqMonthly = requiredMonthlyContribution(g);
              const milestone = pct >= 100 ? 100 : pct >= 75 ? 75 : pct >= 50 ? 50 : pct >= 25 ? 25 : 0;
              return (
                <motion.li
                  layout
                  key={g.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <GlassCard live className="h-full p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-primary-soft)] text-[20px]" aria-hidden>
                          {g.icon}
                        </div>
                        <div>
                          <div className="truncate text-sm font-semibold">{g.name}</div>
                          <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">
                            до {dayjs(g.targetDate).format("D MMM YYYY")}
                          </div>
                        </div>
                      </div>
                      <button
                        aria-label="Удалить цель"
                        className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--accent-primary-soft)]"
                        onClick={() => deleteGoal(g.id)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-baseline justify-between">
                        <span className="tabular text-[22px] font-semibold">
                          {formatMoney(g.currentSavedMinor, g.currency, { compact: true })}
                        </span>
                        <span className="tabular text-xs text-[var(--text-secondary)]">
                          из {formatMoney(g.targetAmountMinor, g.currency, { compact: true })}
                        </span>
                      </div>
                      <ProgressBar
                        className="mt-2"
                        value={pct}
                        tone="mint"
                        showLabel
                        label={`${Math.round(pct)}%`}
                      />
                    </div>

                    {/* Milestone celebration */}
                    {milestone > 0 && (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 22,
                        }}
                        className="mt-3 flex items-center gap-2 rounded-xl bg-[var(--accent-mint-soft)] px-3 py-2 text-xs text-[var(--accent-mint)]"
                      >
                        <Sparkles className="size-3.5" aria-hidden />
                        <span>
                          {milestone === 100
                            ? "Цель достигнута. Это ваш результат."
                            : `Пройдено ${milestone}% — неплохо, да?`}
                        </span>
                      </motion.div>
                    )}

                    <div className="mt-3 rounded-xl bg-[var(--surface-2)] p-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {milestone === 100 ? (
                        <>Вы здесь. Это ваш выбор и ваш результат.</>
                      ) : proj.onTrack === true ? (
                        <>
                          При текущем темпе достигнете{" "}
                          <span className="tabular font-medium text-[var(--text-primary)]">
                            {dayjs(proj.projectedDate).format("D MMM")}
                          </span>
                          — {proj.deltaDays! < 0 ? `на ${Math.abs(proj.deltaDays!)} дн. раньше` : "точно по плану"}. Неплохо, да?
                        </>
                      ) : proj.onTrack === false ? (
                        <>
                          При текущем темпе будет{" "}
                          <span className="tabular font-medium text-[var(--text-primary)]">
                            {dayjs(proj.projectedDate).format("D MMM")}
                          </span>
                          — на {proj.deltaDays} дн. позже плана. Это не критично, но может быть стоит подумать.
                        </>
                      ) : (
                        <>
                          При текущем темпе цель не достигается. Попробуйте скорректировать ритм или дату — решать вам.
                        </>
                      )}
                      <div className="mt-2 flex items-center gap-1">
                        <PiggyBank className="size-3.5" aria-hidden />
                        <span>
                          Нужно откладывать{" "}
                          <span className="tabular font-medium text-[var(--text-primary)]">
                            {formatMoney(reqMonthly, g.currency, { compact: true })}
                          </span>{" "}
                          /мес
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setContributeOpen(g.id)}
                      >
                        Добавить вклад
                      </Button>
                      {g.completedAt && (
                        <Button
                          variant="outline"
                          aria-label="Архивировать"
                          size="icon"
                        >
                          <Archive className="size-4" />
                        </Button>
                      )}
                    </div>
                  </GlassCard>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {/* Create goal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent side="center">
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
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                      icon === emo
                        ? "bg-[var(--accent-primary-soft)] ring-2 ring-[var(--accent-primary)]"
                        : "bg-[var(--surface-2)]"
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
              <Input
                type="date"
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
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" className="flex-1" disabled={!name || !targetAmount}>
                Создать
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contribute */}
      <Dialog open={!!contribTarget} onOpenChange={() => setContributeOpen(null)}>
        <DialogContent side="center">
          <DialogTitle>Пополнить {contribTarget?.icon}</DialogTitle>
          <DialogDescription>{contribTarget?.name}</DialogDescription>
          <ContributeForm
            goalId={contributeOpen ?? ""}
            currency={contribTarget?.currency ?? "RUB"}
            onDone={() => setContributeOpen(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContributeForm({
  goalId,
  currency,
  onDone,
}: {
  goalId: string;
  currency: CurrencyCode;
  onDone: () => void;
}) {
  const contribute = useDataStore((s) => s.contributeToGoal);
  const [amount, setAmount] = React.useState<number | null>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (amount && amount > 0) {
          contribute(goalId, amount);
          onDone();
        }
      }}
      className="mt-3 flex flex-col gap-3"
    >
      <MoneyInput
        valueMinor={amount}
        currency={currency}
        onValueChange={setAmount}
        autoFocus
      />
      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Отмена
        </Button>
        <Button type="submit" className="flex-1" disabled={!amount || amount <= 0}>
          Добавить
        </Button>
      </div>
    </form>
  );
}
