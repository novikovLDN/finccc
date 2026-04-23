"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { RefreshCw, EyeOff, Eye, Star, CalendarDays } from "lucide-react";
import { useDataStore } from "@/lib/store/data-store";
import { NumericDisplay } from "@/components/ui/numeric-display";
import { formatMoney } from "@/lib/currency";
import { findRate } from "@/lib/store/data-store";
import { monthlyEquivalent as monthlyEq } from "@/lib/formulas";
import { PageHeader, TitleItalic } from "@/components/shell/page-header";
import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");

/**
 * Подписки (TZ 7.6).
 * Автодетекция из повторяющихся операций (SUB-01).
 * Суммы месяц/год (SUB-02).
 * Прогноз следующего списания (SUB-03).
 * Подсчёт в основной валюте (SUB-08).
 */
export default function SubscriptionsPage() {
  const hydrated = useDataStore((s) => s._hydrated);
  const subs = useDataStore((s) => s.subscriptions);
  const txns = useDataStore((s) => s.transactions);
  const rates = useDataStore((s) => s.exchangeRates);
  const base = useDataStore((s) => s.settings.baseCurrency);
  const refresh = useDataStore((s) => s.refreshSubscriptions);
  const update = useDataStore((s) => s.updateSubscription);

  // Привести amount к base currency месячно
  const rows = React.useMemo(() => {
    return subs.map((s) => {
      const monthlyInOriginal = monthlyEq(s.amountMinor, s.frequency);
      const rate = findRate(rates, s.currency, base, s.lastSeenDate);
      const monthlyInBase = Math.round(monthlyInOriginal * rate);
      return { sub: s, monthlyInBase, monthlyInOriginal };
    });
  }, [subs, rates, base]);

  const active = rows.filter((r) => r.sub.isActive);
  const inactive = rows.filter((r) => !r.sub.isActive);
  const totalMonthly = active.reduce((acc, r) => acc + r.monthlyInBase, 0);
  const totalAnnual = totalMonthly * 12;

  if (!hydrated) return null;

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6 pt-2">
      <PageHeader
        kicker={`Подписки · активных ${active.length}`}
        title={
          <>
            Все ваши{" "}
            <TitleItalic>регулярные</TitleItalic>
            {" "}платежи одной картиной
          </>
        }
        subtitle="Находим автоматически из повторяющихся операций. Не отменяем в банке — только помечаем у себя."
        trailing={
          <Button variant="secondary" onClick={refresh}>
            <RefreshCw className="size-4" aria-hidden />
            Обновить
          </Button>
        }
      />

      <div className="h-px bg-gradient-to-r from-[var(--warm-line)] to-transparent" aria-hidden />

      {/* Summary */}
      {active.length > 0 && (
        <GlassCard live className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                Подписки · всего {active.length}
              </div>
              <div className="mt-2">
                <NumericDisplay
                  valueMinor={totalMonthly}
                  currency={base}
                  size="h1"
                  tone="neutral"
                  signDisplay="never"
                />
                <span className="ml-2 text-[15px] text-[var(--text-secondary)]">/мес</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)] max-w-[520px]">
                Это{" "}
                <span className="tabular font-medium text-[var(--text-primary)]">
                  {formatMoney(totalAnnual, base, { compact: true })}
                </span>{" "}
                в год. Возможно, часть уже не нужна, а часть — очень нужна. Решать вам.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Active list */}
      {active.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <p className="text-[15px] font-medium">Подписок пока не видно.</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Пока мы не нашли повторяющиеся платежи. После нескольких месяцев данных здесь будет точнее.
          </p>
        </GlassCard>
      ) : (
        <section>
          <h2 className="mb-2 px-2 text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">
            Активные
          </h2>
          <GlassCard className="divide-y divide-[var(--border-subtle)] p-0">
            <AnimatePresence initial={false}>
              {active.map((r, i) => (
                <SubscriptionRow key={r.sub.id} row={r} index={i} onUpdate={update} base={base} />
              ))}
            </AnimatePresence>
          </GlassCard>
        </section>
      )}

      {inactive.length > 0 && (
        <section>
          <h2 className="mb-2 px-2 text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">
            Помечены неактивными
          </h2>
          <GlassCard className="divide-y divide-[var(--border-subtle)] p-0 opacity-70">
            <AnimatePresence initial={false}>
              {inactive.map((r, i) => (
                <SubscriptionRow key={r.sub.id} row={r} index={i} onUpdate={update} base={base} />
              ))}
            </AnimatePresence>
          </GlassCard>
        </section>
      )}
    </div>
  );
}

type Row = { sub: ReturnType<typeof useDataStore.getState>["subscriptions"][number]; monthlyInBase: number; monthlyInOriginal: number };

function SubscriptionRow({
  row,
  index,
  onUpdate,
  base,
}: {
  row: Row;
  index: number;
  onUpdate: (id: string, patch: Partial<Row["sub"]>) => void;
  base: ReturnType<typeof useDataStore.getState>["settings"]["baseCurrency"];
}) {
  const { sub, monthlyInBase } = row;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: Math.min(index * 0.03, 0.2) }}
      className="flex items-center gap-3 px-4 py-3"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-primary-soft)] text-[18px]"
        aria-hidden
      >
        📺
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{sub.name}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
          <span>{freqLabel(sub.frequency)}</span>
          <span>
            · {formatMoney(sub.amountMinor, sub.currency, { compact: true })}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3" aria-hidden />
            {dayjs(sub.nextBillingDate).format("D MMM")}
          </span>
        </div>
      </div>
      <div className="hidden sm:block text-right">
        <div className="tabular text-sm font-semibold">
          {formatMoney(monthlyInBase, base, { compact: true })}
        </div>
        <div className="text-[11px] text-[var(--text-tertiary)]">в месяц (в основной)</div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() =>
            onUpdate(sub.id, {
              tag: sub.tag === "must-have" ? null : "must-have",
            })
          }
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            sub.tag === "must-have"
              ? "bg-[var(--accent-mint-soft)] text-[var(--accent-mint)]"
              : "text-[var(--text-tertiary)] hover:bg-[var(--accent-primary-soft)]"
          }`}
          aria-label={sub.tag === "must-have" ? "Убрать отметку must-have" : "Отметить как must-have"}
          title="Must-have"
        >
          <Star className="size-4" />
        </button>
        <button
          onClick={() => onUpdate(sub.id, { isActive: !sub.isActive })}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--accent-primary-soft)] hover:text-[var(--text-primary)]"
          aria-label={sub.isActive ? "Пометить как неактивную" : "Восстановить"}
          title={sub.isActive ? "Помечу как неактивную" : "Вернуть в активные"}
        >
          {sub.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </motion.div>
  );
}

function freqLabel(f: string) {
  switch (f) {
    case "weekly":
      return "Еженедельно";
    case "biweekly":
      return "Раз в 2 недели";
    case "monthly":
      return "Ежемесячно";
    case "quarterly":
      return "Раз в квартал";
    case "semiannual":
      return "Раз в полгода";
    case "annual":
      return "Ежегодно";
    default:
      return f;
  }
}
