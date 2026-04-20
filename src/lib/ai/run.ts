"use client";

import { runEngine, isInDistress } from "./engine";
import { useDataStore } from "@/lib/store/data-store";

/**
 * Запускает AI-движок инсайтов и сохраняет результат в store.
 * Вызывается при ручном триггере (кнопка) и автоматически при монтировании
 * /app (если прошло > 8 часов с последнего запуска).
 */
export async function runInsightEngine(): Promise<number> {
  const store = useDataStore.getState();
  const { transactions, categories, goals, budgets, subscriptions, insights, settings } = store;
  const now = new Date();

  const ctx = {
    now,
    transactions,
    categories,
    goals,
    budgets,
    subscriptions,
    baseCurrency: settings.baseCurrency,
    existingInsights: insights,
  };

  // TZ 9.6: в состоянии дистресса — не генерируем новые инсайты.
  if (isInDistress(ctx)) {
    return 0;
  }

  const result = runEngine(ctx);

  for (const p of result.proposed) {
    store.addInsight({
      type: p.type,
      severity: p.severity,
      triggerId: p.triggerId,
      title: p.title,
      body: p.body,
      cta: p.cta,
      metadata: p.metadata,
    });
  }

  return result.proposed.length;
}
