"use client";

import * as React from "react";
import { AppShell } from "@/components/shell/shell";
import type { Insight } from "@/components/shell/insight-feed";
import {
  TransactionsProvider,
  useTransactions,
} from "@/components/transactions/transactions-context";
import { useDataStore } from "@/lib/store/data-store";

function ShellWithFab({ children }: { children: React.ReactNode }) {
  const { openNew } = useTransactions();
  const stored = useDataStore((s) => s.insights);
  const hydrated = useDataStore((s) => s._hydrated);

  const insightsForFeed: Insight[] = React.useMemo(() => {
    if (!hydrated) return STUB_INSIGHTS;
    if (stored.length === 0) return STUB_INSIGHTS;
    return stored
      .filter((i) => !i.dismissedAt)
      .slice(0, 5)
      .map((i) => ({
        id: i.id,
        type: i.type,
        title: i.title,
        body: i.body,
        cta: i.cta,
        createdAt: i.createdAt,
      }));
  }, [stored, hydrated]);

  return (
    <AppShell insights={insightsForFeed} onAddTransaction={() => openNew("expense")}>
      {children}
    </AppShell>
  );
}

// Stub-инсайты для пустой ленты — тексты строго по TZ 9.3.
const STUB_INSIGHTS: Insight[] = [
  {
    id: "stub-positive",
    type: "positive",
    title: "Добро пожаловать в Mindful Money",
    body: "Мы не будем вас упрекать. Мы будем замечать паттерны и предлагать подумать — а решение всегда за вами.",
    createdAt: new Date().toISOString(),
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TransactionsProvider>
      <ShellWithFab>{children}</ShellWithFab>
    </TransactionsProvider>
  );
}
