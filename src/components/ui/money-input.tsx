"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { CURRENCIES, type CurrencyCode, toMinor } from "@/lib/currency";

/**
 * MoneyInput (TZ 4.6, 7.2 TXN-14).
 * — Live-форматирование с пробелами-разделителями тысяч
 * — Курсор сохраняет позицию при форматировании
 * — Кастомный выпадающий выбор валюты через Popover (Radix)
 * — Плавные анимации focus-ring и пикера
 */
export interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "size"> {
  valueMinor?: number | null;
  currency?: CurrencyCode;
  availableCurrencies?: CurrencyCode[];
  onValueChange?: (minor: number | null, currency: CurrencyCode) => void;
  onCurrencyChange?: (c: CurrencyCode) => void;
  autoFocus?: boolean;
  size?: "md" | "lg";
}

const THIN_SPACE = "\u202F"; // NARROW NO-BREAK SPACE — для группировки

function pureDigitsBefore(str: string, cursor: number): number {
  let count = 0;
  for (let i = 0; i < Math.min(cursor, str.length); i++) {
    if (/[\d]/.test(str[i])) count++;
  }
  return count;
}

function restoreCursor(formatted: string, targetDigits: number): number {
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (seen >= targetDigits) return i;
    if (/[\d]/.test(formatted[i])) seen++;
  }
  return formatted.length;
}

/** Форматирование: "12345.6" → "12 345,6"; "1234567" → "1 234 567"; поддерживает минус. */
function liveFormat(raw: string): { display: string; minor: number | null } {
  if (!raw) return { display: "", minor: null };

  // Разрешаем только цифры, точку, запятую, минус, пробелы (NBSP тоже).
  const stripped = raw.replace(/[^\d,.\-]/g, "");
  if (!stripped) return { display: "", minor: null };

  // Выделяем знак.
  const negative = stripped.startsWith("-");
  let body = stripped.replace(/-/g, "");

  // Нормализуем разделитель: и «,», и «.» в одну точку.
  // Пользователь может ввести только один разделитель.
  const firstSep = body.search(/[.,]/);
  if (firstSep !== -1) {
    const intPart = body.slice(0, firstSep).replace(/[.,]/g, "");
    const fracPart = body.slice(firstSep + 1).replace(/[.,]/g, "").slice(0, 2);
    body = fracPart.length ? `${intPart}.${fracPart}` : `${intPart}.`;
  }

  // Разбиваем на int/frac
  const hasDot = body.includes(".");
  const [intRaw, fracRaw = ""] = body.split(".");
  const intClean = (intRaw || "0").replace(/^0+(?=\d)/, ""); // убираем ведущие нули кроме одинокого

  // Форматируем int с thin-space группами по 3
  const grouped = intClean.replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE);

  const display =
    (negative ? "−" : "") +
    grouped +
    (hasDot ? "," + fracRaw : "");

  // Минорные единицы
  if (!intClean && !fracRaw) return { display, minor: null };
  const parsed = Number(
    (negative ? "-" : "") + intClean + (fracRaw ? "." + fracRaw.padEnd(2, "0") : ""),
  );
  if (Number.isNaN(parsed)) return { display, minor: null };
  return { display, minor: Math.round(parsed * 100) };
}

