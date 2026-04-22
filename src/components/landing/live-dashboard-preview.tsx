"use client";

import * as React from "react";
import { motion, useReducedMotion, useTime, useTransform } from "motion/react";

/**
 * LiveDashboardPreview — компактный, производственно-качественный
 * mock дашборда для hero. Анимированные цифры, donut, sparkline, insight-тост.
 * Дизайн в духе Copilot Money / Mercury / Wealthfront: светлый paper, sharp
 * типографика, мягкие цвета.
 */
export function LiveDashboardPreview() {
  const reduce = useReducedMotion();
  const time = useTime();

  // Лёгкое «дыхание» по Y для всего блока
  const floatY = useTransform(time, (t) =>
    reduce ? 0 : Math.sin((t / 2600) * Math.PI * 2) * 4,
  );

  // Net flow — счётчик-анимация через Intl
  const [netFlow, setNetFlow] = React.useState(42480);
  React.useEffect(() => {
    if (reduce) return;
    const iv = setInterval(() => {
      setNetFlow((prev) => {
        const delta = Math.round((Math.random() - 0.35) * 260);
        return Math.max(12000, Math.min(92000, prev + delta));
      });
    }, 2200);
    return () => clearInterval(iv);
  }, [reduce]);

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[520px]"
      style={{ y: floatY }}
    >
      {/* Soft shadow bloom */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[40px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 60%, rgba(30,58,46,0.14), transparent 70%)",
          filter: "blur(18px)",
        }}
      />

      {/* Main card */}
      <div
        className="relative rounded-[28px] border backdrop-blur-[2px]"
        style={{
          background: "linear-gradient(180deg, #FDFBF6 0%, #F4EEE1 100%)",
          borderColor: "rgba(26,22,18,0.08)",
          boxShadow:
            "0 28px 60px -20px rgba(20,22,14,0.22), 0 4px 10px rgba(20,22,14,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-5 pt-4">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D4A73E]/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#9DB7A9]/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#C9BDF6]/60" />
          <span className="ml-auto text-[10px] font-mono uppercase tracking-[0.2em] text-[#8A7F74]">
            Август
          </span>
        </div>

        <div className="px-5 pb-5 pt-3">
          {/* Net flow */}
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8A7F74]">
                Net flow
              </div>
              <motion.div
                key={netFlow}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                className="font-serif font-medium leading-none mt-1.5"
                style={{
                  fontSize: "clamp(34px, 4vw, 48px)",
                  color: "#1A1612",
                  letterSpacing: "-0.02em",
                  fontVariationSettings: '"SOFT" 40, "opsz" 144',
                }}
              >
                +{netFlow.toLocaleString("ru-RU")}
                <span className="ml-1 text-[#8A7F74]" style={{ fontSize: "0.55em" }}>
                  ₽
                </span>
              </motion.div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="rounded-full bg-[#DCE5DE] px-2.5 py-0.5 text-[10px] font-semibold text-[#1E3A2E]">
                +12,4%
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#8A7F74]">
                за месяц
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div className="mt-4">
            <Sparkline reduce={!!reduce} />
          </div>

          {/* Two-row breakdown */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Tile
              label="Доходы"
              value="182 К"
              tone="sage"
              bar={72}
              reduce={!!reduce}
            />
            <Tile
              label="Расходы"
              value="139 К"
              tone="ink"
              bar={48}
              reduce={!!reduce}
            />
          </div>

          {/* Category donut + legend */}
          <div className="mt-5 flex items-center gap-4 rounded-2xl bg-[#FBF7ED] p-3">
            <CategoryDonut reduce={!!reduce} />
            <div className="flex-1 space-y-1.5 text-[11.5px]">
              {[
                { name: "Подписки", pct: "28%", dot: "#1E3A2E" },
                { name: "Кофе", pct: "14%", dot: "#D4A73E" },
                { name: "Транспорт", pct: "11%", dot: "#9DB7A9" },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.dot }} />
                  <span className="flex-1 text-[#524940]">{c.name}</span>
                  <span className="font-mono text-[#1A1612]">{c.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating insight toast */}
      <InsightToast reduce={!!reduce} />

      {/* Subscriptions mini card */}
      <SubscriptionsMini reduce={!!reduce} />
    </motion.div>
  );
}

