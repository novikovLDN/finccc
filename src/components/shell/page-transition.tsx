"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

/**
 * Плавный переход между страницами внутри app-shell (TZ 5.4).
 * Fade + лёгкий Y-сдвиг, 250ms, respects prefers-reduced-motion.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
