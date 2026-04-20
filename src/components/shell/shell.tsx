"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import { FAB } from "./fab";
import { MobileNav } from "./mobile-nav";
import { InsightFeed, type Insight } from "./insight-feed";
import { PageTransition } from "./page-transition";

/**
 * AppShell — основной каркас (TZ 6.2).
 * Layout:
 *   - md+: Sidebar | content | InsightFeed
 *   - mobile: content + bottom MobileNav, FAB смещён выше bottom-bar
 */
export function AppShell({
  children,
  insights = [],
  onAddTransaction,
  onOpenPalette,
}: {
  children: React.ReactNode;
  insights?: Insight[];
  onAddTransaction: () => void;
  onOpenPalette?: () => void;
}) {
  return (
    <div className="flex min-h-dvh w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenPalette={onOpenPalette} />
        <main className="flex-1 px-4 pb-[120px] pt-2 md:px-6 md:pb-12 md:pt-4">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <InsightFeed insights={insights} />
      <FAB onClick={onAddTransaction} />
      <MobileNav />
    </div>
  );
}
