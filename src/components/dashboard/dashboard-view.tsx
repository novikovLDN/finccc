"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { NetFlowCard } from "./net-flow-card";
import { RecentTransactions } from "./recent-transactions";
import { BurnProjectionCard } from "./burn-projection-card";
import { GoalsMini } from "./goals-mini";
import { useDataStore, generateDemoData } from "@/lib/store/data-store";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Sparkles, Wand2 } from "lucide-react";
import { runInsightEngine } from "@/lib/ai/run";

// Тяжёлые Recharts-виджеты грузим динамически для соблюдения
// бюджета JS (TZ 10.7: < 180 KB gzip на первый лод).
const BreakdownDonut = dynamic(
  () => import("./breakdown-donut").then((m) => m.BreakdownDonut),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  },
);
const SpendingTrend = dynamic(
  () => import("./spending-trend").then((m) => m.SpendingTrend),
  {
    ssr: false,
    loading: () => <ChartSkeleton className="md:col-span-2" />,
  },
);

function ChartSkeleton({ className = "" }: { className?: string }) {
  return (
    <GlassCard className={`p-6 ${className}`}>
      <div className="h-3 w-32 rounded-full bg-[var(--surface-3)]" />
      <div className="mt-4 h-[180px] animate-pulse rounded-2xl bg-[var(--surface-3)]/50" />
    </GlassCard>
  );
}

export function DashboardView() {
  const hydrated = useDataStore((s) => s._hydrated);
  const txnsCount = useDataStore((s) => s.transactions.filter((t) => !t.deletedAt).length);

  // TZ 9: авто-запуск движка инсайтов 1 раз при первой загрузке
  // dashboard, если данных достаточно.
  const insightsCount = useDataStore((s) => s.insights.filter((i) => !i.dismissedAt).length);
  React.useEffect(() => {
    if (!hydrated) return;
    if (txnsCount >= 10 && insightsCount === 0) {
      runInsightEngine();
    }
  }, [hydrated, txnsCount, insightsCount]);

  const greeting = React.useMemo(() => {
    const h = new Date().getHours();
    if (h < 6) return "Доброй ночи";
    if (h < 12) return "Доброе утро";
    if (h < 18) return "Добрый день";
    return "Добрый вечер";
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[var(--text-tertiary)] text-sm">
        Загружаем ваши данные…
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5">
      <section className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">{greeting}</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {txnsCount > 0
              ? "Ваш месяц, ваш ритм. Всё здесь."
              : "Здесь появится картина ваших финансов. Начнём с первой операции?"}
          </p>
        </div>
        <div className="flex gap-2">
          {txnsCount > 0 && (
            <Button variant="secondary" onClick={() => runInsightEngine()}>
              <Wand2 className="size-4" aria-hidden />
              Пересчитать инсайты
            </Button>
          )}
          {txnsCount === 0 && (
            <Button variant="secondary" onClick={() => generateDemoData()}>
              <Sparkles className="size-4" aria-hidden />
              Посмотреть на демо-данных
            </Button>
          )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <NetFlowCard />
        <BurnProjectionCard />
        <BreakdownDonut />
        <SpendingTrend />
        <GoalsMini />
        <RecentTransactions />
      </div>
    </div>
  );
}
