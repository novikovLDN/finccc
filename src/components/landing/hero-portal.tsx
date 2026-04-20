"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * HeroPortalAnimation — циклическая «хаос → портал-сканер → инсайт».
 *
 * Левая зона: «фигурки расходов» (coin-blob с эмодзи) появляются по очереди
 * и идут к центральному порталу.
 * Центр: glass-портал с пульсирующим световым лучом-сканером.
 * Правая зона: на выходе из портала появляется спокойная инсайт-карточка
 * с галочкой / донатом / suns of money.
 *
 * Цикл бесшовный, длится 5 секунд. Респектит prefers-reduced-motion.
 */

const CYCLE = 6; // sec
const FIGURE_COUNT = 4;

// Иконки «хаоса»: типичные impulse-расходы 22-35 yo (TZ персона)
const FIGURE_EMOJIS = ["☕", "🛒", "📺", "🚕", "🍕", "🎮"];

export function HeroPortalAnimation() {
  const reduce = useReducedMotion();

  return (
    <div
      className="relative w-full max-w-[640px] h-[300px] sm:h-[360px] md:h-[420px] mx-auto"
      aria-hidden
    >
      {/* Floor с подсветкой и отражением */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] overflow-hidden">
        <div
          className="absolute inset-x-0 top-1/2 h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(124,111,232,0.35), rgba(94,234,212,0.35), transparent)",
            boxShadow: "0 0 24px rgba(124,111,232,0.55)",
          }}
        />
        <div
          className="absolute inset-x-1/4 bottom-1/4 h-[120%] rounded-[50%] blur-2xl"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--accent-primary) 35%, transparent) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* PORTAL — glass арка со световым лучом */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%] z-10">
        <Portal reduce={!!reduce} />
      </div>

      {/* Хаос-фигурки (слева → к порталу) */}
      {Array.from({ length: FIGURE_COUNT }).map((_, i) => (
        <ChaosFigure
          key={i}
          index={i}
          total={FIGURE_COUNT}
          emoji={FIGURE_EMOJIS[i % FIGURE_EMOJIS.length]}
          reduce={!!reduce}
        />
      ))}

      {/* Calm-output (справа от портала) */}
      <CalmOutput reduce={!!reduce} />
    </div>
  );
}

