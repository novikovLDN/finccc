"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PeriodKey } from "@/lib/nav";

/**
 * Shell UI store (Zustand, TZ 10.1).
 * Локальный UI-стейт: sidebar, theme, period, insight-feed open.
 */

type Theme = "light" | "dark" | "system";

interface ShellState {
  sidebarCollapsed: boolean;
  insightFeedOpen: boolean;
  period: PeriodKey;
  theme: Theme;
  toggleSidebar: () => void;
  toggleInsightFeed: () => void;
  setPeriod: (p: PeriodKey) => void;
  setTheme: (t: Theme) => void;
}

export const useShellStore = create<ShellState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      insightFeedOpen: true,
      period: "month",
      theme: "system",
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleInsightFeed: () => set((s) => ({ insightFeedOpen: !s.insightFeedOpen })),
      setPeriod: (period) => set({ period }),
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          if (theme === "system") {
            document.documentElement.removeAttribute("data-theme");
            try {
              localStorage.removeItem("mm-theme");
            } catch {}
          } else {
            document.documentElement.setAttribute("data-theme", theme);
            try {
              localStorage.setItem("mm-theme", theme);
            } catch {}
          }
        }
      },
    }),
    {
      name: "mm-shell",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        insightFeedOpen: s.insightFeedOpen,
        period: s.period,
        theme: s.theme,
      }),
    },
  ),
);
