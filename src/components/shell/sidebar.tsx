"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ChevronsLeft } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useShellStore } from "@/components/shell/store";

/**
 * Sidebar (TZ 6.2) — свёрнутый в иконки при узком экране.
 * Клавиатурная навигация (Tab), visible focus-ring (TZ 12.3).
 */
export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useShellStore((s) => s.sidebarCollapsed);
  const toggle = useShellStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "hidden md:flex sticky top-0 z-30 h-dvh shrink-0 flex-col p-3 transition-[width] duration-300 ease-[var(--ease-out-standard)]",
        collapsed ? "w-[76px]" : "w-[232px]",
      )}
      aria-label="Основная навигация"
    >
      <div className="flex h-12 items-center gap-2.5 px-2">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm"
          style={{
            background:
              "linear-gradient(135deg, var(--accent-primary), color-mix(in oklab, var(--accent-primary) 60%, var(--accent-mint)))",
          }}
          aria-hidden
        >
          <span className="font-semibold text-white">M</span>
        </div>
        {!collapsed && (
          <span
            className="font-display truncate text-[17px] font-medium"
            style={{
              fontVariationSettings: '"SOFT" 45, "opsz" 144',
              letterSpacing: "-0.015em",
            }}
          >
            Mindful Money
          </span>
        )}
      </div>

      <nav className="mt-4 flex flex-col gap-1" role="navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/app" ? pathname === "/app" : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium",
                "transition-all duration-150 ease-[var(--ease-out-standard)]",
                active
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary-soft)]",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "var(--accent-primary-soft)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                className="relative size-[18px] shrink-0"
                style={{ color: active ? "var(--accent-primary)" : undefined }}
                aria-hidden
              />
              {!collapsed && <span className="relative">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 px-2">
        {!collapsed && (
          <p className="px-1 text-[11px] leading-snug text-[var(--text-tertiary)]">
            Это{" "}
            <span className="font-display-italic" style={{ color: "var(--hunter)" }}>
              наблюдения
            </span>
            , а не финансовый совет. Решение всегда за&nbsp;вами.
          </p>
        )}
        <button
          onClick={toggle}
          aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
          className="flex h-9 items-center gap-2 rounded-lg px-2 text-xs text-[var(--text-tertiary)] hover:bg-[var(--accent-primary-soft)] hover:text-[var(--text-primary)]"
        >
          <ChevronsLeft
            className={cn("size-4 transition-transform", collapsed && "rotate-180")}
            aria-hidden
          />
          {!collapsed && <span>Свернуть</span>}
        </button>
      </div>
    </aside>
  );
}
