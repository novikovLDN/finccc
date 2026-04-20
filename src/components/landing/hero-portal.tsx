"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * HeroPortalAnimation — Voxr-style cinematic scene, 1:1.
 *
 * Композиция:
 *   LEFT    [ PORTAL ]  (внутренний свет + верт. beam)
 *   BELOW   [ CALENDAR cube ] (материализуется каждый цикл с pop-анимацией)
 *   FLOOR   curved stage с фиолетовой glow-дорожкой и бегущей искрой
 *   RIGHT   3 гуманоида: sphere-head + pill-body,
 *           gloss-материал, плавно «плывут» справа-налево в портал
 *
 * Цикл: CYCLE_PER_FIGURE × HUMANOIDS, плавно и бесшовно.
 */

const HUMANOIDS = 3;
const CYCLE_PER_FIGURE = 2.8; // время между входами в портал (секунды)
const TOTAL_CYCLE = CYCLE_PER_FIGURE * HUMANOIDS;

export function HeroPortalAnimation() {
  const reduce = useReducedMotion();

  return (
    <div
      className="relative mx-auto w-full max-w-[1000px] h-[340px] sm:h-[420px] md:h-[480px] select-none"
      aria-hidden
    >
      {/* Curved stage + glow trail */}
      <Stage reduce={!!reduce} />

      {/* Portal (LEFT) */}
      <div className="absolute z-[4]" style={{ left: "16%", top: "26%" }}>
        <Portal reduce={!!reduce} />
      </div>

      {/* Calendar output — прямо под порталом */}
      <div className="absolute z-[6]" style={{ left: "23%", top: "68%" }}>
        <CalendarCube reduce={!!reduce} />
      </div>

      {/* 3 гуманоида: справа идут к порталу */}
      {Array.from({ length: HUMANOIDS }).map((_, i) => (
        <Humanoid key={i} index={i} reduce={!!reduce} />
      ))}
    </div>
  );
}

/* ========================================================= */
/*  Stage                                                     */
/* ========================================================= */

function Stage({ reduce }: { reduce: boolean }) {
  return (
    <svg
      viewBox="0 0 1000 480"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="floor-base" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.14)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="floor-trail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(167,139,250,0)" />
          <stop offset="22%" stopColor="rgba(167,139,250,0.9)" />
          <stop offset="55%" stopColor="rgba(124,111,232,1)" />
          <stop offset="90%" stopColor="rgba(94,234,212,0.5)" />
          <stop offset="100%" stopColor="rgba(94,234,212,0)" />
        </linearGradient>
        <radialGradient id="portal-halo" cx="26%" cy="82%" r="50%">
          <stop offset="0%" stopColor="rgba(167,139,250,0.6)" />
          <stop offset="65%" stopColor="rgba(167,139,250,0)" />
        </radialGradient>
        <filter id="trail-blur" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Halo под порталом */}
      <ellipse cx="260" cy="410" rx="400" ry="95" fill="url(#portal-halo)" />

      {/* Основная линия пола */}
      <path
        d="M 60 400 Q 520 490, 980 320"
        stroke="url(#floor-base)"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Фиолетовая glow-дорожка (две кривых: blur и sharp) */}
      <path
        d="M 230 420 Q 640 470, 980 330"
        stroke="url(#floor-trail)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
        filter="url(#trail-blur)"
      />
      <motion.path
        d="M 230 420 Q 640 470, 980 330"
        stroke="url(#floor-trail)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Бегущая искра вдоль дорожки */}
      {!reduce && (
        <motion.circle
          r="4.5"
          fill="#F0EBFF"
          animate={{ offsetDistance: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: CYCLE_PER_FIGURE * 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.15, 0.85, 1],
          }}
          style={{
            offsetPath: `path("M 230 420 Q 640 470, 980 330")`,
            filter: "drop-shadow(0 0 8px #A78BFA)",
          }}
        />
      )}
    </svg>
  );
}

/* ========================================================= */
/*  Portal                                                    */
/* ========================================================= */

