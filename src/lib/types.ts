/**
 * Domain types (TZ 10.3 ERD).
 * Все суммы хранятся в minor units как integer (TZ 8.1).
 */
import type { CurrencyCode } from "./currency";

export type TxnType = "expense" | "income" | "transfer";

export type RecurrenceFrequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "semiannual" | "annual";

export interface Transaction {
  id: string;
  userId: string;
  type: TxnType;
  /** Сумма в minor units оригинальной валюты */
  amountMinor: number;
  currency: CurrencyCode;
  /** Конвертировано в base_currency пользователя по курсу даты транзакции */
  amountBaseMinor: number;
  description: string;
  categoryId: string | null;
  /** ISO date yyyy-mm-dd */
  transactionDate: string;
  tags: string[];
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  subscriptionId?: string | null;
  parentTransactionId?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string; // emoji or lucide name
  color: string;
  parentId: string | null;
  isArchived: boolean;
  sortOrder: number;
  builtin?: boolean;
  kind: "expense" | "income" | "both";
}

export type BudgetPeriodType = "week" | "month" | "quarter";

export interface Budget {
  id: string;
  userId: string;
  /** null = overall budget */
  categoryId: string | null;
  periodType: BudgetPeriodType;
  amountMinor: number;
  currency: CurrencyCode;
  rollover: boolean;
  /** ISO date */
  startDate: string;
  name?: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmountMinor: number;
  currency: CurrencyCode;
  currentSavedMinor: number;
  /** ISO date */
  targetDate: string;
  linkedCategoryId: string | null;
  icon: string;
  completedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amountMinor: number;
  currency: CurrencyCode;
  frequency: RecurrenceFrequency;
  /** ISO date */
  nextBillingDate: string;
  /** нормализованный паттерн описания */
  merchantPattern: string;
  isActive: boolean;
  categoryId: string | null;
  tag?: "must-have" | "nice-to-have" | null;
  lastSeenDate: string;
  detectedAt: string;
}

export interface InsightRecord {
  id: string;
  userId: string;
  type: "pattern" | "trajectory" | "subscription" | "goal" | "positive";
  severity: "info" | "attention";
  triggerId: string; // TRIG-01..10
  title: string;
  body: string;
  cta?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  interaction?: "useful" | "not_useful";
  dismissedAt?: string | null;
}

export interface UserSettings {
  id: string;
  email?: string;
  baseCurrency: CurrencyCode;
  locale: "ru-RU" | "en-US";
  theme: "light" | "dark" | "system";
  onboardingCompletedAt?: string | null;
  plan: "free" | "pro";
  planExpiresAt?: string | null;
  notificationPrefs: {
    weeklyDigest: boolean;
    pushInsights: boolean;
    budgetSoftAlert: boolean;
  };
  insightPrefs: {
    enabledTriggers: Record<string, boolean>;
  };
}

export interface ExchangeRateRecord {
  date: string; // yyyy-mm-dd
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
}
