"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Transaction,
  Category,
  Budget,
  Goal,
  Subscription,
  InsightRecord,
  UserSettings,
  ExchangeRateRecord,
  TxnType,
  RecurrenceFrequency,
} from "@/lib/types";
import { SEED_CATEGORIES } from "@/lib/seed-categories";
import { detectSubscriptions } from "@/lib/formulas";
import type { CurrencyCode } from "@/lib/currency";

const USER_ID = "local-user";

function uid(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

// Курсы по умолчанию (TZ 7.7 MC-03) — ЦБ РФ-style placeholder.
// В Шаге 10 подключим сервис обновления курсов.
const DEFAULT_RATES: ExchangeRateRecord[] = [
  { date: "2026-01-01", from: "USD", to: "RUB", rate: 92.5 },
  { date: "2026-01-01", from: "EUR", to: "RUB", rate: 101.2 },
  { date: "2026-01-01", from: "GBP", to: "RUB", rate: 118.4 },
  { date: "2026-01-01", from: "KZT", to: "RUB", rate: 0.185 },
  { date: "2026-01-01", from: "GEL", to: "RUB", rate: 34.8 },
  { date: "2026-01-01", from: "RUB", to: "USD", rate: 1 / 92.5 },
  { date: "2026-01-01", from: "RUB", to: "EUR", rate: 1 / 101.2 },
];

/** Forward-fill: ищем последний курс на/до даты. TZ 8.5.1. */
export function findRate(
  rates: ExchangeRateRecord[],
  from: CurrencyCode,
  to: CurrencyCode,
  date: string,
): number {
  if (from === to) return 1;
  const matching = rates
    .filter((r) => r.from === from && r.to === to && r.date <= date)
    .sort((a, b) => b.date.localeCompare(a.date));
  return matching[0]?.rate ?? 1;
}

interface DataState {
  settings: UserSettings;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  subscriptions: Subscription[];
  insights: InsightRecord[];
  exchangeRates: ExchangeRateRecord[];

  _hydrated: boolean;

  // Hydration guard
  _setHydrated: (v: boolean) => void;
  seed: () => void;

  // Settings
  updateSettings: (patch: Partial<UserSettings>) => void;
  completeOnboarding: () => void;

  // Categories
  addCategory: (cat: Omit<Category, "id" | "userId">) => Category;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  archiveCategory: (id: string) => void;

  // Transactions
  addTransaction: (
    payload: Omit<
      Transaction,
      "id" | "userId" | "amountBaseMinor" | "createdAt" | "updatedAt" | "deletedAt"
    >,
  ) => Transaction;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  restoreTransaction: (id: string) => void;

  // Budgets
  addBudget: (b: Omit<Budget, "id" | "userId">) => Budget;
  updateBudget: (id: string, patch: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Goals
  addGoal: (g: Omit<Goal, "id" | "userId" | "createdAt" | "currentSavedMinor">) => Goal;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  contributeToGoal: (id: string, amountMinor: number) => void;
  deleteGoal: (id: string) => void;

  // Subscriptions
  refreshSubscriptions: () => void;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;

  // Insights
  addInsight: (i: Omit<InsightRecord, "id" | "userId" | "createdAt">) => InsightRecord;
  rateInsight: (id: string, useful: boolean) => void;
  dismissInsight: (id: string) => void;

  // Utilities
  resetAll: () => void;
}

function convertToBase(
  amountMinor: number,
  from: CurrencyCode,
  to: CurrencyCode,
  date: string,
  rates: ExchangeRateRecord[],
): number {
  if (from === to) return amountMinor;
  const rate = findRate(rates, from, to, date);
  return Math.round(amountMinor * rate);
}

const INITIAL_SETTINGS: UserSettings = {
  id: USER_ID,
  baseCurrency: "RUB",
  locale: "ru-RU",
  theme: "system",
  onboardingCompletedAt: null,
  plan: "free",
  planExpiresAt: null,
  notificationPrefs: {
    weeklyDigest: true,
    pushInsights: true,
    budgetSoftAlert: true,
  },
  insightPrefs: {
    enabledTriggers: {},
  },
};

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      settings: INITIAL_SETTINGS,
      categories: [],
      transactions: [],
      budgets: [],
      goals: [],
      subscriptions: [],
      insights: [],
      exchangeRates: DEFAULT_RATES,
      _hydrated: false,

      _setHydrated: (v) => set({ _hydrated: v }),

      seed: () => {
        const { categories } = get();
        if (categories.length === 0) {
          const seeded: Category[] = SEED_CATEGORIES.map((c) => ({
            ...c,
            id: uid("cat"),
            userId: USER_ID,
          }));
          set({ categories: seeded });
        }
      },

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      completeOnboarding: () =>
        set((s) => ({
          settings: { ...s.settings, onboardingCompletedAt: nowIso() },
        })),

      addCategory: (cat) => {
        const c: Category = { ...cat, id: uid("cat"), userId: USER_ID };
        set((s) => ({ categories: [...s.categories, c] }));
        return c;
      },
      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      archiveCategory: (id) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, isArchived: true } : c,
          ),
        })),

      addTransaction: (payload) => {
        const { exchangeRates, settings } = get();
        const amountBaseMinor = convertToBase(
          payload.amountMinor,
          payload.currency,
          settings.baseCurrency,
          payload.transactionDate,
          exchangeRates,
        );
        const t: Transaction = {
          ...payload,
          amountBaseMinor,
          id: uid("txn"),
          userId: USER_ID,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          deletedAt: null,
        };
        set((s) => ({ transactions: [t, ...s.transactions] }));
        return t;
      },
      updateTransaction: (id, patch) =>
        set((s) => {
          const next = s.transactions.map((t) => {
            if (t.id !== id) return t;
            const merged = { ...t, ...patch, updatedAt: nowIso() };
            // Пересчёт base-amount если сумма/валюта/дата поменялись
            if (
              patch.amountMinor != null ||
              patch.currency != null ||
              patch.transactionDate != null
            ) {
              merged.amountBaseMinor = convertToBase(
                merged.amountMinor,
                merged.currency,
                s.settings.baseCurrency,
                merged.transactionDate,
                s.exchangeRates,
              );
            }
            return merged;
          });
          return { transactions: next };
        }),
      deleteTransaction: (id) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, deletedAt: nowIso() } : t,
          ),
        })),
      restoreTransaction: (id) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, deletedAt: null } : t,
          ),
        })),

      addBudget: (b) => {
        const budget: Budget = { ...b, id: uid("bdg"), userId: USER_ID };
        set((s) => ({ budgets: [...s.budgets, budget] }));
        return budget;
      },
      updateBudget: (id, patch) =>
        set((s) => ({
          budgets: s.budgets.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),
      deleteBudget: (id) =>
        set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),

      addGoal: (g) => {
        const goal: Goal = {
          ...g,
          id: uid("goal"),
          userId: USER_ID,
          currentSavedMinor: 0,
          createdAt: nowIso(),
        };
        set((s) => ({ goals: [...s.goals, goal] }));
        return goal;
      },
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      contributeToGoal: (id, amountMinor) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id
              ? {
                  ...g,
                  currentSavedMinor: g.currentSavedMinor + amountMinor,
                  completedAt:
                    g.currentSavedMinor + amountMinor >= g.targetAmountMinor
                      ? nowIso()
                      : g.completedAt,
                }
              : g,
          ),
        })),
      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      refreshSubscriptions: () => {
        const { transactions, subscriptions: existing, categories } = get();
        const detected = detectSubscriptions(transactions);
        const subsCategory = categories.find(
          (c) => c.name === "Подписки" && c.builtin,
        );
        const next: Subscription[] = detected.map((d) => {
          const prev = existing.find((s) => s.merchantPattern === d.merchantPattern);
          const firstTxn = d.occurrences[0];
          return {
            id: prev?.id ?? uid("sub"),
            userId: USER_ID,
            name: prev?.name ?? capitalize(d.merchantPattern),
            amountMinor: d.medianAmountMinor,
            currency: firstTxn.currency,
            frequency: d.frequency,
            nextBillingDate: d.nextBillingDate,
            merchantPattern: d.merchantPattern,
            isActive: prev?.isActive ?? true,
            categoryId: prev?.categoryId ?? firstTxn.categoryId ?? subsCategory?.id ?? null,
            tag: prev?.tag ?? null,
            lastSeenDate: d.lastDate,
            detectedAt: prev?.detectedAt ?? nowIso(),
          };
        });
        set({ subscriptions: next });
      },
      updateSubscription: (id, patch) =>
        set((s) => ({
          subscriptions: s.subscriptions.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),

      addInsight: (i) => {
        const rec: InsightRecord = {
          ...i,
          id: uid("ins"),
          userId: USER_ID,
          createdAt: nowIso(),
        };
        set((s) => ({ insights: [rec, ...s.insights] }));
        return rec;
      },
      rateInsight: (id, useful) =>
        set((s) => ({
          insights: s.insights.map((x) =>
            x.id === id ? { ...x, interaction: useful ? "useful" : "not_useful" } : x,
          ),
        })),
      dismissInsight: (id) =>
        set((s) => ({
          insights: s.insights.map((x) =>
            x.id === id ? { ...x, dismissedAt: nowIso() } : x,
          ),
        })),

      resetAll: () =>
        set({
          settings: INITIAL_SETTINGS,
          categories: [],
          transactions: [],
          budgets: [],
          goals: [],
          subscriptions: [],
          insights: [],
          exchangeRates: DEFAULT_RATES,
        }),
    }),
    {
      name: "mm-data",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?._setHydrated(true);
        state?.seed();
      },
    },
  ),
);

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Удобный хук для получения категории по id */
export function useCategoryById() {
  const cats = useDataStore((s) => s.categories);
  return (id: string | null) => cats.find((c) => c.id === id) ?? null;
}

