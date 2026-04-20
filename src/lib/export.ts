"use client";

import { useDataStore } from "@/lib/store/data-store";
import { formatNumber } from "@/lib/currency";
import type { Transaction } from "@/lib/types";

/**
 * Экспорт данных (TZ 7.10 SET-01, SET-02).
 * GDPR-friendly (TZ 10.5): экспорт должен быть мгновенным.
 */

function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportTransactionsCSV(): string {
  const { transactions, categories } = useDataStore.getState();
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const header = [
    "date",
    "type",
    "amount",
    "currency",
    "amount_base",
    "description",
    "category",
    "recurring",
    "frequency",
  ];
  const rows: string[] = [header.join(",")];
  const sorted = [...transactions].sort((a, b) =>
    a.transactionDate.localeCompare(b.transactionDate),
  );
  for (const t of sorted) {
    if (t.deletedAt) continue;
    const cat = t.categoryId ? catMap.get(t.categoryId)?.name ?? "" : "";
    rows.push(
      [
        t.transactionDate,
        t.type,
        formatNumber(t.amountMinor, t.currency),
        t.currency,
        formatNumber(t.amountBaseMinor),
        t.description,
        cat,
        t.isRecurring ? "yes" : "no",
        t.recurrenceFrequency ?? "",
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  return rows.join("\n");
}

export interface FullBackup {
  version: 1;
  exportedAt: string;
  settings: ReturnType<typeof useDataStore.getState>["settings"];
  categories: ReturnType<typeof useDataStore.getState>["categories"];
  transactions: Transaction[];
  budgets: ReturnType<typeof useDataStore.getState>["budgets"];
  goals: ReturnType<typeof useDataStore.getState>["goals"];
  subscriptions: ReturnType<typeof useDataStore.getState>["subscriptions"];
  insights: ReturnType<typeof useDataStore.getState>["insights"];
  exchangeRates: ReturnType<typeof useDataStore.getState>["exchangeRates"];
}

export function exportFullBackup(): FullBackup {
  const s = useDataStore.getState();
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: s.settings,
    categories: s.categories,
    transactions: s.transactions,
    budgets: s.budgets,
    goals: s.goals,
    subscriptions: s.subscriptions,
    insights: s.insights,
    exchangeRates: s.exchangeRates,
  };
}

export function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
