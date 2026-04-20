"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * HeroPortalAnimation — cinematic сцена в духе Voxr AI.
 *
 * Сцена (слева направо):
 *   [Entry platform с очередью фигурок]
 *     → [Portal arch со сканирующим лучом]
 *        → [Output platform с инсайт-карточкой]
 *
 * Фигурки-транзакции непрерывным потоком идут к порталу,
 * проходят через луч и на выходе собираются в Calm-инсайт.
 *
 * Всё зациклено, плавно, respects prefers-reduced-motion.
 */

const CYCLE = 2.4; // сек на одну фигурку
const FIGURE_COUNT = 4; // параллельных анимаций в очереди

// Категории-иконки (22–35 yo impulse-траты из ТЗ)
const FIGURES = [
  { emoji: "☕", tint: "#C4A78B" },
  { emoji: "🛒", tint: "#4ECDC4" },
  { emoji: "📺", tint: "#A78BFA" },
  { emoji: "🚕", tint: "#7C6FE8" },
  { emoji: "🍕", tint: "#FFB4A2" },
  { emoji: "🎮", tint: "#93C5FD" },
];

// Ключевые точки сцены (в %)
const ENTRY_X = 4;
const PORTAL_X = 48;
const OUTPUT_X = 80;

export function HeroPortalAnimation() {
  const reduce = useReducedMotion();

  return (
    <div
      className="relative mx-auto w-full max-w-[780px] h-[280px] sm:h-[340px] md:h-[400px] select-none"
      aria-hidden
    >
      {/* === Сценический пол === */}
      <StageFloor reduce={!!reduce} />

      {/* === Очередь фигурок === */}
      {Array.from({ length: FIGURE_COUNT }).map((_, i) => (
        <Figure
          key={i}
          slotIndex={i}
          totalSlots={FIGURE_COUNT}
          reduce={!!reduce}
        />
      ))}

      {/* === Портал (центр) === */}
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-[58%] z-[5]"
        style={{ left: `${PORTAL_X}%` }}
      >
        <Portal reduce={!!reduce} />
      </div>

      {/* === Output — инсайт на правой платформе === */}
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-[58%] z-[6]"
        style={{ left: `${OUTPUT_X}%` }}
      >
        <OutputCard reduce={!!reduce} />
      </div>
    </div>
  );
}

/* ========================================================= */
/*  Stage floor — светящиеся линии «платформа»                */
/* ========================================================= */

function StageFloor({ reduce }: { reduce: boolean }) {
  return (
    <>
      {/* главная горизонтальная линия */}
      <div
        className="absolute left-0 right-0 top-[72%] h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 2%, rgba(124,111,232,0.55) 30%, rgba(167,139,250,0.85) 48%, rgba(94,234,212,0.55) 70%, transparent 98%)",
          boxShadow: "0 0 18px rgba(124,111,232,0.6)",
        }}
      />
      {/* вспомогательная «дальняя» линия */}
      <div
        className="absolute left-[8%] right-[8%] top-[68%] h-[1px] opacity-40"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.18) 50%, transparent)",
        }}
      />
      {/* мягкое свечение под порталом */}
      <motion.div
        className="absolute left-1/2 top-[60%] h-[180px] w-[420px] -translate-x-1/2 rounded-[50%] blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, #A78BFA 38%, transparent) 0%, transparent 65%)",
        }}
        animate={
          reduce ? undefined : { opacity: [0.45, 0.8, 0.45] }
        }
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

/* ========================================================= */
/*  Figure — плавно идёт ENTRY → PORTAL → fades out           */
/* ========================================================= */