function Sparkline({ reduce }: { reduce: boolean }) {
  return (
    <svg viewBox="0 0 480 90" className="h-[72px] w-full">
      <defs>
        <linearGradient id="lp-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E3A2E" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1E3A2E" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 0,68 C 40,60 60,52 100,48 S 180,40 220,36 S 300,24 340,18 S 420,10 480,6 L 480,90 L 0,90 Z"
        fill="url(#lp-spark-fill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      <motion.path
        d="M 0,68 C 40,60 60,52 100,48 S 180,40 220,36 S 300,24 340,18 S 420,10 480,6"
        fill="none"
        stroke="#1E3A2E"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
      />
      {!reduce && (
        <motion.circle
          r="4"
          fill="#1E3A2E"
          animate={{
            cx: [100, 220, 340, 480, 100],
            cy: [48, 36, 18, 6, 48],
            opacity: [0, 1, 1, 1, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 6px rgba(30,58,46,0.5))" }}
        />
      )}
    </svg>
  );
}

function Tile({
  label,
  value,
  tone,
  bar,
  reduce,
}: {
  label: string;
  value: string;
  tone: "sage" | "ink";
  bar: number;
  reduce: boolean;
}) {
  const color = tone === "sage" ? "#1E3A2E" : "#1A1612";
  return (
    <div className="rounded-2xl border border-[rgba(26,22,18,0.06)] bg-[#FDFBF6] p-3.5">
      <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-[#8A7F74]">
        {label}
      </div>
      <div
        className="mt-1 font-serif text-[22px] leading-none"
        style={{ color, letterSpacing: "-0.01em", fontVariationSettings: '"opsz" 144' }}
      >
        {value}
        <span className="ml-1 text-[#8A7F74]" style={{ fontSize: "0.55em" }}>
          ₽
        </span>
      </div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-[#EFE7D7]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${bar}%` }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 120, damping: 20, delay: 0.4 }
          }
        />
      </div>
    </div>
  );
}

function CategoryDonut({ reduce }: { reduce: boolean }) {
  const segments = [
    { pct: 28, color: "#1E3A2E" },
    { pct: 14, color: "#D4A73E" },
    { pct: 11, color: "#9DB7A9" },
    { pct: 47, color: "#EFE7D7" },
  ];
  let cum = 0;
  const R = 26;
  const C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 72 72" className="h-[72px] w-[72px] shrink-0 -rotate-90">
      <circle cx="36" cy="36" r={R} stroke="#EFE7D7" strokeWidth="10" fill="none" />
      {segments.map((s, i) => {
        const length = (C * s.pct) / 100;
        const offset = (C * cum) / 100;
        cum += s.pct;
        return (
          <motion.circle
            key={i}
            cx="36"
            cy="36"
            r={R}
            stroke={s.color}
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${length} ${C - length}`}
            strokeDashoffset={-offset}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 0.8, delay: 0.3 + i * 0.08 }}
          />
        );
      })}
    </svg>
  );
}

function InsightToast({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      className="absolute -right-6 top-8 hidden lg:flex w-[240px] flex-col gap-1.5 rounded-2xl border p-3.5"
      style={{
        background: "#1A1612",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: "0 24px 50px -16px rgba(20,22,14,0.45)",
      }}
      initial={{ opacity: 0, x: 20, y: -8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6, ease: [0.33, 1, 0.68, 1] }}
    >
      <div className="flex items-center gap-1.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#9DB7A9]/20">
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
            <path
              d="M2 6 L5 9 L10 3"
              fill="none"
              stroke="#9DB7A9"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/40">
          Positive reframe
        </span>
      </div>
      <div className="font-serif text-[15px] leading-snug text-white" style={{ fontVariationSettings: '"SOFT" 60, "opsz" 144' }}>
        Отложили <span style={{ color: "#9DB7A9" }}>12%</span> от дохода
      </div>
      <div className="text-[11px] leading-snug text-white/55">
        На 4 п.п. больше среднего. Это ваш результат.
      </div>
      {!reduce && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: "0 0 0 1px rgba(157,183,169,0.35)",
          }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}

function SubscriptionsMini({ reduce }: { reduce: boolean }) {
  const subs = [
    { name: "Spotify", amount: "199", icon: "♪" },
    { name: "Figma", amount: "1 120", icon: "▲" },
    { name: "Notion", amount: "720", icon: "◆" },
  ];
  return (
    <motion.div
      className="absolute -left-10 bottom-10 hidden lg:block w-[210px] rounded-2xl border p-3"
      style={{
        background: "#FDFBF6",
        borderColor: "rgba(26,22,18,0.08)",
        boxShadow: "0 24px 50px -16px rgba(20,22,14,0.22)",
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.8, ease: [0.33, 1, 0.68, 1] }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A7F74]">
          Подписки
        </span>
        <span className="font-mono text-[10px] text-[#1A1612]">8 450 ₽/мес</span>
      </div>
      <div className="space-y-1.5">
        {subs.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={reduce ? { duration: 0 } : { delay: 0.9 + i * 0.07 }}
            className="flex items-center gap-2 text-[12px]"
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-md text-[10px]"
              style={{ background: "#EFE7D7", color: "#1E3A2E" }}
            >
              {s.icon}
            </span>
            <span className="flex-1 text-[#1A1612]">{s.name}</span>
            <span className="font-mono text-[#8A7F74]">{s.amount} ₽</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
