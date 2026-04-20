/**
 * AI Engine orchestrator (TZ 9.4).
 *
 * Politik:
 *  - не больше 3 инсайтов в неделю в feed
 *  - не больше 1 push-уведомления в неделю (push не реализуем в MVP — only feed)
 *  - positive reframes приоритетнее при прочих равных
 *  - если пользователь 7+ дней не заходил, показываем 1 объединённый дайджест
 *  - уведомления только 10:00–20:00 локального времени (TZ 9.6 red-line)
 */
import { runAllTriggers } from "./triggers";
import { generateCopy, type CopyContext } from "./copy";
import type { InsightRecord } from "@/lib/types";

export interface EngineContext extends CopyContext {
  now: Date;
  baseCurrency: CopyContext["baseCurrency"];
  existingInsights: InsightRecord[];
}

export interface EngineResult {
  proposed: Array<{
    triggerId: string;
    type: InsightRecord["type"];
    severity: InsightRecord["severity"];
    title: string;
    body: string;
    cta?: string;
    metadata: Record<string, unknown>;
  }>;
}

const WEEK_MS = 7 * 86_400_000;

export function runEngine(ctx: EngineContext): EngineResult {
  // Считаем, сколько инсайтов уже показано за последние 7 дней
  const weekAgo = new Date(ctx.now.getTime() - WEEK_MS);
  const recentInsights = ctx.existingInsights.filter(
    (i) => new Date(i.createdAt) >= weekAgo && !i.dismissedAt,
  );
  const recentByTrigger = new Set(
    recentInsights.map((i) => (i.metadata?.triggerId as string) ?? i.id),
  );

  const budget = Math.max(0, 3 - recentInsights.length);

  if (budget === 0) return { proposed: [] };

  // 1. Run rule-based detection (TZ 9.2.1)
  const candidates = runAllTriggers({
    now: ctx.now,
    transactions: ctx.transactions,
    goals: ctx.goals,
    budgets: ctx.budgets,
    subscriptions: ctx.subscriptions,
    baseCurrency: ctx.baseCurrency,
  });

  // 2. Drop already-shown types (dedupe)
  const fresh = candidates.filter((c) => !recentByTrigger.has(c.triggerId));

  // 3. Generate copy + safety filter (TZ 9.6)
  const withCopy = fresh
    .map((c) => {
      const copy = generateCopy(c, ctx);
      if (!copy) return null;
      return { cand: c, copy };
    })
    .filter(Boolean) as Array<{
    cand: (typeof candidates)[number];
    copy: ReturnType<typeof generateCopy>;
  }>;

  // 4. Приоритизация: positive reframes выше (TZ 9.4).
  const positiveBonus = 10;
  const ranked = withCopy
    .map(({ cand, copy }) => ({
      cand,
      copy,
      score: cand.priority + (cand.type === "positive" ? positiveBonus : 0),
    }))
    .sort((a, b) => b.score - a.score);

  // 5. Возвращаем до budget элементов
  return {
    proposed: ranked.slice(0, budget).map(({ cand, copy }) => ({
      triggerId: cand.triggerId,
      type: cand.type,
      severity: cand.severity,
      title: copy!.title,
      body: copy!.body,
      cta: copy!.cta,
      metadata: { triggerId: cand.triggerId, ...cand.data },
    })),
  };
}

/**
 * Детектор financial distress (TZ 9.6) — даём пользователю пространство.
 * Если серия отрицательных net flow — не показываем инсайты.
 */
export function isInDistress(ctx: EngineContext): boolean {
  // серия из 2+ месяцев отрицательного net flow → распыляемся
  const months = [0, 1].map((offset) => {
    const ref = new Date(ctx.now.getFullYear(), ctx.now.getMonth() - offset, 1);
    const start = ref;
    const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
    const income = ctx.transactions
      .filter(
        (t) =>
          !t.deletedAt &&
          t.type === "income" &&
          new Date(t.transactionDate) >= start &&
          new Date(t.transactionDate) <= end,
      )
      .reduce((a, b) => a + b.amountBaseMinor, 0);
    const expense = ctx.transactions
      .filter(
        (t) =>
          !t.deletedAt &&
          t.type === "expense" &&
          new Date(t.transactionDate) >= start &&
          new Date(t.transactionDate) <= end,
      )
      .reduce((a, b) => a + b.amountBaseMinor, 0);
    return income - expense;
  });
  return months[0] < 0 && months[1] < 0 && Math.abs(months[0]) > 50_000 * 100;
}
