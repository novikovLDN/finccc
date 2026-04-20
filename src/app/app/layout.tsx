"use client";

import * as React from "react";
import { AppShell } from "@/components/shell/shell";
import type { Insight } from "@/components/shell/insight-feed";

// Заглушки до Шага 9 (AI-движок). Тексты строго по TZ 9.3.
const STUB_INSIGHTS: Insight[] = [
  {
    id: "stub-1",
    type: "positive",
    title: "В этом месяце вы отложили 12% от дохода",
    body: "На 4 процентных пункта больше, чем в среднем за последние 3 месяца. Это ваш выбор и ваш результат.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "stub-2",
    type: "pattern",
    title: "Заметили, что на кофе ушло ~4 200 ₽ за неделю",
    body: "Если ритм сохранится до конца месяца — это примерно 16 800 ₽. Ни хорошо, ни плохо — просто факт.",
    cta: "Посмотреть поближе",
    createdAt: new Date().toISOString(),
  },
  {
    id: "stub-3",
    type: "subscription",
    title: "У вас 11 активных подписок на 8 450 ₽ в месяц",
    body: "Это 101 400 ₽ в год. Возможно, часть уже не нужна, а часть — очень нужна. Решать вам.",
    cta: "Открыть список",
    createdAt: new Date().toISOString(),
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Заглушка до Шага 6 (Transactions drawer)
  const handleAdd = React.useCallback(() => {
    console.log("add-transaction intent");
  }, []);

  return (
    <AppShell insights={STUB_INSIGHTS} onAddTransaction={handleAdd}>
      {children}
    </AppShell>
  );
}
