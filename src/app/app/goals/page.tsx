"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Sparkles, Archive, Trash2, PiggyBank } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { useDataStore } from "@/lib/store/data-store";
import { formatMoney } from "@/lib/currency";
import { projectGoal, requiredMonthlyContribution } from "@/lib/formulas";
import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");
import { PageHeader, TitleItalic } from "@/components/shell/page-header";
import { StaggerReveal } from "@/components/shell/stagger-reveal";

// Lazy-загружаем формы — открываются только по клику
const GoalCreateDialog = dynamic(
  () => import("@/components/goals/goal-dialogs").then((m) => m.GoalCreateDialog),
  { ssr: false },
);
const GoalContributeDialog = dynamic(
  () => import("@/components/goals/goal-dialogs").then((m) => m.GoalContributeDialog),
  { ssr: false },
);

export default function GoalsPage() {
  const hydrated = useDataStore((s) => s._hydrated);
  const goals = useDataStore((s) => s.goals);
  const txns = useDataStore((s) => s.transactions);
  const deleteGoal = useDataStore((s) => s.deleteGoal);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [contributeId, setContributeId] = React.useState<string | null>(null);

  if (!hydrated) return null;

  const activeGoals = goals.filter((g) => !g.archivedAt);
  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6 pt-2">
      <PageHeader
        kicker={`Цели · активных ${activeGoals.length}`}
        title={
          <>
            Ваши{" "}
            <TitleItalic>ориентиры</TitleItalic>
            , не обязательства
          </>
        }
        subtitle="Движемся с комфортной скоростью. Если ритм сбился — это нормально, перестраиваем."
        trailing={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden />
            Новая цель
          </Button>
        }
      />

      <div className="h-px bg-gradient-to-r from-[var(--warm-line)] to-transparent" aria-hidden />

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
                        className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--accent-primary-soft)] transition-colors"
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
                      <ProgressBar className="mt-2" value={pct} tone="mint" showLabel label={`${Math.round(pct)}%`} />
                    </div>

                    {milestone > 0 && (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 22 }}
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
                          {" — "}
                          {proj.deltaDays! < 0
                            ? `на ${Math.abs(proj.deltaDays!)} дн. раньше`
                            : "точно по плану"}
                          . Неплохо, да?
                        </>
                      ) : proj.onTrack === false ? (
                        <>
                          При текущем темпе будет{" "}
                          <span className="tabular font-medium text-[var(--text-primary)]">
                            {dayjs(proj.projectedDate).format("D MMM")}
                          </span>
                          {" — на "}
                          {proj.deltaDays} дн. позже плана. Это не критично, но может быть стоит подумать.
                        </>
                      ) : (
                        <>При текущем темпе цель не достигается. Попробуйте скорректировать ритм или дату — решать вам.</>
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
                      <Button variant="secondary" className="flex-1" onClick={() => setContributeId(g.id)}>
                        Добавить вклад
                      </Button>
                      {g.completedAt && (
                        <Button variant="outline" aria-label="Архивировать" size="icon">
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

      {createOpen && <GoalCreateDialog open={createOpen} onOpenChange={setCreateOpen} />}
      {contributeId && (
        <GoalContributeDialog goalId={contributeId} onClose={() => setContributeId(null)} />
      )}
    </div>
  );
}
