/**
 * Copy-генератор инсайтов (TZ 9.3, 9.6 guardrails).
 *
 * Structure инсайт-карточки (Приложение А.2):
 *   строка 1 — нейтральное наблюдение с цифрой
 *   строка 2 — проекция или контекст
 *   строка 3 — открытое приглашение
 *
 * Guardrails (TZ 9.6):
 *   - post-generation filter на стоп-слова → регенерация
 *   - длина > 280 символов → регенерация (лимит мягкий, проверяем)
 *   - нет конкретных инвестиционных советов
 *   - disclaimer-строка в UI отдельно
 *
 * Для MVP используем шаблоны (детерминированно, без LLM):
 * на Pro-плане — LLM enhancement через Anthropic Claude API, TZ 10.1.
 */
import type { TriggerCandidate } from "./triggers";
import type { Category, Transaction, Goal, Budget, Subscription } from "@/lib/types";
import { formatMoney } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/currency";
import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");

export interface CopyContext {
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  subscriptions: Subscription[];
  baseCurrency: CurrencyCode;
}

export interface GeneratedCopy {
  title: string;
  body: string;
  cta?: string;
}

// TZ 9.6: запрещённые слова/фразы (Приложение А.1).
// В JS regex \b не работает для кириллицы, поэтому используем
// lookaround через character class из не-букв/цифр.
// Stop-word prefixes — матчат и производные формы.
// Например "тревожн" поймает «тревожно», «тревожный», «тревожным».
const STOP_WORD_PREFIXES = [
  "должн",
  "надо",
  "следует",
  "срочно",
  "немедленн",
  "плохо",
  "критичн",
  "тревожн",
  "тревог",
  "опасн",
];
const STOP_PHRASE_SUBSTRINGS = [
  "слишком много",
];
const STOP_PHRASES = [
  "вы превысили",
  "вы потратили",
  "потратили слишком",
  "внимание!",
  "ошибка!",
];

