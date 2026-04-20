"use client";

import * as React from "react";
import { Search, Bell, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { PERIOD_OPTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useShellStore } from "@/components/shell/store";
import { Button } from "@/components/ui/button";

/**
 * TopBar (TZ 6.2): выбор периода, поиск, центр уведомлений.
 * Mobile: компактный scrollable period-picker, без cmdk.
 */
export function TopBar({ onOpenPalette }: { onOpenPalette?: () => void }) {
  const period = useShellStore((s) => s.period);
  const setPeriod = useShellStore((s) => s.setPeriod);
  const toggleFeed = useShellStore((s) => s.toggleInsightFeed);

  return (
    <header className="sticky top-0 z-20 flex h-14 md:h-16 items-center gap-2 px-3 md:px-6 backdrop-blur-xl bg-[color-mix(in_oklab,var(--bg-primary)_75%,transparent)]">
      <div
        role="tablist"
        aria-label="Период"
        className="glass flex flex-1 md:flex-initial items-center gap-0.5 rounded-full p-1 overflow-x-auto no-scrollbar"
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
                "relative h-8 shrink-0 rounded-full px-3 text-[12px] md:text-[13px] font-medium transition-colors whitespace-nowrap",
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

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <button
          onClick={onOpenPalette}
          className="glass hidden lg:flex h-9 w-[240px] items-center gap-2 rounded-full px-3 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          aria-label="Быстрый поиск"
        >
          <Search className="size-4" aria-hidden />
          <span>Найти операцию или раздел</span>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
            <kbd className="rounded border border-[var(--border-strong)] bg-[var(--surface-1)] px-1.5 py-0.5">⌘</kbd>
            <kbd className="rounded border border-[var(--border-strong)] bg-[var(--surface-1)] px-1.5 py-0.5">K</kbd>
          </span>
        </button>

        <Button variant="icon" size="icon" aria-label="Уведомления" className="hidden md:inline-flex">
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
