"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import { FAB } from "./fab";
import { InsightFeed, type Insight } from "./insight-feed";
import { PageTransition } from "./page-transition";

/**
 * AppShell — основной каркас страниц приложения (TZ 6.2).
 *   <Sidebar /> | <main> | <InsightFeed />
 *   Глобальные: TopBar sticky, FAB floating.
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
        <main className="flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-12">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <InsightFeed insights={insights} />
      <FAB onClick={onAddTransaction} />
    </div>
  );
}
