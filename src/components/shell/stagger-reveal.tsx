"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * StaggerReveal — wrapper, который даёт каждому прямому
 * ребёнку плавное появление с задержкой по порядку.
 *
 * Используется для виджетов dashboard, списков карточек и т.п.
 */
export interface StaggerRevealProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Задержка между детьми (сек) */
  stagger?: number;
  /** Задержка до первого ребёнка (сек) */
  startDelay?: number;
  /** y-сдвиг в пикселях */
  offset?: number;
  as?: React.ElementType;
}

export function StaggerReveal({
  children,
  stagger = 0.05,
  startDelay = 0.2,
  offset = 12,
  as: Comp = "div",
  ...props
}: StaggerRevealProps) {
  const reduce = useReducedMotion();
  const arr = React.Children.toArray(children);

  return (
    <Comp {...props}>
      {arr.map((child, i) => (
        <motion.div
          key={(child as React.ReactElement)?.key ?? i}
          initial={reduce ? false : { opacity: 0, y: offset }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: startDelay + i * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ display: "contents" }}
        >
          {child}
        </motion.div>
      ))}
    </Comp>
  );
}
