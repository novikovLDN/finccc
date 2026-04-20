"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { GlassCard } from "@/components/ui/glass-card";
import { TopCategories } from "@/components/insights/top-categories";
import { PeriodComparison } from "@/components/insights/period-comparison";
import { useDataStore } from "@/lib/store/data-store";

// Heavy charts lazy-loaded (TZ 10.7 budget)
const SankeyFlow = dynamic(
  () => import("@/components/insights/sankey-flow").then((m) => m.SankeyFlow),
  { ssr: false, loading: () => <ChartSkeleton h={340} className="md:col-span-2" /> },
);
const CalendarHeatmap = dynamic(
  () =>
    import("@/components/insights/calendar-heatmap").then((m) => m.CalendarHeatmap),
  { ssr: false, loading: () => <ChartSkeleton h={160} /> },
);

function ChartSkeleton({ h, className = "" }: { h: number; className?: string }) {
  return (
    <GlassCard className={`p-6 ${className}`}>
      <div className="h-3 w-32 rounded-full bg-[var(--surface-3)]" />
      <div
        className="mt-4 animate-pulse rounded-2xl bg-[var(--surface-3)]/50"
        style={{ height: h }}
      />
    </GlassCard>
  );
}

export default function InsightsPage() {
  const hydrated = useDataStore((s) => s._hydrated);
  const txnsCount = useDataStore((s) => s.transactions.filter((t) => !t.deletedAt).length);

  if (!hydrated) return null;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5">
      <section>
        <h1 className="text-[24px] font-semibold tracking-tight">Аналитика</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Ваши паттерны — без оценок и цифрами. Стрелочки нейтральные.
        </p>
      </section>

      {txnsCount < 5 ? (
        <GlassCard className="p-10 text-center">
          <p className="text-[15px] font-medium">Для аналитики нужно больше операций.</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Инсайты появятся, когда накопится 7+ дней данных. А пока — вы можете исследовать операции вручную.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <SankeyFlow />
          <TopCategories />
          <PeriodComparison />
          <CalendarHeatmap />
        </div>
      )}
    </div>
  );
}