function Portal({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative h-[180px] w-[140px] sm:h-[210px] sm:w-[160px]">
      {/* Outer arch glow */}
      <motion.div
        className="absolute inset-0 rounded-[80px]"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--accent-primary) 60%, transparent) 0%, transparent 70%)",
          filter: "blur(28px)",
        }}
        animate={
          reduce ? undefined : { opacity: [0.5, 0.85, 0.5], scale: [1, 1.06, 1] }
        }
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Glass arch frame (SVG для точности) */}
      <svg
        viewBox="0 0 160 210"
        className="relative h-full w-full"
        fill="none"
      >
        <defs>
          <linearGradient id="portal-frame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.32)" />
          </linearGradient>
          <linearGradient id="portal-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(167,139,250,0.18)" />
            <stop offset="100%" stopColor="rgba(94,234,212,0.10)" />
          </linearGradient>
          <radialGradient id="portal-inner" cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" stopOpacity="0.85" />
            <stop offset="40%" stopColor="rgba(167,139,250,0.45)" />
            <stop offset="100%" stopColor="rgba(15,14,26,0)" />
          </radialGradient>
          <filter id="soft-glow">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Portal aperture (filled with glow) */}
        <rect
          x="20"
          y="14"
          width="120"
          height="180"
          rx="60"
          fill="url(#portal-inner)"
        />
        {/* Glass tint over aperture */}
        <rect
          x="20"
          y="14"
          width="120"
          height="180"
          rx="60"
          fill="url(#portal-fill)"
        />
        {/* Frame stroke */}
        <rect
          x="20"
          y="14"
          width="120"
          height="180"
          rx="60"
          stroke="url(#portal-frame)"
          strokeWidth="1.5"
        />
        {/* Top highlight */}
        <path
          d="M 40 14 Q 80 6 120 14"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1"
          fill="none"
          filter="url(#soft-glow)"
        />
      </svg>

      {/* Scanning beam — горизонтальная полоса света */}
      <motion.div
        className="absolute left-[14px] right-[14px] top-[16px] h-[3px] rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), rgba(167,139,250,0.95), rgba(94,234,212,0.95), rgba(255,255,255,0.95), transparent)",
          boxShadow:
            "0 0 18px rgba(167,139,250,0.85), 0 0 32px rgba(94,234,212,0.55)",
          filter: "blur(0.5px)",
        }}
        animate={
          reduce
            ? undefined
            : {
                y: [0, 174, 0],
                opacity: [0.4, 1, 0.4],
              }
        }
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner sparks при сканировании */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 inset-y-2"
        animate={reduce ? undefined : { opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {[0.2, 0.5, 0.78].map((y, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white"
            style={{
              left: `${30 + i * 25}%`,
              top: `${y * 100}%`,
              boxShadow: "0 0 8px rgba(255,255,255,0.8)",
            }}
            animate={
              reduce
                ? undefined
                : {
                    opacity: [0, 1, 0],
                    scale: [0.4, 1.2, 0.4],
                  }
            }
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

function ChaosFigure({
  index,
  total,
  emoji,
  reduce,
}: {
  index: number;
  total: number;
  emoji: string;
  reduce: boolean;
}) {
  // Стартовая высота — небольшое раскидывание по Y
  const yOffsets = ["-22%", "8%", "-8%", "22%"];
  const y = yOffsets[index % yOffsets.length];

  const delay = (CYCLE / total) * index;

  if (reduce) {
    return (
      <div
        className="absolute left-[8%] top-1/2 -translate-y-1/2"
        style={{ marginTop: y }}
      >
        <ChaosBlob emoji={emoji} />
      </div>
    );
  }

  return (
    <motion.div
      className="absolute top-1/2 -translate-y-1/2"
      style={{ marginTop: y, left: 0 }}
      initial={{ x: 0, opacity: 0, scale: 0.7 }}
      animate={{
        x: ["8%", "8%", "42%", "42%"],
        opacity: [0, 1, 1, 0],
        scale: [0.7, 1, 0.95, 0.4],
        filter: [
          "blur(0px) brightness(1)",
          "blur(0px) brightness(1)",
          "blur(0px) brightness(1.15)",
          "blur(6px) brightness(2)",
        ],
      }}
      transition={{
        duration: CYCLE,
        repeat: Infinity,
        delay,
        times: [0, 0.12, 0.5, 0.62],
        ease: [0.33, 1, 0.68, 1],
      }}
    >
      <ChaosBlob emoji={emoji} />
    </motion.div>
  );
}

function ChaosBlob({ emoji }: { emoji: string }) {
  return (
    <div className="relative">
      <div
        className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-[20px] sm:text-[22px] backdrop-blur-md"
        style={{
          background:
            "linear-gradient(135deg, rgba(167,139,250,0.22) 0%, rgba(94,234,212,0.15) 100%)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow:
            "0 8px 24px rgba(124,111,232,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        {emoji}
      </div>
    </div>
  );
}

function CalmOutput({ reduce }: { reduce: boolean }) {
  if (reduce) {
    return (
      <div className="absolute right-[6%] top-1/2 -translate-y-1/2 z-10">
        <InsightMock />
      </div>
    );
  }

  return (
    <motion.div
      className="absolute top-1/2 -translate-y-1/2 z-10"
      style={{ right: 0 }}
      initial={{ opacity: 0, x: "55%", scale: 0.5 }}
      animate={{
        opacity: [0, 0, 1, 1, 0],
        x: ["55%", "55%", "8%", "8%", "8%"],
        scale: [0.4, 0.4, 1, 1, 0.95],
        filter: [
          "blur(8px) brightness(2)",
          "blur(4px) brightness(1.4)",
          "blur(0px) brightness(1)",
          "blur(0px) brightness(1)",
          "blur(0px) brightness(1)",
        ],
      }}
      transition={{
        duration: CYCLE,
        repeat: Infinity,
        times: [0, 0.5, 0.7, 0.92, 1],
        ease: [0.33, 1, 0.68, 1],
      }}
    >
      <InsightMock />
    </motion.div>
  );
}

function InsightMock() {
  return (
    <div
      className="relative flex w-[180px] sm:w-[200px] flex-col gap-2 rounded-2xl p-3.5 backdrop-blur-xl"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(167,139,250,0.10) 100%)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow:
          "0 16px 40px rgba(94,234,212,0.18), 0 0 0 1px rgba(94,234,212,0.18), inset 0 1px 0 rgba(255,255,255,0.2)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ background: "rgba(94,234,212,0.22)" }}
        >
          <CheckIcon />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
          Positive reframe
        </span>
      </div>
      <div className="text-[12.5px] font-semibold leading-tight text-white">
        В этом месяце вы отложили <span className="text-[#5EEAD4]">12%</span>
      </div>
      <div className="text-[11px] leading-snug text-white/55">
        На 4 п.п. больше, чем в среднем. Это ваш результат.
      </div>
      {/* Mini sparkline */}
      <svg viewBox="0 0 160 36" className="mt-1 h-7 w-full">
        <defs>
          <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#5EEAD4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0,28 L20,24 L40,26 L60,18 L80,20 L100,12 L120,14 L140,8 L160,4 L160,36 L0,36 Z"
          fill="url(#spark)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
        <motion.path
          d="M0,28 L20,24 L40,26 L60,18 L80,20 L100,12 L120,14 L140,8 L160,4"
          fill="none"
          stroke="#5EEAD4"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </svg>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="#5EEAD4"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5 L6.5 12 L13 4.5" />
    </svg>
  );
}
