"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DatePicker — Apple-style календарь в Popover.
 * Триггер: pill с датой. Поповер: month-grid 7×6, навигация по месяцам,
 * плавная анимация при смене месяца.
 */
export interface DatePickerProps {
  value: string; // yyyy-mm-dd
  onChange: (iso: string) => void;
  className?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
}

const WEEKDAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS_RU = [
  "январь", "февраль", "март", "апрель", "май", "июнь",
  "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
];
const MONTHS_RU_GENITIVE = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildMonthGrid(reference: Date): Date[] {
  // Возвращаем 42 дня (6 строк × 7), начиная с понедельника недели,
  // в которой 1-е число месяца.
  const first = startOfMonth(reference);
  const dayOfWeek = (first.getDay() + 6) % 7; // Mon=0
  const start = new Date(first);
  start.setDate(first.getDate() - dayOfWeek);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function DatePicker({
  value,
  onChange,
  className,
  disabled,
  min,
  max,
}: DatePickerProps) {
  const selected = React.useMemo(() => fromISO(value), [value]);
  const [open, setOpen] = React.useState(false);
  const [viewMonth, setViewMonth] = React.useState<Date>(startOfMonth(selected));
  const [direction, setDirection] = React.useState<1 | -1>(1);

  React.useEffect(() => {
    if (open) setViewMonth(startOfMonth(selected));
  }, [open, selected]);

  const today = React.useMemo(() => new Date(), []);
  const days = React.useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const minDate = min ? fromISO(min) : null;
  const maxDate = max ? fromISO(max) : null;

  const goPrev = () => {
    setDirection(-1);
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  };
  const goNext = () => {
    setDirection(1);
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  };

  const formatTrigger = (d: Date) => {
    const sameYear = d.getFullYear() === today.getFullYear();
    return sameYear
      ? `${d.getDate()} ${MONTHS_RU_GENITIVE[d.getMonth()]}`
      : `${d.getDate()} ${MONTHS_RU_GENITIVE[d.getMonth()]} ${d.getFullYear()}`;
  };

  const isToday = (d: Date) => isSameDay(d, today);
  const isSelected = (d: Date) => isSameDay(d, selected);
  const isOtherMonth = (d: Date) => d.getMonth() !== viewMonth.getMonth();
  const isDisabled = (d: Date) =>
    (minDate ? d < minDate : false) || (maxDate ? d > maxDate : false);

  const monthKey = `${viewMonth.getFullYear()}-${viewMonth.getMonth()}`;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "tabular group inline-flex h-11 w-full items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] px-3 text-sm text-[var(--text-primary)]",
            "transition-all duration-150 ease-[var(--ease-out-standard)]",
            "hover:border-[var(--accent-primary)]",
            "data-[state=open]:border-[var(--accent-primary)] data-[state=open]:ring-4 data-[state=open]:ring-[var(--accent-primary-soft)]",
            "focus:outline-none focus-visible:border-[var(--accent-primary)] focus-visible:ring-4 focus-visible:ring-[var(--accent-primary-soft)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <CalendarIcon className="size-4 text-[var(--text-tertiary)]" aria-hidden />
          <span className="flex-1 text-left">{formatTrigger(selected)}</span>
          {isSameDay(selected, today) && (
            <span className="rounded-full bg-[var(--accent-primary-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-primary)]">
              сегодня
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="glass-strong z-50 w-[296px] rounded-2xl p-3 shadow-2xl"
          asChild
        >
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.33, 1, 0.68, 1] }}
          >
            {/* Header */}
            <div className="mb-2 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Предыдущий месяц"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--accent-primary-soft)] hover:text-[var(--accent-primary)] transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="flex items-center gap-1.5 text-[14px] font-semibold tracking-tight">
                <span className="capitalize">{MONTHS_RU[viewMonth.getMonth()]}</span>
                <span className="text-[var(--text-tertiary)]">{viewMonth.getFullYear()}</span>
              </div>
              <button
                type="button"
                onClick={goNext}
                aria-label="Следующий месяц"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--accent-primary-soft)] hover:text-[var(--accent-primary)] transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="mb-1 grid grid-cols-7 gap-1 px-0.5">
              {WEEKDAYS_RU.map((wd, i) => (
                <div
                  key={wd}
                  className={cn(
                    "flex h-7 items-center justify-center text-[10.5px] font-medium uppercase tracking-wider",
                    i >= 5 ? "text-[var(--accent-primary)]" : "text-[var(--text-tertiary)]",
                  )}
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Day grid with sliding animation between months */}
            <div className="relative h-[228px] overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.div
                  key={monthKey}
                  custom={direction}
                  initial={{ x: direction * 24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -direction * 24, opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.33, 1, 0.68, 1] }}
                  className="absolute inset-0 grid grid-cols-7 grid-rows-6 gap-1 px-0.5"
                >
                  {days.map((d) => {
                    const sel = isSelected(d);
                    const tod = isToday(d);
                    const other = isOtherMonth(d);
                    const dis = isDisabled(d);
                    return (
                      <button
                        key={d.toISOString()}
                        type="button"
                        disabled={dis}
                        onClick={() => {
                          onChange(toISO(d));
                          setOpen(false);
                        }}
                        className={cn(
                          "tabular relative flex h-9 items-center justify-center rounded-full text-[13px] font-medium transition-colors",
                          dis && "cursor-not-allowed opacity-30",
                          !sel && other && "text-[var(--text-tertiary)] opacity-50",
                          !sel && !other && "text-[var(--text-primary)]",
                          !sel && !dis && "hover:bg-[var(--accent-primary-soft)]",
                          tod && !sel && "ring-1 ring-[var(--accent-primary)] ring-inset",
                          sel && "text-white",
                        )}
                      >
                        {sel && (
                          <motion.span
                            layoutId="datepicker-selected"
                            className="absolute inset-0 rounded-full"
                            style={{
                              background:
                                "linear-gradient(135deg, var(--accent-primary), color-mix(in oklab, var(--accent-primary) 60%, var(--accent-mint)))",
                              boxShadow:
                                "0 4px 12px color-mix(in oklab, var(--accent-primary) 35%, transparent)",
                            }}
                            transition={{ type: "spring", stiffness: 320, damping: 28 }}
                          />
                        )}
                        <span className="relative">{d.getDate()}</span>
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer with quick today */}
            <div className="mt-2 flex items-center justify-between border-t border-[var(--border-subtle)] pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange(toISO(today));
                  setOpen(false);
                }}
                className="rounded-lg px-2.5 py-1 text-[12px] font-medium text-[var(--accent-primary)] hover:bg-[var(--accent-primary-soft)] transition-colors"
              >
                Сегодня
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2.5 py-1 text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