/** Форматирование из minor units (для начального заполнения и blur). */
function formatFromMinor(minor: number, currency: CurrencyCode): string {
  const digits = CURRENCIES[currency].minorDigits;
  const major = minor / 10 ** digits;
  const parts = Math.abs(major).toFixed(digits).split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE);
  const sign = major < 0 ? "−" : "";
  return digits > 0 && parts[1] !== undefined ? `${sign}${intPart},${parts[1]}` : `${sign}${intPart}`;
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
      size = "md",
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const [text, setText] = React.useState<string>(() =>
      valueMinor != null ? formatFromMinor(valueMinor, currency) : "",
    );
    const [focused, setFocused] = React.useState(false);

    // Синхронизация text из внешнего valueMinor (но не во время фокуса,
    // чтобы не прерывать ввод)
    React.useEffect(() => {
      if (focused) return;
      if (valueMinor == null) {
        setText("");
        return;
      }
      setText(formatFromMinor(valueMinor, currency));
    }, [valueMinor, currency, focused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const raw = input.value;
      const cursorBefore = input.selectionStart ?? raw.length;
      const digitsBefore = pureDigitsBefore(raw, cursorBefore);

      const { display, minor } = liveFormat(raw);
      setText(display);
      onValueChange?.(minor, currency);

      // После ре-рендера — восстановим позицию курсора
      requestAnimationFrame(() => {
        if (!inputRef.current) return;
        const pos = restoreCursor(display, digitsBefore);
        try {
          inputRef.current.setSelectionRange(pos, pos);
        } catch {}
      });
    };

    const handleBlur = () => {
      setFocused(false);
      if (valueMinor != null) {
        setText(formatFromMinor(valueMinor, currency));
      }
    };

    const sizing =
      size === "lg"
        ? "h-[60px] text-[24px] sm:text-[28px]"
        : "h-[52px] text-[20px] sm:text-[22px]";

    return (
      <motion.div
        animate={{
          borderColor: focused ? "var(--accent-primary)" : "var(--border-strong)",
          boxShadow: focused
            ? "0 0 0 4px var(--accent-primary-soft)"
            : "0 0 0 0px transparent",
        }}
        transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
        className={cn(
          "flex items-stretch overflow-hidden rounded-2xl border bg-[var(--surface-1)]",
          className,
        )}
        style={{ borderColor: "var(--border-strong)" }}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFocus}
          value={text}
          onChange={handleChange}
          onFocus={(e) => {
            setFocused(true);
            if (valueMinor != null) e.target.select();
          }}
          onBlur={handleBlur}
          placeholder="0"
          className={cn(
            "tabular flex-1 bg-transparent px-4 sm:px-5 font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none min-w-0",
            sizing,
          )}
          {...props}
        />

        <CurrencyPicker
          current={currency}
          options={availableCurrencies}
          onSelect={(c) => onCurrencyChange?.(c)}
          size={size}
        />
      </motion.div>
    );
  },
);
MoneyInput.displayName = "MoneyInput";

function CurrencyPicker({
  current,
  options,
  onSelect,
  size,
}: {
  current: CurrencyCode;
  options: CurrencyCode[];
  onSelect: (c: CurrencyCode) => void;
  size: "md" | "lg";
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Валюта"
          className={cn(
            "group tabular inline-flex shrink-0 items-center gap-1 border-l border-[var(--border-subtle)] bg-[var(--surface-2)] pl-3 pr-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary-soft)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
            size === "lg" ? "text-base" : "text-[13px]",
          )}
        >
          <span className="font-semibold">{CURRENCIES[current].symbol}</span>
          <span className="text-[10px] font-medium text-[var(--text-tertiary)]">{current}</span>
          <ChevronDown
            className="size-3 transition-transform group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="glass-strong z-50 flex min-w-[200px] flex-col gap-0.5 rounded-2xl p-1.5 shadow-xl"
          asChild
        >
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
          >
            {options.map((c) => {
              const active = c === current;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    onSelect(c);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors",
                    active
                      ? "bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]"
                      : "hover:bg-[var(--surface-2)]",
                  )}
                >
                  <span className="tabular w-4 font-semibold">{CURRENCIES[c].symbol}</span>
                  <span className="flex-1">
                    <span className="font-medium">{c}</span>
                    <span className="ml-2 text-[11px] text-[var(--text-tertiary)]">
                      {CURRENCIES[c].name}
                    </span>
                  </span>
                  {active && <Check className="size-4" aria-hidden />}
                </button>
              );
            })}
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
