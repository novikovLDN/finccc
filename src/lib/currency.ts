/**
 * Currency utilities (TZ 8.1, 10.3).
 * Все суммы хранятся в minor units (копейки, центы) как целые числа
 * для исключения проблем с плавающей точкой.
 */

export type CurrencyCode = "RUB" | "USD" | "EUR" | "GBP" | "KZT" | "BYN" | "AMD" | "GEL";

export const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string; minorDigits: number }> = {
  RUB: { symbol: "₽", name: "Рубль", minorDigits: 2 },
  USD: { symbol: "$", name: "Доллар", minorDigits: 2 },
  EUR: { symbol: "€", name: "Евро", minorDigits: 2 },
  GBP: { symbol: "£", name: "Фунт", minorDigits: 2 },
  KZT: { symbol: "₸", name: "Тенге", minorDigits: 2 },
  BYN: { symbol: "Br", name: "Белорусский рубль", minorDigits: 2 },
  AMD: { symbol: "֏", name: "Драм", minorDigits: 2 },
  GEL: { symbol: "₾", name: "Лари", minorDigits: 2 },
};

const DEFAULT_LOCALE = "ru-RU";

/** Convert major → minor (1 250.55 RUB → 125055) */
export function toMinor(amountMajor: number, currency: CurrencyCode = "RUB"): number {
  const digits = CURRENCIES[currency].minorDigits;
  return Math.round(amountMajor * 10 ** digits);
}

/** Convert minor → major (125055 → 1250.55) */
export function toMajor(amountMinor: number, currency: CurrencyCode = "RUB"): number {
  const digits = CURRENCIES[currency].minorDigits;
  return amountMinor / 10 ** digits;
}

/** Format minor units for display: 125055 + RUB → "1 250,55 ₽" */
export function formatMoney(
  amountMinor: number,
  currency: CurrencyCode = "RUB",
  opts: { locale?: string; compact?: boolean; signDisplay?: "auto" | "never" | "always" } = {},
): string {
  const { locale = DEFAULT_LOCALE, compact = false, signDisplay = "auto" } = opts;
  const digits = CURRENCIES[currency].minorDigits;
  const major = amountMinor / 10 ** digits;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: compact ? 0 : digits,
      maximumFractionDigits: digits,
      notation: compact ? "compact" : "standard",
      signDisplay,
    }).format(major);
  } catch {
    return `${major.toFixed(digits)} ${CURRENCIES[currency].symbol}`;
  }
}

/** Короткая форма числа без валюты: 125055 минорных → "1 250,55" */
export function formatNumber(amountMinor: number, currency: CurrencyCode = "RUB"): string {
  const digits = CURRENCIES[currency].minorDigits;
  const major = amountMinor / 10 ** digits;
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(major);
}

/** Parse user input "1 250,55" or "1,250.55" or "1250.55" → minor units */
export function parseMoneyInput(raw: string, currency: CurrencyCode = "RUB"): number | null {
  if (!raw.trim()) return null;
  const cleaned = raw
    .replace(/\s/g, "")
    .replace(/[^\d,.\-]/g, "")
    .replace(/(\d),(\d{1,2})$/, "$1.$2")
    .replace(/,/g, "");
  const parsed = Number(cleaned);
  if (Number.isNaN(parsed)) return null;
  return toMinor(parsed, currency);
}