// ============================================================
// Demo seed — генератор реалистичных операций для презентации
// ============================================================

export function generateDemoData() {
  const store = useDataStore.getState();
  const { categories, addTransaction, resetAll, seed, addGoal, addBudget } = store;

  // Сбросить и перезасеять категории
  resetAll();
  useDataStore.getState().seed();
  const cats = useDataStore.getState().categories;

  const findCat = (name: string) => cats.find((c) => c.name === name)?.id ?? null;

  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 90);

  const mk = (days: number, type: TxnType, amount: number, desc: string, catName: string, currency: CurrencyCode = "RUB", recurring = false, freq?: RecurrenceFrequency) => {
    const d = new Date(start);
    d.setDate(d.getDate() + days);
    const iso = d.toISOString().slice(0, 10);
    useDataStore.getState().addTransaction({
      type,
      amountMinor: Math.round(amount * 100),
      currency,
      description: desc,
      categoryId: findCat(catName),
      transactionDate: iso,
      tags: [],
      isRecurring: recurring,
      recurrenceFrequency: freq,
    });
  };

  // 3 месяца зарплаты
  for (let m = 0; m < 3; m++) {
    mk(m * 30 + 5, "income", 180_000, "Зарплата ООО «Дизайн»", "Зарплата", "RUB", true, "monthly");
  }
  // Фриланс-подработки
  mk(12, "income", 55_000, "Freelance project", "Фриланс");
  mk(48, "income", 1200, "Upwork payout", "Фриланс", "USD");
  mk(77, "income", 42_000, "Freelance project", "Фриланс");

  // Подписки (для детекции 8.4) — по 3+ повторов
  const subs: Array<[string, number, CurrencyCode, number]> = [
    ["Spotify", 199, "RUB", 30],
    ["Netflix", 799, "RUB", 30],
    ["ChatGPT Plus", 20, "USD", 30],
    ["Figma", 12, "USD", 30],
    ["Notion", 8, "USD", 30],
    ["YouTube Premium", 269, "RUB", 30],
    ["iCloud+", 199, "RUB", 30],
    ["JetBrains", 14.9, "USD", 30],
    ["Cursor", 20, "USD", 30],
    ["Midjourney", 10, "USD", 30],
    ["GitHub", 4, "USD", 30],
  ];
  subs.forEach(([name, amt, cur, period]) => {
    for (let i = 0; i < 3; i++) {
      mk(2 + i * period, "expense", amt, name, "Подписки", cur, true, "monthly");
    }
  });

  // Кофе — много мелких трат
  for (let i = 0; i < 45; i++) {
    const day = 5 + Math.floor(Math.random() * 85);
    const amt = 250 + Math.round(Math.random() * 250);
    mk(day, "expense", amt, ["Espresso Starbucks", "Латте Surf Coffee", "Капучино Double B", "Кофе Cofix"][i % 4], "Кофе и напитки");
  }
  // Еда и рестораны
  for (let i = 0; i < 25; i++) {
    const day = 5 + Math.floor(Math.random() * 85);
    const amt = 700 + Math.round(Math.random() * 2800);
    mk(day, "expense", amt, ["Ужин White Rabbit", "Обед Prime Star", "Доставка Яндекс.Еда", "Ресторан Probka"][i % 4], "Еда и рестораны");
  }
  // Продукты
  for (let i = 0; i < 20; i++) {
    const day = 5 + Math.floor(Math.random() * 85);
    const amt = 1500 + Math.round(Math.random() * 3500);
    mk(day, "expense", amt, ["ВкусВилл", "Перекрёсток", "Яндекс.Лавка"][i % 3], "Продукты");
  }
  // Аренда
  for (let m = 0; m < 3; m++) {
    mk(m * 30 + 1, "expense", 55_000, "Аренда квартиры", "Аренда и ЖКХ", "RUB", true, "monthly");
  }
  // Транспорт
  for (let i = 0; i < 30; i++) {
    const day = 3 + Math.floor(Math.random() * 85);
    const amt = 150 + Math.round(Math.random() * 600);
    mk(day, "expense", amt, ["Яндекс.Такси", "Метро Тройка", "Каршеринг"][i % 3], "Транспорт");
  }
  // Развлечения / одежда / путешествия
  mk(23, "expense", 4200, "Кинотеатр Москва", "Развлечения");
  mk(44, "expense", 18_500, "Zara Russia", "Одежда");
  mk(62, "expense", 85_000, "Билеты в Грузию", "Путешествия");
  mk(81, "expense", 650, "Concert ticket", "Развлечения", "USD");

  // Цель накоплений
  const targetDate = new Date(today);
  targetDate.setMonth(targetDate.getMonth() + 4);
  addGoal({
    name: "Отпуск в Грузию",
    targetAmountMinor: 120_000 * 100,
    currency: "RUB",
    targetDate: targetDate.toISOString().slice(0, 10),
    linkedCategoryId: findCat("Путешествия"),
    icon: "🏖️",
  });

  // Бюджеты
  const foodCat = findCat("Еда и рестораны");
  if (foodCat) addBudget({ categoryId: foodCat, periodType: "month", amountMinor: 25_000 * 100, currency: "RUB", rollover: false, startDate: today.toISOString().slice(0, 10) });
  const coffeeCat = findCat("Кофе и напитки");
  if (coffeeCat) addBudget({ categoryId: coffeeCat, periodType: "month", amountMinor: 10_000 * 100, currency: "RUB", rollover: false, startDate: today.toISOString().slice(0, 10) });

  useDataStore.getState().refreshSubscriptions();
}
