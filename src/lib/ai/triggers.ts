/**
 * Rule-based слой детекции паттернов (TZ 9.2.1).
 * 10 триггеров. Каждый возвращает кандидат-объект или null.
 * Без LLM — чистая детерминированная логика. Frontend-only для MVP.
 */
import type { Transaction, Goal, Budget, Subscription } from "@/lib/types";
import {
  totalExpenses,
  totalIncome,
  netFlow,
  savingsRate,
  weeklyZScore,
  categoryTrend,
  budgetStatus,
  projectGoal,
  startOfMonth,
  endOfMonth,
  addDays,
  startOfDay,
  endOfDay,
  inRange,
} from "@/lib/formulas";
import type { CurrencyCode } from "@/lib/currency";

export type InsightType = "pattern" | "trajectory" | "subscription" | "goal" | "positive";

export interface TriggerCandidate {
  triggerId: string; // TRIG-01..10
  type: InsightType;
  severity: "info" | "attention";
  priority: number; // 0..100, higher = more prominent
  data: Record<string, unknown>;
}

export interface TriggerContext {
  now: Date;
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  subscriptions: Subscription[];
  baseCurrency: CurrencyCode;
}

// ============================================================
// TRIG-01: категория выросла vs 4 недель (+30% AND z > 2)
// TRIG-02: упала -30% (positive reframe)
// TRIG-09: очень большая единичная трата > 3σ
// ============================================================
export function detectCategoryGrowth(ctx: TriggerContext): TriggerCandidate[] {
  const results: TriggerCandidate[] = [];
  const catIds = Array.from(new Set(ctx.transactions.map((t) => t.categoryId).filter(Boolean))) as string[];
  for (const catId of catIds) {
    const { z, mean, current } = weeklyZScore(ctx.transactions, catId, ctx.now);
    if (z == null || mean === 0) continue;
    const diff = current - mean;
    const pct = (diff / mean) * 100;
    if (z > 2 && pct > 30) {
      results.push({
        triggerId: "TRIG-01",
        type: "pattern",
        severity: "info",
        priority: 60 + Math.min(20, z * 5),
        data: { categoryId: catId, current, mean, z, pct },
      });
    } else if (z < -1 && pct < -30 && mean > 0) {
      // TRIG-02 positive reframe
      results.push({
        triggerId: "TRIG-02",
        type: "positive",
        severity: "info",
        priority: 70,
        data: { categoryId: catId, current, mean, pct },
      });
    }
  }
  return results;
}

// ============================================================
// TRIG-03: подписок ≥ 10
// ============================================================
export function detectSubscriptionOverload(ctx: TriggerContext): TriggerCandidate[] {
  const active = ctx.subscriptions.filter((s) => s.isActive);
  if (active.length < 10) return [];
  return [
    {
      triggerId: "TRIG-03",
      type: "subscription",
      severity: "info",
      priority: 65,
      data: { count: active.length, subs: active.map((s) => s.id) },
    },
  ];
}

// ============================================================
// TRIG-04: неиспользуемая подписка 90+ дней — stub (нужны данные usage).
// В Frontend-MVP сигнал отсутствия активности в связанной категории 60+ дней.
// ============================================================
export function detectDormantSubscriptions(ctx: TriggerContext): TriggerCandidate[] {
  const results: TriggerCandidate[] = [];
  for (const sub of ctx.subscriptions) {
    if (!sub.isActive) continue;
    const lastSeen = new Date(sub.lastSeenDate);
    const diff = Math.round((ctx.now.getTime() - lastSeen.getTime()) / 86_400_000);
    if (diff > 90) {
      results.push({
        triggerId: "TRIG-04",
        type: "subscription",
        severity: "info",
        priority: 55,
        data: { subId: sub.id, daysSince: diff },
      });
    }
  }
  return results;
}

// ============================================================
// TRIG-05: прогноз бюджета превысит 100% к дню 15 месяца
// ============================================================
export function detectBudgetOverrunProjection(ctx: TriggerContext): TriggerCandidate[] {
  const results: TriggerCandidate[] = [];
  const dayOfMonth = ctx.now.getDate();
  if (dayOfMonth < 8) return []; // рано считать
  for (const b of ctx.budgets) {
    const status = budgetStatus(b, ctx.transactions, ctx.now);
    if (status.projectedEndPercent > 100 && status.percent < 100) {
      results.push({
        triggerId: "TRIG-05",
        type: "trajectory",
        severity: "attention",
        priority: 75,
        data: {
          budgetId: b.id,
          currentPercent: status.percent,
          projectedPercent: status.projectedEndPercent,
        },
      });
    }
  }
  return results;
}

