"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CURRENCIES, type CurrencyCode, formatNumber, toMinor } from "@/lib/currency";

/**
 * MoneyInput — спец. input для ввода сумм с форматированием
 * и выбором валюты (TZ 4.6, TZ 7.2 TXN-14).
 */
export interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  valueMinor?: number | null;
  currency?: CurrencyCode;
  availableCurrencies?: CurrencyCode[];
  onValueChange?: (minor: number | null, currency: CurrencyCode) => void;
  onCurrencyChange?: (c: CurrencyCode) => void;
  autoFocus?: boolean;
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    {
      valueMinor,
      currency = "RUB",
      availableCurrencies = ["RUB", "USD", "EUR"],
      onValueChange,
      onCurrencyChange,
      className,
      autoFocus,
      ...props
    },
    ref,
  ) => {
    const [text, setText] = React.useState<string>(
      valueMinor != null ? formatNumber(valueMinor, currency) : "",
    );

    // Синхронизация при внешнем изменении
    React.useEffect(() => {
      if (valueMinor == null) {
        setText("");
        return;
      }
      setText(formatNumber(valueMinor, currency));
    }, [valueMinor, currency]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // live visual: разрешаем только цифры, точку, запятую, пробелы, минус в начале
      const allowed = raw.replace(/[^\d,.\-\s]/g, "");
      setText(allowed);

      // попытка распарсить в minor
      const cleaned = allowed.replace(/\s/g, "");
      if (!cleaned || cleaned === "-" || cleaned === "." || cleaned === ",") {
        onValueChange?.(null, currency);
        return;
      }
      const normalized = cleaned.replace(",", ".");
      const num = Number(normalized);
      if (Number.isNaN(num)) {
        onValueChange?.(null, currency);
        return;
      }
      onValueChange?.(toMinor(num, currency), currency);
    };

    const handleBlur = () => {
      if (valueMinor != null) {
        setText(formatNumber(valueMinor, currency));
      }
    };

    return (
      <div
        className={cn(
          "flex items-stretch gap-0 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-1)]",
          "focus-within:border-[var(--accent-primary)] focus-within:ring-4 focus-within:ring-[var(--accent-primary-soft)]",
          "transition-all duration-150",
          className,
        )}
      >
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFocus}
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0,00"
          className="tabular flex-1 bg-transparent px-5 py-4 text-[22px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
          {...props}
        />
        <select
          value={currency}
          onChange={(e) => onCurrencyChange?.(e.target.value as CurrencyCode)}
          className="cursor-pointer rounded-r-2xl border-l border-[var(--border-subtle)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--text-secondary)] focus:outline-none"
          aria-label="Валюта"
        >
          {availableCurrencies.map((c) => (
            <option key={c} value={c}>
              {CURRENCIES[c].symbol} {c}
            </option>
          ))}
        </select>
      </div>
    );
  },
);
MoneyInput.displayName = "MoneyInput";
