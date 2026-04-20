"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { TxnType } from "@/lib/types";

// Lazy-load drawer — подгружается только когда пользователь
// нажимает FAB / Cmd+N / клик по строке (TZ 10.7).
const TransactionDrawer = dynamic(
  () => import("./transaction-drawer").then((m) => m.TransactionDrawer),
  { ssr: false },
);

type Ctx = {
  openNew: (type?: TxnType) => void;
  openEdit: (id: string) => void;
  close: () => void;
};

const TransactionsCtx = React.createContext<Ctx | null>(null);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [initialType, setInitialType] = React.useState<TxnType>("expense");

  const api = React.useMemo<Ctx>(
    () => ({
      openNew: (type = "expense") => {
        setEditingId(null);
        setInitialType(type);
        setOpen(true);
      },
      openEdit: (id) => {
        setEditingId(id);
        setOpen(true);
      },
      close: () => setOpen(false),
    }),
    [],
  );

  return (
    <TransactionsCtx.Provider value={api}>
      {children}
      {(open || editingId) && (
        <TransactionDrawer
          open={open}
          onOpenChange={setOpen}
          initialType={initialType}
          editingId={editingId}
        />
      )}
    </TransactionsCtx.Provider>
  );
}

export function useTransactions() {
  const ctx = React.useContext(TransactionsCtx);
  if (!ctx) throw new Error("useTransactions must be used inside TransactionsProvider");
  return ctx;
}