export function passesSafety(text: string): boolean {
  if (text.length > 280) return false;
  const low = text.toLowerCase();
  for (const phrase of STOP_PHRASES) {
    if (low.includes(phrase)) return false;
  }
  for (const phrase of STOP_PHRASE_SUBSTRINGS) {
    if (low.includes(phrase)) return false;
  }
  for (const prefix of STOP_WORD_PREFIXES) {
    // префикс-match: слово начинается с prefix и далее идут буквы или граница.
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(prefix)}`, "iu");
    if (re.test(text)) return false;
  }
  return true;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function generateCopy(cand: TriggerCandidate, ctx: CopyContext): GeneratedCopy | null {
  switch (cand.triggerId) {
    case "TRIG-01":
      return copyCategoryGrowth(cand, ctx);
    case "TRIG-02":
      return copyCategoryFall(cand, ctx);
    case "TRIG-03":
      return copySubscriptionOverload(cand, ctx);
    case "TRIG-04":
      return copyDormantSubscription(cand, ctx);
    case "TRIG-05":
      return copyBudgetProjection(cand, ctx);
    case "TRIG-06":
      return copyGoalRisk(cand, ctx);
    case "TRIG-07":
      return copySavingsRateDown(cand, ctx);
    case "TRIG-08":
      return copySavingsRateUp(cand, ctx);
    case "TRIG-09":
      return copyOutlier(cand, ctx);
    case "TRIG-10":
      return copyNoSpend(cand, ctx);
    default:
      return null;
  }
}

function finalize(copy: GeneratedCopy): GeneratedCopy | null {
  // Проверяем стоп-слова (TZ 9.6)
  if (!passesSafety(copy.title) || !passesSafety(copy.body)) {
    return null;
  }
  return copy;
}

// TRIG-01 — категория выросла
function copyCategoryGrowth(c: TriggerCandidate, ctx: CopyContext): GeneratedCopy | null {
  const { categoryId, current, pct } = c.data as { categoryId: string; current: number; pct: number };
  const cat = ctx.categories.find((x) => x.id === categoryId);
  if (!cat) return null;
  return finalize({
    title: `Заметили: ${cat.icon} ${cat.name} в этом ритме — ${formatMoney(current, ctx.baseCurrency, { compact: true })} за неделю`,
    body: `Это примерно на ${Math.round(pct)}% больше, чем среднее за последние недели. Ни хорошо, ни плохо — просто факт. Хотите посмотреть поближе?`,
    cta: "Открыть категорию",
  });
}

// TRIG-02 — категория упала (positive)
function copyCategoryFall(c: TriggerCandidate, ctx: CopyContext): GeneratedCopy | null {
  const { categoryId, pct } = c.data as { categoryId: string; pct: number };
  const cat = ctx.categories.find((x) => x.id === categoryId);
  if (!cat) return null;
  return finalize({
    title: `${cat.icon} ${cat.name} стало тише`,
    body: `На этой неделе сюда ушло на ${Math.abs(Math.round(pct))}% меньше, чем обычно. Это ваш выбор и ваш результат.`,
  });
}

// TRIG-03 — подписок ≥ 10 (точь-в-точь пример TZ 9.3 Тип 3)
function copySubscriptionOverload(c: TriggerCandidate, ctx: CopyContext): GeneratedCopy | null {
  const count = ctx.subscriptions.filter((s) => s.isActive).length;
  const monthly = ctx.subscriptions
    .filter((s) => s.isActive)
    .reduce((acc, s) => acc + monthlyEqMinor(s), 0);
  const annual = monthly * 12;
  return finalize({
    title: `У вас ${count} активных подписок на ${formatMoney(monthly, ctx.baseCurrency, { compact: true })} в месяц`,
    body: `Это ${formatMoney(annual, ctx.baseCurrency, { compact: true })} в год. Возможно, часть уже не нужна, а часть — очень нужна. Если хотите, мы покажем список по сумме — решать вам.`,
    cta: "Открыть список",
  });
}

// TRIG-04 — dormant subscription
function copyDormantSubscription(c: TriggerCandidate, ctx: CopyContext): GeneratedCopy | null {
  const { subId, daysSince } = c.data as { subId: string; daysSince: number };
  const sub = ctx.subscriptions.find((s) => s.id === subId);
  if (!sub) return null;
  return finalize({
    title: `Подписка ${sub.name} не проявляла активности ${daysSince} дней`,
    body: `Возможно, она всё ещё полезна, а возможно — уже нет. Если захочется пересмотреть, вот она.`,
    cta: "Открыть подписку",
  });
}

// TRIG-05 — budget projection (точь-в-точь пример TZ 9.3 Тип 2)
function copyBudgetProjection(c: TriggerCandidate, ctx: CopyContext): GeneratedCopy | null {
  const { budgetId, currentPercent, projectedPercent } = c.data as {
    budgetId: string;
    currentPercent: number;
    projectedPercent: number;
  };
  const b = ctx.budgets.find((x) => x.id === budgetId);
  if (!b) return null;
  const cat = b.categoryId ? ctx.categories.find((x) => x.id === b.categoryId) : null;
  const name = cat ? cat.name.toLowerCase() : "общий бюджет";
  return finalize({
    title: `На середине месяца бюджет на ${name} прошёл ${Math.round(currentPercent)}%`,
    body: `Если темп сохранится, к концу месяца будет ≈ ${Math.round(projectedPercent)}%. Это ваш месяц, и вы можете захотеть именно этого. Подсказать, если ритм изменится?`,
    cta: "Посмотреть бюджет",
  });
}

// TRIG-06 — goal risk
function copyGoalRisk(c: TriggerCandidate, ctx: CopyContext): GeneratedCopy | null {
  const { goalId, deltaDays, projectedDate } = c.data as {
    goalId: string;
    deltaDays: number;
    projectedDate: string;
  };
  const g = ctx.goals.find((x) => x.id === goalId);
  if (!g) return null;
  return finalize({
    title: `Цель «${g.name}» при текущем темпе — ${dayjs(projectedDate).format("D MMMM")}`,
    body: `Это на ${Math.abs(deltaDays)} дн. позже, чем вы планировали. Не критично, но может быть стоит подумать.`,
    cta: "Открыть цель",
  });
}

// TRIG-07 — savings down
function copySavingsRateDown(c: TriggerCandidate, ctx: CopyContext): GeneratedCopy | null {
  const { current, three_mo_ago } = c.data as { current: number; three_mo_ago: number };
  const delta = (three_mo_ago - current).toFixed(1);
  return finalize({
    title: `Доля накоплений снижалась три месяца подряд`,
    body: `Сейчас ${current.toFixed(1)}%, три месяца назад было около ${three_mo_ago.toFixed(1)}% — разница ${delta} п.п. Иногда это нормально — бывают периоды. Просто чтоб вы видели.`,
  });
}

// TRIG-08 — savings up (positive — точь-в-точь пример TZ 9.3 Тип 4)
function copySavingsRateUp(c: TriggerCandidate, ctx: CopyContext): GeneratedCopy | null {
  const { current, delta } = c.data as { current: number; previous: number; delta: number };
  return finalize({
    title: `В этом месяце вы отложили ${current.toFixed(0)}% от дохода`,
    body: `На ${delta.toFixed(1)} процентных пункта больше, чем в прошлом месяце. Это ваш выбор и ваш результат.`,
  });
}

// TRIG-09 — outlier
function copyOutlier(c: TriggerCandidate, ctx: CopyContext): GeneratedCopy | null {
  const { txnId } = c.data as { txnId: string };
  const t = ctx.transactions.find((x) => x.id === txnId);
  if (!t) return null;
  const cat = ctx.categories.find((x) => x.id === t.categoryId);
  return finalize({
    title: `Крупная операция в категории ${cat?.icon ?? ""} ${cat?.name ?? "—"}`,
    body: `${formatMoney(t.amountBaseMinor, ctx.baseCurrency)} — заметно больше обычного для этой категории. Просто заметили.`,
  });
}

// TRIG-10 — no-spend (positive)
function copyNoSpend(c: TriggerCandidate, ctx: CopyContext): GeneratedCopy | null {
  const { streak } = c.data as { streak: number };
  return finalize({
    title: `${streak} дней без расходов подряд`,
    body: `Иногда пауза — это тоже результат. Без оценок — просто отмечаем.`,
  });
}

// ============================================================
// Utility: monthly equivalent for subscription (дублируется из formulas.ts
// с небольшим изменением чтобы не создавать циклическую зависимость)
// ============================================================
function monthlyEqMinor(sub: Subscription): number {
  switch (sub.frequency) {
    case "weekly":
      return Math.round((sub.amountMinor * 52) / 12);
    case "biweekly":
      return Math.round((sub.amountMinor * 26) / 12);
    case "monthly":
      return sub.amountMinor;
    case "quarterly":
      return Math.round(sub.amountMinor / 3);
    case "semiannual":
      return Math.round(sub.amountMinor / 6);
    case "annual":
      return Math.round(sub.amountMinor / 12);
  }
}
