import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Repeat,
  Wallet,
  Settings,
} from "lucide-react";

/**
 * Навигация верхнего уровня (TZ 6.1).
 * Все разделы MUST для MVP.
 */
export type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  description?: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/app",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Главная сводка",
  },
  {
    href: "/app/transactions",
    label: "Операции",
    icon: Receipt,
    description: "Все доходы и расходы",
  },
  {
    href: "/app/insights",
    label: "Аналитика",
    icon: PieChart,
    description: "Паттерны и потоки",
  },
  {
    href: "/app/goals",
    label: "Цели",
    icon: Target,
    description: "Накопления",
  },
  {
    href: "/app/subscriptions",
    label: "Подписки",
    icon: Repeat,
    description: "Регулярные платежи",
  },
  {
    href: "/app/budgets",
    label: "Бюджеты",
    icon: Wallet,
    description: "Мягкие лимиты",
  },
  {
    href: "/app/settings",
    label: "Настройки",
    icon: Settings,
    description: "Профиль и данные",
  },
];

export const PERIOD_OPTIONS = [
  { value: "day", label: "День" },
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" },
  { value: "quarter", label: "Квартал" },
  { value: "year", label: "Год" },
  { value: "all", label: "За всё время" },
] as const;

export type PeriodKey = (typeof PERIOD_OPTIONS)[number]["value"];
