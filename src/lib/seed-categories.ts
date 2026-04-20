import type { Category } from "./types";

/**
 * Встроенные категории MVP (TZ 7.3 CAT-01).
 * 20 шт. Иконки — эмодзи (не загрязняют bundle). Цвета согласованы с
 * палитрой (TZ 4.2): accent-primary/mint/sky/peach + нейтральные
 * вариации. Никакого красного.
 */
export const SEED_CATEGORIES: Omit<Category, "id" | "userId">[] = [
  { name: "Еда и рестораны", icon: "🍽️", color: "#A5B4FC", kind: "expense", parentId: null, isArchived: false, sortOrder: 10, builtin: true },
  { name: "Продукты", icon: "🛒", color: "#4ECDC4", kind: "expense", parentId: null, isArchived: false, sortOrder: 20, builtin: true },
  { name: "Кофе и напитки", icon: "☕", color: "#C4A78B", kind: "expense", parentId: null, isArchived: false, sortOrder: 30, builtin: true },
  { name: "Транспорт", icon: "🚕", color: "#7C6FE8", kind: "expense", parentId: null, isArchived: false, sortOrder: 40, builtin: true },
  { name: "Аренда и ЖКХ", icon: "🏠", color: "#8B90E8", kind: "expense", parentId: null, isArchived: false, sortOrder: 50, builtin: true },
  { name: "Подписки", icon: "📺", color: "#A78BFA", kind: "expense", parentId: null, isArchived: false, sortOrder: 60, builtin: true },
  { name: "Развлечения", icon: "🎭", color: "#93C5FD", kind: "expense", parentId: null, isArchived: false, sortOrder: 70, builtin: true },
  { name: "Одежда", icon: "👗", color: "#FFB4A2", kind: "expense", parentId: null, isArchived: false, sortOrder: 80, builtin: true },
  { name: "Красота и здоровье", icon: "💆", color: "#F0A8C0", kind: "expense", parentId: null, isArchived: false, sortOrder: 90, builtin: true },
  { name: "Образование", icon: "📚", color: "#8BBEA7", kind: "expense", parentId: null, isArchived: false, sortOrder: 100, builtin: true },
  { name: "Путешествия", icon: "✈️", color: "#5EEAD4", kind: "expense", parentId: null, isArchived: false, sortOrder: 110, builtin: true },
  { name: "Подарки", icon: "🎁", color: "#FDBA74", kind: "expense", parentId: null, isArchived: false, sortOrder: 120, builtin: true },
  { name: "Переводы", icon: "↔️", color: "#A1A1AA", kind: "both", parentId: null, isArchived: false, sortOrder: 130, builtin: true },
  { name: "Инвестиции", icon: "📈", color: "#4ECDC4", kind: "both", parentId: null, isArchived: false, sortOrder: 140, builtin: true },
  { name: "Налоги", icon: "🧾", color: "#9CA3AF", kind: "expense", parentId: null, isArchived: false, sortOrder: 150, builtin: true },
  { name: "Долги и кредиты", icon: "💳", color: "#B8A5E8", kind: "expense", parentId: null, isArchived: false, sortOrder: 160, builtin: true },
  { name: "Спорт", icon: "🏃", color: "#6EE7B7", kind: "expense", parentId: null, isArchived: false, sortOrder: 170, builtin: true },
  { name: "Электроника", icon: "💻", color: "#7C6FE8", kind: "expense", parentId: null, isArchived: false, sortOrder: 180, builtin: true },
  { name: "Дом", icon: "🛋️", color: "#D4B896", kind: "expense", parentId: null, isArchived: false, sortOrder: 190, builtin: true },
  { name: "Прочее", icon: "✨", color: "#9CA3AF", kind: "expense", parentId: null, isArchived: false, sortOrder: 999, builtin: true },
  // Income-категории
  { name: "Зарплата", icon: "💼", color: "#4ECDC4", kind: "income", parentId: null, isArchived: false, sortOrder: 1000, builtin: true },
  { name: "Фриланс", icon: "💻", color: "#5EEAD4", kind: "income", parentId: null, isArchived: false, sortOrder: 1010, builtin: true },
  { name: "Инвест. доход", icon: "📊", color: "#A5B4FC", kind: "income", parentId: null, isArchived: false, sortOrder: 1020, builtin: true },
  { name: "Подарки / другое", icon: "🎊", color: "#93C5FD", kind: "income", parentId: null, isArchived: false, sortOrder: 1030, builtin: true },
];
