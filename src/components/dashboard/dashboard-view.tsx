"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { NetFlowCard } from "./net-flow-card";
import { RecentTransactions } from "./recent-transactions";
import { BurnProjectionCard } from "./burn-projection-card";
import { GoalsMini } from "./goals-mini";
import { useDataStore, generateDemoData } from "@/lib/store/data-store";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Sparkles, Wand2 } from "lucide-react";
import { runInsightEngine } from "@/lib/ai/run";
import { PageHeader, TitleItalic } from "@/components/shell/page-header";
import { StaggerReveal } from "@/components/shell/stagger-reveal";

// Тяжёлые Recharts-виджеты — ленивая загрузка.
const BreakdownDonut = dynamic(
  () => import("./breakdown-donut").then((m) => m.BreakdownDonut),
  { ssr: false, loading: () => <ChartSkeleton /> },
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
  const insightsCount = useDataStore(
    (s) => s.insights.filter((i) => !i.dismissedAt).length,
  );

  // Авто-запуск AI engine при первом визите с данными.
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

  const today = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 sm:gap-8 pt-2">
      <PageHeader
        kicker={`Главная · ${today}`}
        title={
          <>
            {greeting},{" "}
            <TitleItalic>
              {txnsCount > 0 ? "вот ваш ритм." : "давайте начнём."}
            </TitleItalic>
          </>
        }
        subtitle={
          txnsCount > 0
            ? "Ниже — ваши цифры без оценок. Посмотрите спокойно."
            : "Здесь появится картина ваших финансов. Первая операция займёт 10 секунд."
        }
        trailing={
          <>
            {txnsCount > 0 && (
              <Button variant="secondary" onClick={() => runInsightEngine()}>
                <Wand2 className="size-4" aria-hidden />
                Инсайты
              </Button>
            )}
            {txnsCount === 0 && (
              <Button variant="secondary" onClick={() => generateDemoData()}>
                <Sparkles className="size-4" aria-hidden />
                Посмотреть на демо-данных
              </Button>
            )}
          </>
        }
      />

      {/* Тонкая разделительная линия-подпись */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="h-px origin-left bg-gradient-to-r from-[var(--warm-line)] via-[var(--warm-line)] to-transparent"
        aria-hidden
      />

      <StaggerReveal
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        stagger={0.06}
        startDelay={0.22}
      >
        <NetFlowCard />
        <BurnProjectionCard />
        <BreakdownDonut />
        <SpendingTrend />
        <GoalsMini />
        <RecentTransactions />
      </StaggerReveal>

      {/* Editorial подпись в футере */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-6 border-t border-[var(--warm-line)] pt-6 text-center text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--text-tertiary)]"
      >
        Это наблюдения — не финансовый совет. Решение всегда за&nbsp;вами.
      </motion.p>
    </div>
  );
}
