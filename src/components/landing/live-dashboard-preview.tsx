"use client";

import * as React from "react";
import { motion, useReducedMotion, useTime, useTransform } from "motion/react";

/**
 * LiveDashboardPreview — dark premium fintech mock-дашборд для hero.
 * Stripe / Linear / Copilot Money-inspired: тёмный surface, mint-cobalt
 * signature, sharp edges, live numbers, subscription list, insight toast.
 */
export function LiveDashboardPreview() {
  const reduce = useReducedMotion();
  const time = useTime();

  const floatY = useTransform(time, (t) =>
    reduce ? 0 : Math.sin((t / 2600) * Math.PI * 2) * 4,
  );

  // Net flow — автоанимация счётчика
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
    <motion.div className="relative mx-auto w-full max-w-[520px]" style={{ y: floatY }}>
      {/* Ambient prismatic bloom */}
      <div
        aria-hidden
        className="absolute -inset-10 -z-10 rounded-[48px]"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 40%, rgba(62, 235, 174, 0.18), transparent 70%), radial-gradient(50% 50% at 80% 80%, rgba(125, 169, 255, 0.14), transparent 70%)",
          filter: "blur(28px)",
        }}
      />

      {/* Main card */}
      <div
        className="relative overflow-hidden rounded-[28px] border"
        style={{
          background:
            "linear-gradient(180deg, rgba(27, 29, 40, 0.96) 0%, rgba(19, 21, 32, 0.96) 100%)",
          borderColor: "rgba(255, 255, 255, 0.08)",
          boxShadow:
            "0 40px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(62,235,174,0.08)",
        }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-5 py-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FC8A6B]/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FCB847]/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#3EEBAE]/60" />
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
            Август · дашборд
          </span>
        </div>

        <div className="p-5">
          {/* Net flow */}
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">
                Net flow
              </div>
              <motion.div
                key={netFlow}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                className="mt-1.5 font-serif font-medium leading-none text-white"
                style={{
                  fontSize: "clamp(34px, 4vw, 48px)",
                  letterSpacing: "-0.02em",
                  fontVariationSettings: '"SOFT" 40, "opsz" 144',
                }}
              >
                +{netFlow.toLocaleString("ru-RU")}
                <span className="ml-1 text-white/35" style={{ fontSize: "0.55em" }}>
                  ₽
                </span>
              </motion.div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div
                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                style={{
                  background: "rgba(62, 235, 174, 0.14)",
                  color: "#3EEBAE",
                }}
              >
                +12,4%
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                за месяц
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Sparkline reduce={!!reduce} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <Tile label="Доходы" value="182 К" tone="mint" bar={72} reduce={!!reduce} />
            <Tile label="Расходы" value="139 К" tone="neutral" bar={48} reduce={!!reduce} />
          </div>

          <div className="mt-5 flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
            <CategoryDonut reduce={!!reduce} />
            <div className="flex-1 space-y-1.5 text-[11.5px]">
              {[
                { name: "Подписки", pct: "28%", dot: "#3EEBAE" },
                { name: "Кофе", pct: "14%", dot: "#FCB847" },
                { name: "Транспорт", pct: "11%", dot: "#7DA9FF" },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.dot }} />
                  <span className="flex-1 text-white/60">{c.name}</span>
                  <span className="font-mono text-white/80">{c.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <InsightToast reduce={!!reduce} />
      <SubscriptionsMini reduce={!!reduce} />
    </motion.div>
  );
}

function Sparkline({ reduce }: { reduce: boolean }) {
  return (
    <svg viewBox="0 0 480 90" className="h-[72px] w-full">
      <defs>
        <linearGradient id="lp-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3EEBAE" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#3EEBAE" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lp-spark-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3EEBAE" />
          <stop offset="100%" stopColor="#7DA9FF" />
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
        stroke="url(#lp-spark-stroke)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
      />
      {!reduce && (
        <motion.circle
          r="4.5"
          fill="#3EEBAE"
          animate={{
            cx: [100, 220, 340, 480, 100],
            cy: [48, 36, 18, 6, 48],
            opacity: [0, 1, 1, 1, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 8px rgba(62,235,174,0.8))" }}
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
  tone: "mint" | "neutral";
  bar: number;
  reduce: boolean;
}) {
  const color = tone === "mint" ? "#3EEBAE" : "#F5F5F7";
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
        {label}
      </div>
      <div
        className="font-serif mt-1 leading-none"
        style={{
          color,
          letterSpacing: "-0.01em",
          fontSize: "22px",
          fontVariationSettings: '"opsz" 144',
        }}
      >
        {value}
        <span className="ml-1 text-white/35" style={{ fontSize: "0.55em" }}>
          ₽
        </span>
      </div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: tone === "mint" ? "linear-gradient(90deg, #3EEBAE, #7DA9FF)" : color }}
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
    { pct: 28, color: "#3EEBAE" },
    { pct: 14, color: "#FCB847" },
    { pct: 11, color: "#7DA9FF" },
    { pct: 47, color: "rgba(255,255,255,0.08)" },
  ];
  let cum = 0;
  const R = 26;
  const C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 72 72" className="h-[72px] w-[72px] shrink-0 -rotate-90">
      <circle cx="36" cy="36" r={R} stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
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
      className="absolute -right-6 top-8 hidden w-[240px] flex-col gap-1.5 rounded-2xl border p-3.5 lg:flex"
      style={{
        background: "linear-gradient(180deg, #1B1D28, #131520)",
        borderColor: "rgba(62,235,174,0.2)",
        boxShadow:
          "0 24px 50px -16px rgba(0,0,0,0.5), 0 0 0 1px rgba(62,235,174,0.08)",
      }}
      initial={{ opacity: 0, x: 20, y: -8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6, ease: [0.33, 1, 0.68, 1] }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full"
          style={{ background: "rgba(62,235,174,0.18)" }}
        >
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
            <path
              d="M2 6 L5 9 L10 3"
              fill="none"
              stroke="#3EEBAE"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/40">
          Positive reframe
        </span>
      </div>
      <div
        className="font-serif text-[15px] leading-snug text-white"
        style={{ fontVariationSettings: '"SOFT" 60, "opsz" 144' }}
      >
        Отложили <span style={{ color: "#3EEBAE" }}>12%</span> от дохода
      </div>
      <div className="text-[11px] leading-snug text-white/55">
        На 4 п.п. больше среднего. Это ваш результат.
      </div>
      {!reduce && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ boxShadow: "0 0 0 1px rgba(62,235,174,0.35)" }}
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
      className="absolute -left-10 bottom-10 hidden w-[210px] rounded-2xl border p-3 lg:block"
      style={{
        background: "linear-gradient(180deg, #1B1D28, #131520)",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: "0 24px 50px -16px rgba(0,0,0,0.5)",
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.8, ease: [0.33, 1, 0.68, 1] }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/40">
          Подписки
        </span>
        <span className="font-mono text-[10px] text-white/80">8 450 ₽/мес</span>
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
              style={{
                background: "rgba(62,235,174,0.14)",
                color: "#3EEBAE",
              }}
            >
              {s.icon}
            </span>
            <span className="flex-1 text-white">{s.name}</span>
            <span className="font-mono text-white/50">{s.amount} ₽</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
