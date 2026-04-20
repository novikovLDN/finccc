"use client";

import * as React from "react";
import { Search, Bell, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { PERIOD_OPTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useShellStore } from "@/components/shell/store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * TopBar (TZ 6.2): выбор периода, поиск, notification center.
 */
export function TopBar({ onOpenPalette }: { onOpenPalette?: () => void }) {
  const period = useShellStore((s) => s.period);
  const setPeriod = useShellStore((s) => s.setPeriod);
  const toggleFeed = useShellStore((s) => s.toggleInsightFeed);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 px-4 md:px-6 backdrop-blur-xl bg-[color-mix(in_oklab,var(--bg-primary)_70%,transparent)]">
      <div
        role="tablist"
        aria-label="Период"
        className="glass hidden md:flex items-center gap-0.5 rounded-full p-1"
      >
        {PERIOD_OPTIONS.map((opt) => {
          const active = opt.value === period;
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={active}
              onClick={() => setPeriod(opt.value)}
              className={cn(
                "relative h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors",
                active ? "text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              )}
            >
              {active && (
                <motion.span
                  layoutId="period-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--accent-primary)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div className="md:hidden w-[140px]">
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger size="sm" aria-label="Период">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onOpenPalette}
          className="glass hidden md:flex h-9 w-[240px] items-center gap-2 rounded-full px-3 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          aria-label="Быстрый поиск"
        >
          <Search className="size-4" aria-hidden />
          <span>Найти операцию или раздел</span>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
            <kbd className="rounded border border-[var(--border-strong)] bg-[var(--surface-1)] px-1.5 py-0.5">
              ⌘
            </kbd>
            <kbd className="rounded border border-[var(--border-strong)] bg-[var(--surface-1)] px-1.5 py-0.5">
              K
            </kbd>
          </span>
        </button>

        <Button variant="icon" size="icon" aria-label="Уведомления">
          <Bell className="size-[18px]" />
        </Button>
        <Button
          variant="icon"
          size="icon"
          aria-label="Лента инсайтов"
          onClick={toggleFeed}
        >
          <Sparkles className="size-[18px]" />
        </Button>
      </div>
    </header>
  );
}
