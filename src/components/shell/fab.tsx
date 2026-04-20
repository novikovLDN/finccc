"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";

/**
 * FAB (TZ 6.2). Всегда «добавить операцию» одним кликом.
 * Cmd+N shortcut (TZ 12.3). Spring + мягкое свечение.
 */
export function FAB({ onClick }: { onClick: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "n") {
        // не перехватываем если фокус в input
        const tgt = e.target as HTMLElement | null;
        if (tgt && /INPUT|TEXTAREA|SELECT/.test(tgt.tagName)) return;
        e.preventDefault();
        onClick();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClick]);

  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2,
      }}
      whileHover={{ y: -2, scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      style={{
        background:
          "linear-gradient(135deg, var(--accent-primary), color-mix(in oklab, var(--accent-primary) 55%, var(--accent-mint)))",
        boxShadow:
          "0 16px 40px color-mix(in oklab, var(--accent-primary) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.3)",
      }}
      aria-label="Новая операция"
      title="Новая операция (⌘N)"
    >
      <motion.span
        initial={false}
        whileHover={{ rotate: 90 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Plus className="size-6" aria-hidden />
      </motion.span>
    </motion.button>
  );
}
