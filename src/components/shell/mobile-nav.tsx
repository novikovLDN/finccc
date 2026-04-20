"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LayoutDashboard, Receipt, PieChart, Target, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mobile bottom navigation (TZ 4.5: ≥360px).
 * 5 ключевых разделов в floating bottom bar — всегда доступны на ходу.
 * Виден только на mobile (md:hidden), на desktop — Sidebar.
 */
const ITEMS = [
  { href: "/app", label: "Главная", icon: LayoutDashboard },
  { href: "/app/transactions", label: "Операции", icon: Receipt },
  { href: "/app/insights", label: "Аналитика", icon: PieChart },
  { href: "/app/goals", label: "Цели", icon: Target },
  { href: "/app/settings", label: "Ещё", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2"
      aria-label="Основная навигация"
    >
      <div className="glass-strong mx-auto flex max-w-md items-center justify-around rounded-full p-1.5 shadow-lg">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/app" ? pathname === "/app" : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="relative flex h-12 min-w-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1"
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 rounded-full bg-[var(--accent-primary-soft)]"
                  transition={{ type: "spring", stiffness: 360, damping: 28 }}
                />
              )}
              <Icon
                className={cn(
                  "relative size-[18px] transition-colors",
                  active ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "relative text-[10px] font-medium leading-none tracking-tight transition-colors",
                  active ? "text-[var(--accent-primary)]" : "text-[var(--text-tertiary)]",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
