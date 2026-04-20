/**
 * Раздел 8 ТЗ: формулы и расчёты.
 * Все суммы в minor units (integer).
 * Юнит-тестируемые pure functions.
 */
import type { Transaction, Budget, Goal, Subscription, RecurrenceFrequency } from "./types";

// ============================================================
// Period helpers
// ============================================================

export interface DateRange {
  start: Date;
  end: Date;
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function inRange(dateIso: string, range: DateRange): boolean {
  const d = new Date(dateIso + "T00:00:00");
  return d >= range.start && d <= range.end;
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function daysBetween(a: Date, b: Date): number {
  const MS = 86_400_000;
  return Math.round((endOfDay(b).getTime() - startOfDay(a).getTime()) / MS);
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function periodRange(period: "day" | "week" | "month" | "quarter" | "year" | "all"): DateRange {
  const now = new Date();
  switch (period) {
    case "day":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week": {
      const dow = (now.getDay() + 6) % 7; // Monday=0
      const start = startOfDay(addDays(now, -dow));
      return { start, end: endOfDay(addDays(start, 6)) };
    }
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "quarter": {
      const q = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), q * 3, 1);
      const end = endOfDay(new Date(now.getFullYear(), q * 3 + 3, 0));
      return { start, end };
    }
    case "year":
      return { start: new Date(now.getFullYear(), 0, 1), end: endOfDay(new Date(now.getFullYear(), 11, 31)) };
    case "all":
      return { start: new Date(2000, 0, 1), end: endOfDay(now) };
  }
}

function isTxnInRange(t: Transaction, range: DateRange): boolean {
  if (t.deletedAt) return false;
  return inRange(t.transactionDate, range);
}

// ============================================================
// 8.2 — базовые агрегаты
// ============================================================

/** 8.2.1 Total expenses за период */
export function totalExpenses(txns: Transaction[], range: DateRange): number {
  return txns.reduce((acc, t) => {
    if (t.type !== "expense") return acc;
    if (!isTxnInRange(t, range)) return acc;
    return acc + t.amountBaseMinor;
  }, 0);
}

/** 8.2.2 Total income за период */
export function totalIncome(txns: Transaction[], range: DateRange): number {
  return txns.reduce((acc, t) => {
    if (t.type !== "income") return acc;
    if (!isTxnInRange(t, range)) return acc;
    return acc + t.amountBaseMinor;
  }, 0);
}

/** 8.2.3 Net flow = доходы − расходы (может быть отрицательным; отображаем нейтральным цветом). */
export function netFlow(txns: Transaction[], range: DateRange): number {
  return totalIncome(txns, range) - totalExpenses(txns, range);
}

/**
 * 8.2.4 Savings rate = Net_Flow / Total_Income × 100%.
 * Если доход = 0 → null (UI покажет «—»).
 */
export function savingsRate(txns: Transaction[], range: DateRange): number | null {
  const inc = totalIncome(txns, range);
  if (inc === 0) return null;
  return (netFlow(txns, range) / inc) * 100;
}