function Figure({
  slotIndex,
  totalSlots,
  reduce,
}: {
  slotIndex: number;
  totalSlots: number;
  reduce: boolean;
}) {
  const delay = (CYCLE / totalSlots) * slotIndex;

  // у каждого «слота» своя итерация эмодзи для разнообразия
  const [figureIndex, setFigureIndex] = React.useState(slotIndex % FIGURES.length);

  React.useEffect(() => {
    if (reduce) return;
    const iv = setInterval(() => {
      setFigureIndex((i) => (i + totalSlots) % FIGURES.length);
    }, CYCLE * 1000);
    return () => clearInterval(iv);
  }, [reduce, totalSlots]);

  const figure = FIGURES[figureIndex];

  if (reduce) {
    const x = ENTRY_X + (slotIndex / (totalSlots - 1)) * (PORTAL_X - ENTRY_X - 6);
    return (
      <div
        className="absolute top-1/2 -translate-y-[58%] -translate-x-1/2"
        style={{ left: `${x}%` }}
      >
        <FigureGlyph emoji={figure.emoji} tint={figure.tint} />
      </div>
    );
  }

  return (
    <motion.div
      className="absolute top-1/2 -translate-y-[58%] -translate-x-1/2 z-[4]"
      initial={{ opacity: 0 }}
      animate={{
        left: [`${ENTRY_X - 4}%`, `${ENTRY_X}%`, `${PORTAL_X - 3}%`, `${PORTAL_X}%`],
        opacity: [0, 1, 1, 0],
        scale: [0.85, 1, 0.98, 0.6],
        filter: [
          "blur(0px) brightness(1)",
          "blur(0px) brightness(1)",
          "blur(0px) brightness(1.15)",
          "blur(10px) brightness(2.4)",
        ],
      }}
      transition={{
        duration: CYCLE * totalSlots,
        repeat: Infinity,
        delay,
        times: [0, 0.08, 0.9, 1],
        ease: "linear",
      }}
    >
      <FigureBob>
        <FigureGlyph emoji={figure.emoji} tint={figure.tint} />
      </FigureBob>
    </motion.div>
  );
}

