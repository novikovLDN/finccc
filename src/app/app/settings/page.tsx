"use client";

import * as React from "react";
import { Sun, Moon, Monitor, Download, Trash2, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useDataStore, generateDemoData } from "@/lib/store/data-store";
import { useShellStore } from "@/components/shell/store";
import {
  exportTransactionsCSV,
  exportFullBackup,
  downloadBlob,
} from "@/lib/export";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";

/**
 * Settings (TZ 7.10).
 * SET-01 CSV, SET-02 JSON, SET-04 удаление, SET-05 темы,
 * SET-06 язык, SET-07 уведомления.
 */
export default function SettingsPage() {
  const hydrated = useDataStore((s) => s._hydrated);
  const settings = useDataStore((s) => s.settings);
  const update = useDataStore((s) => s.updateSettings);
  const resetAll = useDataStore((s) => s.resetAll);
  const txnCount = useDataStore((s) => s.transactions.filter((t) => !t.deletedAt).length);

  const theme = useShellStore((s) => s.theme);
  const setTheme = useShellStore((s) => s.setTheme);

  const [confirmDelete, setConfirmDelete] = React.useState(false);

  if (!hydrated) return null;

  return (
    <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5">
      <section>
        <h1 className="text-[24px] font-semibold tracking-tight">Настройки</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Ваши данные — ваша собственность. В любой момент — экспорт или удаление.
        </p>
      </section>

      {/* Appearance */}
      <GlassCard className="p-5">
        <div className="mb-3 text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Внешний вид
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { v: "light" as const, label: "Светлая", Icon: Sun },
              { v: "dark" as const, label: "Тёмная", Icon: Moon },
              { v: "system" as const, label: "Авто", Icon: Monitor },
            ]
          ).map((o) => {
            const active = theme === o.v;
            return (
              <button
                key={o.v}
                onClick={() => setTheme(o.v)}
                className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${
                  active
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]"
                    : "border-[var(--border-strong)] text-[var(--text-secondary)]"
                }`}
              >
                <o.Icon className="size-4" aria-hidden />
                {o.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-[var(--text-tertiary)]">
          Авто-режим следует настройкам системы.
        </p>
      </GlassCard>

      {/* Currency */}
      <GlassCard className="p-5">
        <div className="mb-3 text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Основная валюта
        </div>
        <select
          value={settings.baseCurrency}
          onChange={(e) => update({ baseCurrency: e.target.value as CurrencyCode })}
          className="h-11 w-full max-w-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] px-3 text-sm"
        >
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
            <option key={c} value={c}>
              {CURRENCIES[c].symbol} {c} — {CURRENCIES[c].name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-[var(--text-tertiary)]">
          Все агрегированные суммы пересчитываются в эту валюту по курсу даты транзакции.
        </p>
      </GlassCard>

      {/* Notifications */}
      <GlassCard className="p-5">
        <div className="mb-3 text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Уведомления
        </div>
        <div className="flex flex-col gap-3">
          <Toggle
            label="Weekly digest по пятницам"
            description="Одно письмо в неделю с топ-инсайтом и короткой сводкой."
            checked={settings.notificationPrefs.weeklyDigest}
            onChange={(v) =>
              update({
                notificationPrefs: { ...settings.notificationPrefs, weeklyDigest: v },
              })
            }
          />
          <Toggle
            label="Инсайты в ленте"
            description="До 3 наблюдений в неделю. Мягкий тон, без упрёков."
            checked={settings.notificationPrefs.pushInsights}
            onChange={(v) =>
              update({
                notificationPrefs: { ...settings.notificationPrefs, pushInsights: v },
              })
            }
          />
          <Toggle
            label="Мягкое уведомление о бюджете"
            description="При прохождении 80% бюджета — не 100%, не с красным."
            checked={settings.notificationPrefs.budgetSoftAlert}
            onChange={(v) =>
              update({
                notificationPrefs: { ...settings.notificationPrefs, budgetSoftAlert: v },
              })
            }
          />
        </div>
      </GlassCard>

      {/* Export */}
      <GlassCard className="p-5">
        <div className="mb-3 text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Ваши данные
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Полный экспорт в любой момент. Ничего не передаём третьим сторонам.
          Аналитика полностью анонимизирована и агрегирована.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={txnCount === 0}
            onClick={() => {
              const csv = exportTransactionsCSV();
              downloadBlob(
                csv,
                `mindful-money-${new Date().toISOString().slice(0, 10)}.csv`,
                "text/csv;charset=utf-8",
              );
            }}
          >
            <Download className="size-4" aria-hidden />
            Экспорт CSV
          </Button>
          <Button
            variant="secondary"
            disabled={txnCount === 0}
            onClick={() => {
              const backup = exportFullBackup();
              downloadBlob(
                JSON.stringify(backup, null, 2),
                `mindful-money-backup-${new Date().toISOString().slice(0, 10)}.json`,
                "application/json",
              );
            }}
          >
            <Download className="size-4" aria-hidden />
            Полный backup (JSON)
          </Button>
          <Button variant="ghost" onClick={() => generateDemoData()}>
            <Sparkles className="size-4" aria-hidden />
            Демо-данные
          </Button>
        </div>
      </GlassCard>

      {/* Danger zone */}
      <GlassCard className="p-5 border border-[var(--accent-peach)]/30">
        <div className="mb-3 flex items-center gap-2">
          <div className="text-[13px] font-medium uppercase tracking-wider text-[var(--accent-peach)]">
            Удалить все данные
          </div>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Удалит все операции, бюджеты, цели, подписки и инсайты безвозвратно.
          Настройки вернутся к значениям по умолчанию.
        </p>
        {!confirmDelete ? (
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4" aria-hidden />
            Удалить все данные
          </Button>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Отмена
            </Button>
            <Button
              variant="critical"
              onClick={() => {
                resetAll();
                useDataStore.getState().seed();
                setConfirmDelete(false);
              }}
            >
              <Trash2 className="size-4" aria-hidden />
              Подтверждаю: удалить
            </Button>
          </div>
        )}
      </GlassCard>

      <p className="text-center text-[11px] text-[var(--text-tertiary)]">
        Это наблюдения, а не финансовый совет. Решение всегда за вами.
      </p>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl p-3 transition-colors hover:bg-[var(--surface-2)]">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="mt-0.5 text-xs text-[var(--text-secondary)] leading-relaxed">
            {description}
          </div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[var(--accent-primary)]" : "bg-[var(--surface-3)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