/** 8.2.5 Breakdown по категориям */
export interface CategoryTotal {
  categoryId: string | null;
  total: number;
  share: number; // 0..100
}
export function categoryBreakdown(txns: Transaction[], range: DateRange): CategoryTotal[] {
  const total = totalExpenses(txns, range);
  const map = new Map<string | null, number>();
  for (const t of txns) {
    if (t.type !== "expense" || !isTxnInRange(t, range)) continue;
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amountBaseMinor);
  }
  return Array.from(map.entries())
    .map(([categoryId, sum]) => ({
      categoryId,
      total: sum,
      share: total > 0 ? (sum / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

// ============================================================
// 8.3 — Прогнозирование
// ============================================================

/** 8.3.1 Линейный прогноз расходов до конца месяца по текущему burn-rate. */
export interface BurnProjection {
  totalSoFar: number;
  projectedMonthTotal: number;
  dailyAvgExpense: number;
  daysElapsed: number;
  daysRemaining: number;
}
export function projectMonthExpenses(txns: Transaction[], now = new Date()): BurnProjection {
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const elapsedRange: DateRange = { start: monthStart, end: endOfDay(now) };
  const totalSoFar = totalExpenses(txns, elapsedRange);
  const daysElapsed = Math.max(1, daysBetween(monthStart, now));
  const daysRemaining = Math.max(0, daysBetween(addDays(now, 1), monthEnd));
  const dailyAvgExpense = totalSoFar / daysElapsed;
  const projectedMonthTotal = totalSoFar + dailyAvgExpense * daysRemaining;
  return { totalSoFar, projectedMonthTotal, dailyAvgExpense, daysElapsed, daysRemaining };
}

/**
 * 8.3.2 Weighted Moving Average (WMA-7)
 * Веса 7..1 для последних 7 дней (включая сегодня как день 0).
 * Знаменатель = 28. Возвращает среднее в minor units.
 */
export function wma7DailyExpense(txns: Transaction[], now = new Date()): number {
  const weights = [7, 6, 5, 4, 3, 2, 1];
  const today = startOfDay(now);
  let sum = 0;
  weights.forEach((w, offset) => {
    const day = addDays(today, -offset);
    const range: DateRange = { start: day, end: endOfDay(day) };
    sum += w * totalExpenses(txns, range);
  });
  return sum / 28;
}

/**
 * 8.3.3 Прогноз достижения цели накоплений.
 * avg_monthly_net = Net_Flow(last_3_months) / 3.
 * Если <=0 → неопределённо.
 */
export interface GoalProjection {
  remainingMinor: number;
  avgMonthlyNetMinor: number;
  monthsToGoal: number | null;
  projectedDate: string | null;
  onTrack: boolean | null;
  deltaDays: number | null;
}
export function projectGoal(
  goal: Goal,
  txns: Transaction[],
  now = new Date(),
): GoalProjection {
  const remaining = Math.max(0, goal.targetAmountMinor - goal.currentSavedMinor);
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  const range: DateRange = { start: threeMonthsAgo, end: endOfDay(now) };
  const netForPeriod = netFlow(txns, range);
  const avgMonthly = netForPeriod / 3;

  if (remaining === 0) {
    return {
      remainingMinor: 0,
      avgMonthlyNetMinor: avgMonthly,
      monthsToGoal: 0,
      projectedDate: isoDate(now),
      onTrack: true,
      deltaDays: 0,
    };
  }

  if (avgMonthly <= 0) {
    return {
      remainingMinor: remaining,
      avgMonthlyNetMinor: avgMonthly,
      monthsToGoal: null,
      projectedDate: null,
      onTrack: null,
      deltaDays: null,
    };
  }

  const months = remaining / avgMonthly;
  const projDate = new Date(now);
  projDate.setDate(projDate.getDate() + Math.round(months * 30.4375));

  const targetDate = new Date(goal.targetDate + "T00:00:00");
  const deltaDays = daysBetween(targetDate, projDate);
  const onTrack = projDate <= targetDate;

  return {
    remainingMinor: remaining,
    avgMonthlyNetMinor: avgMonthly,
    monthsToGoal: months,
    projectedDate: isoDate(projDate),
    onTrack,
    deltaDays,
  };
}

/**
 * Расчёт требуемой ежемесячной суммы для цели (TZ 7.5 GOAL-02).
 * required = (target − saved) / monthsUntilTarget.
 */
export function requiredMonthlyContribution(goal: Goal, now = new Date()): number {
  const remaining = Math.max(0, goal.targetAmountMinor - goal.currentSavedMinor);
  const target = new Date(goal.targetDate + "T00:00:00");
  const months = Math.max(1, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
  return Math.ceil(remaining / months);
}

// ============================================================
// 8.4 — Подписки
// ============================================================

/** Приведение периодичности к месячному эквиваленту (TZ 8.4.3) */
export function monthlyEquivalent(amountMinor: number, frequency: RecurrenceFrequency): number {
  switch (frequency) {
    case "weekly":
      return Math.round((amountMinor * 52) / 12);
    case "biweekly":
      return Math.round((amountMinor * 26) / 12);
    case "monthly":
      return amountMinor;
    case "quarterly":
      return Math.round(amountMinor / 3);
    case "semiannual":
      return Math.round(amountMinor / 6);
    case "annual":
      return Math.round(amountMinor / 12);
  }
}

/** Median для массивов (устойчивее к выбросам — TZ 8.4.2). */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}

/** Нормализация описания для детекции регулярности (TZ 8.4.1). */
export function normalizeMerchant(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/\d+/g, "")
    .replace(/[^\p{L}\s]/gu, "")
    .trim()
    .replace(/\s+/g, " ");
}

export interface DetectedSubscription {
  merchantPattern: string;
  occurrences: Transaction[];
  medianAmountMinor: number;
  medianIntervalDays: number;
  frequency: RecurrenceFrequency;
  lastDate: string;
  nextBillingDate: string;
}

/**
 * 8.4.1–8.4.2 Детекция подписок из транзакций пользователя.
 * - ≥3 операций с одним нормализованным паттерном
 * - интервалы в окне базовой периодичности ±3 дня
 * - суммы отличаются не более чем на 5%
 */
export function detectSubscriptions(txns: Transaction[]): DetectedSubscription[] {
  const expenses = txns
    .filter((t) => t.type === "expense" && !t.deletedAt)
    .sort((a, b) => a.transactionDate.localeCompare(b.transactionDate));

  const buckets = new Map<string, Transaction[]>();
  for (const t of expenses) {
    const key = normalizeMerchant(t.description);
    if (!key) continue;
    const arr = buckets.get(key) ?? [];
    arr.push(t);
    buckets.set(key, arr);
  }

  const result: DetectedSubscription[] = [];
  for (const [pattern, items] of buckets) {
    if (items.length < 3) continue;

    // Средняя сумма + проверка 5%
    const amounts = items.map((t) => t.amountBaseMinor);
    const mid = median(amounts);
    const withinBand = amounts.every((a) => Math.abs(a - mid) / Math.max(1, mid) <= 0.05);
    if (!withinBand) continue;

    // Интервалы между последовательными датами
    const intervals: number[] = [];
    for (let i = 1; i < items.length; i++) {
      const a = new Date(items[i - 1].transactionDate + "T00:00:00");
      const b = new Date(items[i].transactionDate + "T00:00:00");
      intervals.push(daysBetween(a, b));
    }
    const medianInterval = median(intervals);
    const frequency = inferFrequency(medianInterval);
    if (!frequency) continue;

    const baseDays = FREQ_DAYS[frequency];
    const allOk = intervals.every((x) => Math.abs(x - baseDays) <= 3);
    if (!allOk) continue;

    const last = items[items.length - 1];
    const nextDate = addDays(new Date(last.transactionDate + "T00:00:00"), Math.round(medianInterval));

    result.push({
      merchantPattern: pattern,
      occurrences: items,
      medianAmountMinor: Math.round(mid),
      medianIntervalDays: medianInterval,
      frequency,
      lastDate: last.transactionDate,
      nextBillingDate: isoDate(nextDate),
    });
  }
  return result;
}

const FREQ_DAYS: Record<RecurrenceFrequency, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  quarterly: 91,
  semiannual: 182,
  annual: 365,
};

function inferFrequency(days: number): RecurrenceFrequency | null {
  const tol = 3;
  if (Math.abs(days - 7) <= tol) return "weekly";
  if (Math.abs(days - 14) <= tol) return "biweekly";
  if (Math.abs(days - 30) <= 4) return "monthly";
  if (Math.abs(days - 91) <= 5) return "quarterly";
  if (Math.abs(days - 182) <= 7) return "semiannual";
  if (Math.abs(days - 365) <= 10) return "annual";
  return null;
}

// ============================================================
// 8.6 — Метрики для AI-инсайтов
// ============================================================

/**
 * 8.6.1 Z-score по категории за последние 12 недель.
 * Возвращает null, если данных недостаточно (std=0 или 0 недель).
 */
export function weeklyZScore(
  txns: Transaction[],
  categoryId: string,
  now = new Date(),
): { z: number | null; mean: number; std: number; current: number } {
  const weeks: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const end = addDays(startOfDay(now), -7 * (i - 1));
    const start = addDays(end, -6);
    const total = txns
      .filter(
        (t) =>
          !t.deletedAt &&
          t.type === "expense" &&
          t.categoryId === categoryId &&
          inRange(t.transactionDate, { start, end: endOfDay(end) }),
      )
      .reduce((acc, t) => acc + t.amountBaseMinor, 0);
    weeks.push(total);
  }
  const current = weeks[0];
  const history = weeks.slice(1);
  const mean = history.reduce((a, b) => a + b, 0) / Math.max(1, history.length);
  const variance =
    history.reduce((acc, v) => acc + (v - mean) ** 2, 0) / Math.max(1, history.length);
  const std = Math.sqrt(variance);
  if (std === 0 || history.length === 0) {
    return { z: null, mean, std, current };
  }
  return { z: (current - mean) / std, mean, std, current };
}

/**
 * 8.6.2 Линейный тренд по категории за 90 дней (least squares).
 * Значимость: |slope| * 30 / mean > 0.2
 */
export interface TrendResult {
  slope: number; // minor/day
  intercept: number;
  meanDaily: number;
  significant: boolean;
  direction: "up" | "down" | "stable";
}
export function categoryTrend(
  txns: Transaction[],
  categoryId: string,
  now = new Date(),
): TrendResult {
  const days = 90;
  const start = startOfDay(addDays(now, -days + 1));
  const series: { t: number; y: number }[] = [];
  for (let i = 0; i < days; i++) {
    const day = addDays(start, i);
    const total = txns
      .filter(
        (t) =>
          !t.deletedAt &&
          t.type === "expense" &&
          t.categoryId === categoryId &&
          t.transactionDate === isoDate(day),
      )
      .reduce((acc, t) => acc + t.amountBaseMinor, 0);
    series.push({ t: i, y: total });
  }
  const n = series.length;
  const sumT = series.reduce((a, p) => a + p.t, 0);
  const sumY = series.reduce((a, p) => a + p.y, 0);
  const sumTY = series.reduce((a, p) => a + p.t * p.y, 0);
  const sumTT = series.reduce((a, p) => a + p.t * p.t, 0);
  const denom = n * sumTT - sumT * sumT;
  const slope = denom === 0 ? 0 : (n * sumTY - sumT * sumY) / denom;
  const intercept = (sumY - slope * sumT) / n;
  const meanDaily = sumY / n;
  const significance = Math.abs(slope * 30) / Math.max(1, meanDaily);
  return {
    slope,
    intercept,
    meanDaily,
    significant: significance > 0.2,
    direction: !meanDaily ? "stable" : slope * 30 / meanDaily > 0.05 ? "up" : slope * 30 / meanDaily < -0.05 ? "down" : "stable",
  };
}

/**
 * 8.6.3 Wellness score (internal, не показываем пользователю).
 * Composite 4 фактора, диапазон [0,1].
 */
export interface WellnessInputs {
  savingsRate: number | null; // %; null -> treat as 0
  budgets: { overBudget: number; total: number };
  dailyExpensesLast30: number[]; // minor units per day
  goals: { progressRatio: number }[]; // 0..1 each
}
export function wellnessScore(x: WellnessInputs): number {
  const sr = x.savingsRate == null ? 0 : x.savingsRate;
  const savings_norm = clamp01((sr + 100) / 150);
  const bud = x.budgets.total > 0 ? 1 - x.budgets.overBudget / x.budgets.total : 1;
  const mean = x.dailyExpensesLast30.reduce((a, b) => a + b, 0) / Math.max(1, x.dailyExpensesLast30.length);
  const variance =
    x.dailyExpensesLast30.reduce((a, b) => a + (b - mean) ** 2, 0) /
    Math.max(1, x.dailyExpensesLast30.length);
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
  const vol_inv = 1 / (1 + cv);
  const goals_avg =
    x.goals.length === 0
      ? 0.5
      : x.goals.reduce((a, g) => a + clamp01(g.progressRatio), 0) / x.goals.length;

  return (
    0.35 * savings_norm + 0.25 * bud + 0.15 * vol_inv + 0.25 * goals_avg
  );
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

// ============================================================
// Budget utilities (TZ 7.4)
// ============================================================

export function budgetRange(budget: Budget, now = new Date()): DateRange {
  switch (budget.periodType) {
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "week": {
      const dow = (now.getDay() + 6) % 7;
      const start = startOfDay(addDays(now, -dow));
      return { start, end: endOfDay(addDays(start, 6)) };
    }
    case "quarter": {
      const q = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), q * 3, 1);
      const end = endOfDay(new Date(now.getFullYear(), q * 3 + 3, 0));
      return { start, end };
    }
  }
}