function Portal({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative h-[190px] w-[140px] sm:h-[230px] sm:w-[170px]">
      {/* Наружный halo */}
      <motion.div
        className="absolute -inset-10 rounded-[80px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(167,139,250,0.55) 0%, transparent 70%)",
          filter: "blur(28px)",
        }}
        animate={reduce ? undefined : { opacity: [0.55, 0.95, 0.55] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg viewBox="0 0 170 230" className="relative h-full w-full">
        <defs>
          <radialGradient id="portal-core" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
            <stop offset="30%" stopColor="rgba(240,232,255,0.85)" />
            <stop offset="65%" stopColor="rgba(167,139,250,0.4)" />
            <stop offset="100%" stopColor="rgba(10,9,21,0)" />
          </radialGradient>
          <linearGradient id="portal-frame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0.5)" />
          </linearGradient>
          <linearGradient id="portal-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0.08)" />
          </linearGradient>
        </defs>

        {/* Aperture */}
        <rect x="12" y="8" width="146" height="214" rx="71" fill="url(#portal-core)" />
        <rect x="12" y="8" width="146" height="214" rx="71" fill="url(#portal-glass)" />
        {/* Frame */}
        <rect
          x="12"
          y="8"
          width="146"
          height="214"
          rx="71"
          stroke="url(#portal-frame)"
          strokeWidth="1.6"
          fill="none"
        />
        {/* Top arch highlight */}
        <path
          d="M 38 10 Q 85 0 132 10"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Bottom threshold */}
        <rect x="26" y="200" width="118" height="4" rx="2" fill="rgba(255,255,255,0.55)" />
      </svg>

      {/* Пульсирующий core */}
      <motion.div
        className="pointer-events-none absolute inset-[14px] rounded-[57px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(255,255,255,0.4) 0%, transparent 55%)",
        }}
        animate={reduce ? undefined : { opacity: [0.65, 1, 0.65], scale: [1, 1.04, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Вертикальный «удар» света при входе фигурки (синхронизирован с циклом) */}
      {!reduce && (
        <motion.div
          className="pointer-events-none absolute inset-x-[20%] top-[8%] bottom-[8%] rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(167,139,250,0.5) 50%, rgba(255,255,255,0.9) 100%)",
            filter: "blur(10px)",
          }}
          animate={{ opacity: [0, 0, 0.8, 0], scaleY: [0.7, 0.7, 1.15, 0.7] }}
          transition={{
            duration: CYCLE_PER_FIGURE,
            repeat: Infinity,
            times: [0, 0.7, 0.85, 1],
            ease: "easeOut",
          }}
        />
      )}
    </div>
  );
}

/* ========================================================= */
/*  CalendarCube — материализуется каждый цикл (pop + check)  */
/* ========================================================= */

function CalendarCube({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      className="relative"
      animate={
        reduce
          ? undefined
          : {
              scale: [0.5, 1.08, 1, 1, 0.5],
              opacity: [0, 1, 1, 1, 0],
              y: [6, -4, 0, 0, 6],
            }
      }
      transition={{
        duration: CYCLE_PER_FIGURE,
        repeat: Infinity,
        times: [0, 0.2, 0.35, 0.85, 1],
        ease: [0.33, 1, 0.68, 1],
      }}
    >
      {/* Под-платформа glow */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-full mt-2 h-7 w-[120%] -translate-x-1/2 rounded-full blur-xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(167,139,250,0.8), transparent 70%)",
        }}
        animate={reduce ? undefined : { opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Sparkle on materialization */}
      {!reduce && (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(167,139,250,0.4) 40%, transparent 70%)",
            filter: "blur(6px)",
          }}
          animate={{ opacity: [0, 1, 0, 0, 0], scale: [0.4, 1.4, 1, 1, 1] }}
          transition={{
            duration: CYCLE_PER_FIGURE,
            repeat: Infinity,
            times: [0, 0.15, 0.3, 0.8, 1],
            ease: "easeOut",
          }}
        />
      )}

      <svg viewBox="0 0 120 120" className="relative h-[88px] w-[88px] sm:h-[104px] sm:w-[104px]">
        <defs>
          <linearGradient id="cube-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C3B3FF" />
            <stop offset="45%" stopColor="#9E88F5" />
            <stop offset="100%" stopColor="#7C6FE8" />
          </linearGradient>
          <linearGradient id="cube-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F6F2FF" />
            <stop offset="100%" stopColor="#C9BDF6" />
          </linearGradient>
          <linearGradient id="cube-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7E6EE5" />
            <stop offset="100%" stopColor="#4E42A8" />
          </linearGradient>
          <filter id="cube-drop" x="-40%" y="-20%" width="180%" height="160%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* Drop shadow */}
        <ellipse cx="60" cy="108" rx="34" ry="5" fill="rgba(0,0,0,0.4)" filter="url(#cube-drop)" />

        {/* Top face (isometric) */}
        <polygon points="20,42 60,22 100,42 60,62" fill="url(#cube-top)" />
        {/* Ring-binder pegs */}
        <rect x="38" y="20" width="4" height="10" rx="2" fill="rgba(255,255,255,0.95)" />
        <rect x="78" y="20" width="4" height="10" rx="2" fill="rgba(255,255,255,0.95)" />
        <rect x="38" y="18" width="4" height="4" rx="2" fill="rgba(90,70,170,0.8)" />
        <rect x="78" y="18" width="4" height="4" rx="2" fill="rgba(90,70,170,0.8)" />

        {/* Front face */}
        <polygon points="20,42 60,62 60,102 20,82" fill="url(#cube-front)" />
        {/* Side face */}
        <polygon points="60,62 100,42 100,82 60,102" fill="url(#cube-side)" />

        {/* Check badge on front face */}
        <g transform="translate(23, 60)">
          <rect
            x="0"
            y="0"
            width="34"
            height="30"
            rx="4"
            fill="rgba(255,255,255,0.15)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.6"
          />
          {!reduce ? (
            <motion.path
              d="M 7 15 L 13 21 L 27 8"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ pathLength: [0, 0, 1, 1, 0] }}
              transition={{
                duration: CYCLE_PER_FIGURE,
                repeat: Infinity,
                times: [0, 0.25, 0.45, 0.85, 1],
                ease: "easeOut",
              }}
            />
          ) : (
            <path
              d="M 7 15 L 13 21 L 27 8"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>

        {/* Glossy highlight on top-left edge */}
        <polyline
          points="20,42 60,22"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}

