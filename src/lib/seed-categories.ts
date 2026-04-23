import type { Category } from "./types";

/**
 * Встроенные категории MVP (TZ 7.3 CAT-01).
 * Палитра warm-editorial: clay / sage / ochre / plum / teal / storm.
 * Гармонирует с cream фоном и hunter-green primary.
 */
export const SEED_CATEGORIES: Omit<Category, "id" | "userId">[] = [
  { name: "Еда и рестораны", icon: "🍽️", color: "#B8765B", kind: "expense", parentId: null, isArchived: false, sortOrder: 10, builtin: true },
  { name: "Продукты", icon: "🛒", color: "#7FA680", kind: "expense", parentId: null, isArchived: false, sortOrder: 20, builtin: true },
  { name: "Кофе и напитки", icon: "☕", color: "#8A7052", kind: "expense", parentId: null, isArchived: false, sortOrder: 30, builtin: true },
  { name: "Транспорт", icon: "🚕", color: "#6B82A6", kind: "expense", parentId: null, isArchived: false, sortOrder: 40, builtin: true },
  { name: "Аренда и ЖКХ", icon: "🏠", color: "#3E6B55", kind: "expense", parentId: null, isArchived: false, sortOrder: 50, builtin: true },
  { name: "Подписки", icon: "📺", color: "#8A6FA6", kind: "expense", parentId: null, isArchived: false, sortOrder: 60, builtin: true },
  { name: "Развлечения", icon: "🎭", color: "#C89AA7", kind: "expense", parentId: null, isArchived: false, sortOrder: 70, builtin: true },
  { name: "Одежда", icon: "👗", color: "#A04E33", kind: "expense", parentId: null, isArchived: false, sortOrder: 80, builtin: true },
  { name: "Красота и здоровье", icon: "💆", color: "#A68CB8", kind: "expense", parentId: null, isArchived: false, sortOrder: 90, builtin: true },
  { name: "Образование", icon: "📚", color: "#3E8B7A", kind: "expense", parentId: null, isArchived: false, sortOrder: 100, builtin: true },
  { name: "Путешествия", icon: "✈️", color: "#4C6BA3", kind: "expense", parentId: null, isArchived: false, sortOrder: 110, builtin: true },
  { name: "Подарки", icon: "🎁", color: "#D4A73E", kind: "expense", parentId: null, isArchived: false, sortOrder: 120, builtin: true },
  { name: "Переводы", icon: "↔️", color: "#9B918A", kind: "both", parentId: null, isArchived: false, sortOrder: 130, builtin: true },
  { name: "Инвестиции", icon: "📈", color: "#8A8536", kind: "both", parentId: null, isArchived: false, sortOrder: 140, builtin: true },
  { name: "Налоги", icon: "🧾", color: "#7A7269", kind: "expense", parentId: null, isArchived: false, sortOrder: 150, builtin: true },
  { name: "Долги и кредиты", icon: "💳", color: "#9B5E4A", kind: "expense", parentId: null, isArchived: false, sortOrder: 160, builtin: true },
  { name: "Спорт", icon: "🏃", color: "#6B8A6B", kind: "expense", parentId: null, isArchived: false, sortOrder: 170, builtin: true },
  { name: "Электроника", icon: "💻", color: "#556B8A", kind: "expense", parentId: null, isArchived: false, sortOrder: 180, builtin: true },
  { name: "Дом", icon: "🛋️", color: "#A88871", kind: "expense", parentId: null, isArchived: false, sortOrder: 190, builtin: true },
  { name: "Прочее", icon: "✨", color: "#9B918A", kind: "expense", parentId: null, isArchived: false, sortOrder: 999, builtin: true },
  // Income
  { name: "Зарплата", icon: "💼", color: "#3E6B55", kind: "income", parentId: null, isArchived: false, sortOrder: 1000, builtin: true },
  { name: "Фриланс", icon: "💻", color: "#D4A73E", kind: "income", parentId: null, isArchived: false, sortOrder: 1010, builtin: true },
  { name: "Инвест. доход", icon: "📊", color: "#8A8536", kind: "income", parentId: null, isArchived: false, sortOrder: 1020, builtin: true },
  { name: "Подарки / другое", icon: "🎊", color: "#C89AA7", kind: "income", parentId: null, isArchived: false, sortOrder: 1030, builtin: true },
];