export interface BudgetStatus {
  usedMinor: number;
  amountMinor: number;
  percent: number; // может быть >100
  projectedEndPercent: number; // на конец периода по burn-rate
  daysLeft: number;
  softAlert: boolean; // 80% — TZ 7.4 BDG-08
}

export function budgetStatus(
  budget: Budget,
  txns: Transaction[],
  now = new Date(),
): BudgetStatus {
  const range = budgetRange(budget, now);
  const used = txns
    .filter(
      (t) =>
        !t.deletedAt &&
        t.type === "expense" &&
        (budget.categoryId == null ? true : t.categoryId === budget.categoryId) &&
        isTxnInRange(t, { start: range.start, end: endOfDay(now) > range.end ? range.end : endOfDay(now) }),
    )
    .reduce((acc, t) => acc + t.amountBaseMinor, 0);

  const percent = (used / Math.max(1, budget.amountMinor)) * 100;
  const elapsed = Math.max(1, daysBetween(range.start, now));
  const totalDays = Math.max(1, daysBetween(range.start, range.end));
  const daysLeft = Math.max(0, totalDays - elapsed);
  const projected = (used / elapsed) * totalDays;
  const projectedEndPercent = (projected / Math.max(1, budget.amountMinor)) * 100;
  return {
    usedMinor: used,
    amountMinor: budget.amountMinor,
    percent,
    projectedEndPercent,
    daysLeft,
    softAlert: percent >= 80,
  };
}