/* ========================================================= */
/*  Humanoid — 3D gloss-материал, справа к порталу            */
/* ========================================================= */

function Humanoid({
  index,
  reduce,
}: {
  index: number;
  reduce: boolean;
}) {
  // Стартовое смещение по циклу (каждый следующий через CYCLE_PER_FIGURE)
  const delay = CYCLE_PER_FIGURE * index;

  // Небольшие различия размера/высоты — имитация глубины
  const scale = [0.95, 1.1, 1.0][index] ?? 1;
  const yOffset = ["-6%", "8%", "22%"][index] ?? "0%";

  if (reduce) {
    const leftPct = 62 + index * 12;
    return (
      <div
        className="absolute z-[3]"
        style={{ left: `${leftPct}%`, top: "34%", marginTop: yOffset, transform: `scale(${scale})` }}
      >
        <HumanoidFigure />
      </div>
    );
  }

  return (
    <motion.div
      className="absolute z-[3] will-change-transform"
      style={{ top: "34%", marginTop: yOffset }}
      initial={{ opacity: 0 }}
      animate={{
        // left-пути описывают: появление справа → плавное движение к порталу → исчезание в портале
        left: ["95%", "90%", "32%", "26%"],
        opacity: [0, 1, 1, 0],
        scale: [scale * 0.7, scale, scale * 0.95, scale * 0.5],
        filter: [
          "blur(0px) brightness(1)",
          "blur(0px) brightness(1)",
          "blur(0px) brightness(1.15)",
          "blur(9px) brightness(2.2)",
        ],
      }}
      transition={{
        duration: TOTAL_CYCLE,
        repeat: Infinity,
        delay,
        times: [0, 0.08, 0.28, 0.33], // быстрое «ускорение» у портала
        ease: "linear",
      }}
    >
      <HumanoidBob>
        <HumanoidFigure />
      </HumanoidBob>
    </motion.div>
  );
}

function HumanoidBob({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ y: [0, -5, 0, -5, 0] }}
      transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function HumanoidFigure() {
  return (
    <div className="relative w-[70px] h-[105px] sm:w-[80px] sm:h-[120px]">
      {/* BODY — egg/pill shape с 3D-освещением */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[92%] h-[64%]"
        style={{
          borderRadius: "50% 50% 46% 46% / 55% 55% 45% 45%",
          background:
            "radial-gradient(ellipse at 30% 22%, rgba(255,255,255,0.98) 0%, rgba(236,228,255,0.78) 22%, rgba(176,156,225,0.32) 62%, rgba(70,55,120,0.18) 100%)",
          boxShadow:
            // outer glow + subtle dark bottom + top highlight + left glossy kick
            "0 18px 34px rgba(167,139,250,0.42), 0 4px 12px rgba(50,30,90,0.5), inset -8px -14px 28px rgba(90,70,150,0.34), inset 10px 10px 24px rgba(255,255,255,0.6), inset 0 2px 0 rgba(255,255,255,0.4)",
        }}
      />
      {/* BODY specular */}
      <div
        className="absolute left-[14%] bottom-[24%] w-[20%] h-[24%] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.6) 0%, transparent 70%)",
          filter: "blur(1px)",
        }}
      />

      {/* HEAD — sphere */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[58%] aspect-square rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, rgba(255,255,255,1) 0%, rgba(240,232,255,0.82) 32%, rgba(176,156,225,0.4) 72%, rgba(70,55,120,0.2) 100%)",
          boxShadow:
            "0 10px 22px rgba(167,139,250,0.4), 0 2px 8px rgba(50,30,90,0.45), inset -5px -7px 18px rgba(90,70,150,0.28), inset 5px 5px 16px rgba(255,255,255,0.7)",
        }}
      />
      {/* HEAD specular (яркий блик) */}
      <div
        className="absolute left-[26%] top-[5%] w-[15%] aspect-square rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.65) 45%, transparent 75%)",
          filter: "blur(0.4px)",
        }}
      />
      {/* soft rim light on right edge of head */}
      <div
        className="absolute right-[18%] top-[14%] w-[6%] h-[18%] rounded-full pointer-events-none opacity-70"
        style={{
          background: "rgba(255,255,255,0.55)",
          filter: "blur(1.5px)",
        }}
      />
    </div>
  );
}