/** Лёгкое покачивание при ходьбе */
function FigureBob({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{
        y: [0, -3, 0, -3, 0],
        rotate: [-1, 1, -1, 1, -1],
      }}
      transition={{
        duration: 0.9,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

function FigureGlyph({ emoji, tint }: { emoji: string; tint: string }) {
  return (
    <div
      className="flex h-[52px] w-[52px] sm:h-[58px] sm:w-[58px] items-center justify-center rounded-[22px] text-[22px] sm:text-[24px] backdrop-blur-md"
      style={{
        background: `linear-gradient(135deg, color-mix(in oklab, ${tint} 28%, rgba(255,255,255,0.04)) 0%, rgba(255,255,255,0.02) 100%)`,
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: `0 12px 28px color-mix(in oklab, ${tint} 22%, rgba(0,0,0,0.25)), inset 0 1px 0 rgba(255,255,255,0.28)`,
      }}
    >
      {emoji}
    </div>
  );
}

/* ========================================================= */
/*  Portal — glass-арка со сканирующим лучом                  */
/* ========================================================= */

function Portal({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative h-[190px] w-[150px] sm:h-[220px] sm:w-[170px]">
      {/* external halo */}
      <motion.div
        className="absolute -inset-6 rounded-[80px]"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, #A78BFA 55%, transparent) 0%, transparent 65%)",
          filter: "blur(24px)",
        }}
        animate={reduce ? undefined : { opacity: [0.55, 0.95, 0.55], scale: [1, 1.05, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Glass arch SVG */}
      <svg viewBox="0 0 170 220" className="relative h-full w-full">
        <defs>
          <linearGradient id="portal-frame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.35)" />
          </linearGradient>
          <linearGradient id="portal-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(167,139,250,0.20)" />
            <stop offset="100%" stopColor="rgba(94,234,212,0.10)" />
          </linearGradient>
          <radialGradient id="portal-inner" cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" stopOpacity="0.85" />
            <stop offset="35%" stopColor="rgba(167,139,250,0.55)" />
            <stop offset="100%" stopColor="rgba(15,14,26,0)" />
          </radialGradient>
        </defs>

        {/* Aperture inner glow */}
        <rect x="20" y="14" width="130" height="190" rx="65" fill="url(#portal-inner)" />
        {/* Glass tint */}
        <rect x="20" y="14" width="130" height="190" rx="65" fill="url(#portal-fill)" />
        {/* Frame */}
        <rect x="20" y="14" width="130" height="190" rx="65" stroke="url(#portal-frame)" strokeWidth="1.6" fill="none" />
        {/* Top highlight */}
        <path d="M 38 16 Q 85 6 132 16" stroke="rgba(255,255,255,0.65)" strokeWidth="1" fill="none" opacity="0.8" />
        {/* Bottom fade */}
        <path d="M 38 202 Q 85 210 132 202" stroke="rgba(167,139,250,0.45)" strokeWidth="1" fill="none" />
      </svg>

      {/* Scanning beam */}
      <motion.div
        className="pointer-events-none absolute left-[14px] right-[14px] top-[16px] h-[3px] rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,1), rgba(167,139,250,1), rgba(94,234,212,1), rgba(255,255,255,1), transparent)",
          boxShadow:
            "0 0 20px rgba(167,139,250,0.9), 0 0 40px rgba(94,234,212,0.6)",
        }}
        animate={
          reduce
            ? undefined
            : {
                y: [0, 178, 0],
                opacity: [0.35, 1, 0.35],
              }
        }
        transition={{
          duration: 2.1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Sparks внутри */}
      {[0.2, 0.45, 0.7, 0.9].map((t, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute h-1 w-1 rounded-full bg-white"
          style={{
            left: `${20 + (i % 2) * 50}%`,
            top: `${t * 100}%`,
            boxShadow: "0 0 8px rgba(255,255,255,0.85)",
          }}
          animate={reduce ? undefined : { opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] }}
          transition={{
            duration: 1.3,
            repeat: Infinity,
            delay: i * 0.25,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Входной проём: лёгкий blur вокруг края, имитация «глубины» */}
      <div
        className="pointer-events-none absolute inset-x-[14px] inset-y-[14px] rounded-[58px]"
        style={{
          boxShadow: "inset 0 0 40px rgba(124,111,232,0.35)",
        }}
      />
    </div>
  );
}

/* ========================================================= */
/*  OutputCard — всегда на платформе, «вдыхает» при сканах    */
/* ========================================================= */

function OutputCard({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      animate={
        reduce
          ? undefined
          : {
              y: [0, -4, 0],
            }
      }
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
    >
      {/* под-платформа-свечение */}
      <motion.div
        className="absolute left-1/2 top-full mt-2 h-8 w-[120%] -translate-x-1/2 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, #5EEAD4 55%, transparent), transparent 70%)",
        }}
        animate={reduce ? undefined : { opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Карточка */}
      <motion.div
        className="relative flex w-[180px] sm:w-[210px] flex-col gap-2 rounded-2xl p-3.5 backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(94,234,212,0.10) 100%)",
          border: "1px solid rgba(255,255,255,0.22)",
          boxShadow:
            "0 18px 40px rgba(94,234,212,0.22), 0 0 0 1px rgba(94,234,212,0.22), inset 0 1px 0 rgba(255,255,255,0.28)",
        }}
        animate={
          reduce
            ? undefined
            : {
                boxShadow: [
                  "0 18px 40px rgba(94,234,212,0.22), 0 0 0 1px rgba(94,234,212,0.22), inset 0 1px 0 rgba(255,255,255,0.28)",
                  "0 22px 56px rgba(94,234,212,0.38), 0 0 0 1px rgba(94,234,212,0.40), inset 0 1px 0 rgba(255,255,255,0.30)",
                  "0 18px 40px rgba(94,234,212,0.22), 0 0 0 1px rgba(94,234,212,0.22), inset 0 1px 0 rgba(255,255,255,0.28)",
                ],
              }
        }
        transition={{ duration: CYCLE, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-lg"
            style={{ background: "rgba(94,234,212,0.22)" }}
          >
            <CheckIcon />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/65">
            Positive reframe
          </span>
        </div>
        <div className="text-[13px] font-semibold leading-tight text-white">
          В этом месяце вы отложили{" "}
          <span style={{ color: "#5EEAD4" }}>12%</span>
        </div>
        <div className="text-[11px] leading-snug text-white/55">
          На 4 п.п. больше, чем в среднем. Это ваш результат.
        </div>

        {/* sparkline */}
        <svg viewBox="0 0 160 36" className="mt-1 h-7 w-full">
          <defs>
            <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#5EEAD4" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0,28 L20,24 L40,26 L60,18 L80,20 L100,12 L120,14 L140,8 L160,4 L160,36 L0,36 Z"
            fill="url(#spark-fill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
          <motion.path
            d="M0,28 L20,24 L40,26 L60,18 L80,20 L100,12 L120,14 L140,8 L160,4"
            fill="none"
            stroke="#5EEAD4"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
          />
          {/* движущаяся искра в конце линии */}
          {!reduce && (
            <motion.circle
              cx="160"
              cy="4"
              r="2.5"
              fill="#5EEAD4"
              animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </svg>
      </motion.div>
    </motion.div>
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
