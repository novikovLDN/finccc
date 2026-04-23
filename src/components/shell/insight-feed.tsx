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
  const isPositive = insight.type === "positive";
  const accent = isPositive ? "#5EEAD4" : "var(--honey)";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-2xl p-4"
      style={{
        background: "#1A1612",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 18px 40px -16px rgba(20,22,14,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Accent glow top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40"
        style={{
          background: `radial-gradient(circle, color-mix(in oklab, ${accent} 40%, transparent), transparent 70%)`,
          filter: "blur(20px)",
        }}
      />

      <div className="relative mb-2 flex items-center gap-1.5">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full"
          style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)` }}
          aria-hidden
        >
          <Sparkles className="size-[11px]" style={{ color: accent }} />
        </span>
        <span
          className="text-[9.5px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {labelFor(insight.type)}
        </span>
      </div>

      <h4
        className="font-display relative mb-1.5 text-[15.5px] font-medium leading-[1.25] text-white"
        style={{
          fontVariationSettings: '"SOFT" 55, "opsz" 144',
          letterSpacing: "-0.01em",
        }}
      >
        {insight.title}
      </h4>
      <p className="relative text-[12.5px] leading-[1.55] text-white/60">
        {insight.body}
      </p>

      {insight.cta && (
        <button
          className="relative mt-3 inline-flex items-center gap-1 text-[12px] font-medium hover:underline underline-offset-2"
          style={{ color: accent }}
        >
          {insight.cta}
          <ChevronRight className="size-3.5" aria-hidden />
        </button>
      )}

      <div
        className="relative mt-3 flex items-center gap-1 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span className="text-[10.5px] text-white/40">Полезно?</span>
        <div className="ml-auto flex gap-1">
          <button
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
              given === true
                ? "bg-[rgba(94,234,212,0.16)] text-[#5EEAD4]"
                : "text-white/30 hover:bg-white/5 hover:text-white/60",
            )}
            onClick={() => {
              setGiven(true);
              onFeedback?.(insight.id, true);
            }}
            aria-label="Полезно"
          >
            <ThumbsUp className="size-[12px]" />
          </button>
          <button
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
              given === false
                ? "bg-white/5 text-white/50"
                : "text-white/30 hover:bg-white/5 hover:text-white/60",
            )}
            onClick={() => {
              setGiven(false);
              onFeedback?.(insight.id, false);
            }}
            aria-label="Не нужно такое"
          >
            <ThumbsDown className="size-[12px]" />
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
                <div
                  className="rounded-2xl p-4 text-[12.5px] leading-[1.55] text-[var(--text-secondary)]"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  Инсайты появятся, когда накопится{" "}
                  <span
                    className="font-display-italic"
                    style={{ color: "var(--hunter)" }}
                  >
                    7+ дней
                  </span>{" "}
                  данных. А пока — исследуйте операции вручную.
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