// ============================================================
// TRIG-06: цель под угрозой срока (projected > target × 1.15)
// ============================================================
export function detectGoalRisk(ctx: TriggerContext): TriggerCandidate[] {
  const results: TriggerCandidate[] = [];
  for (const g of ctx.goals) {
    if (g.completedAt || g.archivedAt) continue;
    const proj = projectGoal(g, ctx.transactions, ctx.now);
    if (proj.onTrack === false) {
      results.push({
        triggerId: "TRIG-06",
        type: "goal",
        severity: "info",
        priority: 55,
        data: {
          goalId: g.id,
          deltaDays: proj.deltaDays,
          projectedDate: proj.projectedDate,
        },
      });
    }
  }
  return results;
}

// ============================================================
// TRIG-07: savings rate упал 3 месяца подряд — negative trend
// TRIG-08: savings rate вырос ≥ 5 pp — positive reframe
// ============================================================
export function detectSavingsRateTrend(ctx: TriggerContext): TriggerCandidate[] {
  const months = [0, 1, 2].map((offset) => {
    const ref = new Date(ctx.now.getFullYear(), ctx.now.getMonth() - offset, 1);
    const range = { start: startOfMonth(ref), end: endOfMonth(ref) };
    return savingsRate(ctx.transactions, range);
  });
  const valid = months.filter((m) => m != null) as number[];
  if (valid.length < 3) return [];
  const results: TriggerCandidate[] = [];

  // TRIG-07: 3 месяца подряд уменьшается
  if (valid[0] < valid[1] && valid[1] < valid[2]) {
    results.push({
      triggerId: "TRIG-07",
      type: "trajectory",
      severity: "info",
      priority: 60,
      data: { current: valid[0], three_mo_ago: valid[2] },
    });
  }

  // TRIG-08: positive reframe: вырос ≥ 5 pp vs прошлый месяц
  if (valid[0] - valid[1] >= 5) {
    results.push({
      triggerId: "TRIG-08",
      type: "positive",
      severity: "info",
      priority: 85,
      data: { current: valid[0], previous: valid[1], delta: valid[0] - valid[1] },
    });
  }
  return results;
}

// ============================================================
// TRIG-09: крупная единичная транзакция (>3σ от средней в категории)
// ============================================================
export function detectOutlierTransactions(ctx: TriggerContext): TriggerCandidate[] {
  const results: TriggerCandidate[] = [];
  const since = addDays(ctx.now, -14);
  const recent = ctx.transactions.filter(
    (t) => !t.deletedAt && t.type === "expense" && new Date(t.transactionDate) >= since,
  );

  const byCat = new Map<string, Transaction[]>();
  for (const t of ctx.transactions) {
    if (t.deletedAt || t.type !== "expense" || !t.categoryId) continue;
    const arr = byCat.get(t.categoryId) ?? [];
    arr.push(t);
    byCat.set(t.categoryId, arr);
  }

  for (const t of recent) {
    if (!t.categoryId) continue;
    const hist = byCat.get(t.categoryId) ?? [];
    if (hist.length < 5) continue;
    const mean = hist.reduce((a, b) => a + b.amountBaseMinor, 0) / hist.length;
    const variance = hist.reduce((a, b) => a + (b.amountBaseMinor - mean) ** 2, 0) / hist.length;
    const std = Math.sqrt(variance);
    if (std === 0) continue;
    const z = (t.amountBaseMinor - mean) / std;
    if (z > 3) {
      results.push({
        triggerId: "TRIG-09",
        type: "pattern",
        severity: "info",
        priority: 50 + Math.min(15, z * 3),
        data: { txnId: t.id, amount: t.amountBaseMinor, mean, z },
      });
    }
  }
  return results;
}

// ============================================================
// TRIG-10: no-spend day / серия 3+ дней без трат — positive reframe
// ============================================================
export function detectNoSpendStreak(ctx: TriggerContext): TriggerCandidate[] {
  const today = startOfDay(ctx.now);
  let streak = 0;
  for (let i = 0; i < 14; i++) {
    const day = addDays(today, -i);
    const range = { start: startOfDay(day), end: endOfDay(day) };
    const spent = ctx.transactions
      .filter((t) => !t.deletedAt && t.type === "expense" && inRange(t.transactionDate, range))
      .reduce((a, b) => a + b.amountBaseMinor, 0);
    if (spent > 0) break;
    streak++;
  }
  if (streak >= 3) {
    return [
      {
        triggerId: "TRIG-10",
        type: "positive",
        severity: "info",
        priority: 65,
        data: { streak },
      },
    ];
  }
  return [];
}

// ============================================================
// Runner
// ============================================================
export function runAllTriggers(ctx: TriggerContext): TriggerCandidate[] {
  return [
    ...detectCategoryGrowth(ctx),
    ...detectSubscriptionOverload(ctx),
    ...detectDormantSubscriptions(ctx),
    ...detectBudgetOverrunProjection(ctx),
    ...detectGoalRisk(ctx),
    ...detectSavingsRateTrend(ctx),
    ...detectOutlierTransactions(ctx),
    ...detectNoSpendStreak(ctx),
  ];
}
