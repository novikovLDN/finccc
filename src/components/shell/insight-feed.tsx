"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ThumbsUp, ThumbsDown, ChevronRight } from "lucide-react";
import { useShellStore } from "@/components/shell/store";
import { cn } from "@/lib/utils";

/**
 * InsightCard (TZ 4.6, 9.3).
 * Правильная структура:
 *  строка 1 — наблюдение с цифрой,
 *  строка 2 — проекция/контекст,
 *  строка 3 — открытое приглашение.
 */
export type Insight = {
  id: string;
  type: "pattern" | "trajectory" | "subscription" | "goal" | "positive";
  title: string;
  body: string;
  cta?: string;
  createdAt: string;
};

export function InsightCard({
  insight,
  onFeedback,
}: {
  insight: Insight;
  onFeedback?: (id: string, useful: boolean) => void;
}) {
  const [given, setGiven] = React.useState<null | boolean>(null);
  const tone = insight.type === "positive" ? "var(--accent-mint)" : "var(--accent-primary)";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
      className="glass glass-live rounded-2xl p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `color-mix(in oklab, ${tone} 18%, transparent)` }}
          aria-hidden
        >
          <Sparkles className="size-[14px]" style={{ color: tone }} />
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          {labelFor(insight.type)}
        </span>
      </div>
      <h4 className="mb-1 text-[15px] font-semibold leading-snug">{insight.title}</h4>
      <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">{insight.body}</p>

      {insight.cta && (
        <button className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--accent-primary)] hover:underline underline-offset-2">
          {insight.cta}
          <ChevronRight className="size-3.5" aria-hidden />
        </button>
      )}

      <div className="mt-3 flex items-center gap-1 border-t border-[var(--border-subtle)] pt-3">
        <span className="text-[11px] text-[var(--text-tertiary)]">Было полезно?</span>
        <div className="ml-auto flex gap-1">
          <button
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
              given === true
                ? "bg-[var(--accent-mint-soft)] text-[var(--accent-mint)]"
                : "text-[var(--text-tertiary)] hover:bg-[var(--accent-primary-soft)]",
            )}
            onClick={() => {
              setGiven(true);
              onFeedback?.(insight.id, true);
            }}
            aria-label="Полезно"
          >
            <ThumbsUp className="size-[13px]" />
          </button>
          <button
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
              given === false
                ? "bg-[var(--surface-3)] text-[var(--text-secondary)]"
                : "text-[var(--text-tertiary)] hover:bg-[var(--accent-primary-soft)]",
            )}
            onClick={() => {
              setGiven(false);
              onFeedback?.(insight.id, false);
            }}
            aria-label="Не нужно такое"
          >
            <ThumbsDown className="size-[13px]" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function labelFor(type: Insight["type"]) {
  switch (type) {
    case "pattern":
      return "Наблюдение";
    case "trajectory":
      return "Прогноз";
    case "subscription":
      return "Подписки";
    case "goal":
      return "Цель";
    case "positive":
      return "Positive reframe";
  }
}

export function InsightFeed({ insights }: { insights: Insight[] }) {
  const open = useShellStore((s) => s.insightFeedOpen);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="feed"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          className="hidden lg:block shrink-0 overflow-hidden"
          aria-label="Лента инсайтов"
        >
          <div className="flex h-dvh flex-col gap-3 p-4 sticky top-0 w-[320px]">
            <div className="flex items-end justify-between px-1 border-b border-[var(--warm-line)] pb-3">
              <div>
                <div className="kicker">Лента</div>
                <h3
                  className="font-display mt-1 text-[20px] font-medium leading-none"
                  style={{
                    fontVariationSettings: '"SOFT" 45, "opsz" 144',
                    letterSpacing: "-0.015em",
                  }}
                >
                  Инсайты
                </h3>
              </div>
              <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-[var(--text-tertiary)] pb-0.5">
                до 3 / нед.
              </span>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto pr-1">
              {insights.length === 0 ? (
                <div className="glass rounded-2xl p-4 text-sm text-[var(--text-secondary)]">
                  Инсайты появятся, когда накопится 7+ дней данных. А пока — вы можете исследовать операции вручную.
                </div>
              ) : (
                insights.map((i) => <InsightCard key={i.id} insight={i} />)
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
