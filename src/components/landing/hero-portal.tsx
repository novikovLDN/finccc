"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * HeroPortalAnimation — 1:1 с Voxr reference.
 *
 * Composition:
 *   LEFT half:   [PORTAL]  с кубом-календарем У ОСНОВАНИЯ
 *   CENTER-RIGHT: 3 гуманоида ОДНОВРЕМЕННО в очереди, непрерывно
 *                 идут по дуге к порталу
 *   FLOOR: изогнутая фиолетовая glow-трасса
 *
 * Ключевая поправка: humanoids staggered внутри loop так, что
 * одновременно видно 3 фигурки на разных фазах пути. Когда впереди
 * идущая растворяется в портале — новая появляется сзади. Конвейер.
 */

const HUMANOIDS = 3;
const WALK_DURATION = 5.4; // полный цикл одной фигурки (сек)
const STAGGER = WALK_DURATION / HUMANOIDS; // 1.8s — новая фигурка каждые ~2с

// Координаты трассы (в %) — ВНИМАНИЕ: left = 0% слева, 100% справа
const START_X = 96;  // появление справа
const PORTAL_X = 24; // точка входа в портал
const PATH_Y_START = 44; // Y в начале (выше)
const PATH_Y_MID = 56;   // в середине
const PATH_Y_END = 60;   // у входа в портал (ниже)

export function HeroPortalAnimation() {
  const reduce = useReducedMotion();

  return (
    <div
      className="relative mx-auto w-full max-w-[1100px] h-[340px] sm:h-[420px] md:h-[480px] select-none"
      aria-hidden
    >
      <StageFloor reduce={!!reduce} />

      {/* Portal */}
      <div
        className="absolute z-[4]"
        style={{ left: `${PORTAL_X}%`, top: "22%", transform: "translateX(-50%)" }}
      >
        <Portal reduce={!!reduce} />
      </div>

      {/* Calendar у основания портала */}
      <div
        className="absolute z-[6]"
        style={{ left: `${PORTAL_X}%`, top: "66%", transform: "translateX(-50%)" }}
      >
        <CalendarCube reduce={!!reduce} />
      </div>

      {/* 3 гуманоида — конвейер */}
      {Array.from({ length: HUMANOIDS }).map((_, i) => (
        <Humanoid key={i} index={i} reduce={!!reduce} />
      ))}
    </div>
  );
}

/* ========================================================= */
/*  Stage                                                     */
/* ========================================================= */

function StageFloor({ reduce }: { reduce: boolean }) {
  return (
    <svg
      viewBox="0 0 1100 480"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="floor-trail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(167,139,250,0)" />
          <stop offset="15%" stopColor="rgba(167,139,250,0.9)" />
          <stop offset="45%" stopColor="rgba(124,111,232,1)" />
          <stop offset="85%" stopColor="rgba(94,234,212,0.5)" />
          <stop offset="100%" stopColor="rgba(94,234,212,0)" />
        </linearGradient>
        <linearGradient id="floor-dim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="95%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <radialGradient id="portal-pool" cx="24%" cy="85%" r="30%">
          <stop offset="0%" stopColor="rgba(167,139,250,0.55)" />
          <stop offset="100%" stopColor="rgba(167,139,250,0)" />
        </radialGradient>
        <filter id="trail-soft" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Pool под порталом */}
      <ellipse cx="264" cy="410" rx="440" ry="80" fill="url(#portal-pool)" />

      {/* Dim far line */}
      <path
        d="M 40 380 Q 560 470, 1080 310"
        stroke="url(#floor-dim)"
        strokeWidth="1.2"
        fill="none"
      />

      {/* Glow trail — blur + sharp */}
      <path
        d="M 260 420 Q 680 470, 1060 320"
        stroke="url(#floor-trail)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
        filter="url(#trail-soft)"
      />
      <motion.path
        d="M 260 420 Q 680 470, 1060 320"
        stroke="url(#floor-trail)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
        animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Бегущая искра вдоль трассы */}
      {!reduce && (
        <motion.circle
          r="4"
          fill="#F3EDFF"
          animate={{ offsetDistance: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: WALK_DURATION,
            repeat: Infinity,
            ease: "easeIn",
            times: [0, 0.1, 0.9, 1],
          }}
          style={{
            offsetPath: `path("M 1060 320 Q 680 470, 260 420")`,
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
    <div className="relative h-[200px] w-[150px] sm:h-[240px] sm:w-[180px]">
      <motion.div
        className="absolute -inset-10 rounded-[80px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(167,139,250,0.55) 0%, transparent 68%)",
          filter: "blur(28px)",
        }}
        animate={reduce ? undefined : { opacity: [0.55, 0.92, 0.55] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg viewBox="0 0 180 240" className="relative h-full w-full">
        <defs>
          <radialGradient id="portal-core-v2" cx="50%" cy="45%" r="58%">
            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
            <stop offset="30%" stopColor="rgba(240,232,255,0.88)" />
            <stop offset="62%" stopColor="rgba(167,139,250,0.42)" />
            <stop offset="100%" stopColor="rgba(10,9,21,0)" />
          </radialGradient>
          <linearGradient id="portal-frame-v2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0.5)" />
          </linearGradient>
          <linearGradient id="portal-glass-v2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0.08)" />
          </linearGradient>
        </defs>

        <rect x="12" y="8" width="156" height="224" rx="75" fill="url(#portal-core-v2)" />
        <rect x="12" y="8" width="156" height="224" rx="75" fill="url(#portal-glass-v2)" />
        <rect
          x="12"
          y="8"
          width="156"
          height="224"
          rx="75"
          stroke="url(#portal-frame-v2)"
          strokeWidth="1.8"
          fill="none"
        />
        <path
          d="M 40 10 Q 90 0 140 10"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.4"
          fill="none"
        />
        <rect x="30" y="210" width="120" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
      </svg>

      <motion.div
        className="pointer-events-none absolute inset-[14px] rounded-[62px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(255,255,255,0.42) 0%, transparent 58%)",
        }}
        animate={reduce ? undefined : { opacity: [0.7, 1, 0.7], scale: [1, 1.04, 1] }}
        transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ========================================================= */
/*  CalendarCube — материализуется каждый STAGGER             */
/* ========================================================= */

function CalendarCube({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      className="relative"
      animate={
        reduce
          ? undefined
          : {
              scale: [0.5, 1.12, 1, 1, 0.55],
              opacity: [0, 1, 1, 1, 0],
              y: [8, -4, 0, 0, 8],
            }
      }
      transition={{
        duration: STAGGER,
        repeat: Infinity,
        times: [0, 0.22, 0.38, 0.82, 1],
        ease: [0.33, 1, 0.68, 1],
      }}
    >
      {/* Под-платформа */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-full mt-1 h-7 w-[140%] -translate-x-1/2 rounded-full blur-xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(167,139,250,0.85), transparent 72%)",
        }}
        animate={reduce ? undefined : { opacity: [0.45, 0.95, 0.45] }}
        transition={{ duration: STAGGER, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Materialization halo */}
      {!reduce && (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(167,139,250,0.5) 38%, transparent 72%)",
            filter: "blur(6px)",
          }}
          animate={{ opacity: [0, 1, 0, 0, 0], scale: [0.4, 1.5, 1, 1, 1] }}
          transition={{
            duration: STAGGER,
            repeat: Infinity,
            times: [0, 0.16, 0.32, 0.8, 1],
            ease: "easeOut",
          }}
        />
      )}

      <svg viewBox="0 0 120 120" className="relative h-[96px] w-[96px] sm:h-[112px] sm:w-[112px]">
        <defs>
          <linearGradient id="cube-front-v2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9B8FF" />
            <stop offset="45%" stopColor="#9E88F5" />
            <stop offset="100%" stopColor="#7463DF" />
          </linearGradient>
          <linearGradient id="cube-top-v2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F7F3FF" />
            <stop offset="100%" stopColor="#C9BDF6" />
          </linearGradient>
          <linearGradient id="cube-side-v2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7E6EE5" />
            <stop offset="100%" stopColor="#4A3EA3" />
          </linearGradient>
          <filter id="cube-drop-v2" x="-40%" y="-20%" width="180%" height="160%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        <ellipse cx="60" cy="108" rx="34" ry="5" fill="rgba(0,0,0,0.45)" filter="url(#cube-drop-v2)" />

        {/* Top face */}
        <polygon points="20,42 60,22 100,42 60,62" fill="url(#cube-top-v2)" />
        {/* Binder pegs */}
        <rect x="38" y="20" width="4" height="10" rx="2" fill="rgba(255,255,255,0.95)" />
        <rect x="78" y="20" width="4" height="10" rx="2" fill="rgba(255,255,255,0.95)" />
        <rect x="38" y="18" width="4" height="4" rx="2" fill="rgba(70,55,120,0.85)" />
        <rect x="78" y="18" width="4" height="4" rx="2" fill="rgba(70,55,120,0.85)" />

        {/* Front face */}
        <polygon points="20,42 60,62 60,102 20,82" fill="url(#cube-front-v2)" />
        {/* Side face */}
        <polygon points="60,62 100,42 100,82 60,102" fill="url(#cube-side-v2)" />

        {/* Check badge */}
        <g transform="translate(23, 60)">
          <rect
            x="0"
            y="0"
            width="34"
            height="30"
            rx="4"
            fill="rgba(255,255,255,0.14)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.6"
          />
          {!reduce ? (
            <motion.path
              d="M 7 15 L 13 21 L 27 8"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ pathLength: [0, 0, 1, 1, 0] }}
              transition={{
                duration: STAGGER,
                repeat: Infinity,
                times: [0, 0.28, 0.5, 0.85, 1],
                ease: "easeOut",
              }}
            />
          ) : (
            <path
              d="M 7 15 L 13 21 L 27 8"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>

        {/* Top-left highlight */}
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
/*  Humanoid — плавно идёт справа налево по дуге,             */
/*             растворяется в портале                         */
/* ========================================================= */

function Humanoid({ index, reduce }: { index: number; reduce: boolean }) {
  // Each humanoid staggered по циклу
  const delay = -STAGGER * index; // отрицательный — чтобы все стартовали сразу в разных фазах

  if (reduce) {
    const positions = [
      { left: 92, top: PATH_Y_START },
      { left: 72, top: PATH_Y_MID },
      { left: 50, top: PATH_Y_END - 3 },
    ];
    const p = positions[index] ?? positions[0];
    return (
      <div
        className="absolute z-[3]"
        style={{ left: `${p.left}%`, top: `${p.top}%`, transform: "translate(-50%, -50%)" }}
      >
        <HumanoidFigure size={index === 0 ? "sm" : index === 1 ? "md" : "lg"} />
      </div>
    );
  }

  return (
    <motion.div
      className="absolute z-[3] will-change-transform"
      style={{ transform: "translate(-50%, -50%)" }}
      initial={false}
      animate={{
        left: [`${START_X}%`, `${(START_X + PORTAL_X) / 2}%`, `${PORTAL_X + 5}%`, `${PORTAL_X}%`],
        top: [`${PATH_Y_START}%`, `${PATH_Y_MID}%`, `${PATH_Y_END}%`, `${PATH_Y_END - 2}%`],
        scale: [0.7, 1, 1.05, 0.5],
        opacity: [0, 1, 1, 0],
        filter: [
          "blur(0px) brightness(1)",
          "blur(0px) brightness(1)",
          "blur(0px) brightness(1.2)",
          "blur(10px) brightness(2.4)",
        ],
      }}
      transition={{
        duration: WALK_DURATION,
        repeat: Infinity,
        delay,
        times: [0, 0.08, 0.88, 1],
        ease: "linear",
      }}
    >
      <HumanoidBob>
        <HumanoidFigure size="md" />
      </HumanoidBob>
    </motion.div>
  );
}

function HumanoidBob({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ y: [0, -5, 0, -5, 0] }}
      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function HumanoidFigure({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim =
    size === "sm"
      ? { w: 62, h: 92 }
      : size === "lg"
        ? { w: 90, h: 132 }
        : { w: 76, h: 114 };

  return (
    <div
      className="relative"
      style={{ width: dim.w, height: dim.h }}
    >
      {/* Contact shadow */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -10,
          width: "85%",
          height: 12,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5), transparent 70%)",
          filter: "blur(3px)",
        }}
      />

      {/* BODY: egg/pill shape */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0"
        style={{
          width: "94%",
          height: "66%",
          borderRadius: "50% 50% 44% 44% / 58% 58% 42% 42%",
          background:
            "radial-gradient(ellipse at 28% 22%, rgba(255,255,255,1) 0%, rgba(236,228,255,0.82) 24%, rgba(176,156,225,0.38) 60%, rgba(70,55,120,0.22) 100%)",
          boxShadow:
            "0 20px 40px rgba(167,139,250,0.5), 0 6px 14px rgba(50,30,90,0.55), inset -10px -16px 30px rgba(90,70,150,0.36), inset 12px 12px 26px rgba(255,255,255,0.62), inset 0 2px 0 rgba(255,255,255,0.45)",
        }}
      />
      {/* BODY specular */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "14%",
          bottom: "24%",
          width: "22%",
          height: "22%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.7) 0%, transparent 70%)",
          filter: "blur(1px)",
        }}
      />
      {/* BODY rim light на правой стороне */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: "4%",
          bottom: "12%",
          width: "8%",
          height: "38%",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.4)",
          filter: "blur(2px)",
          opacity: 0.85,
        }}
      />

      {/* HEAD: sphere */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0"
        style={{
          width: "58%",
          aspectRatio: "1",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 26%, rgba(255,255,255,1) 0%, rgba(240,232,255,0.85) 32%, rgba(176,156,225,0.4) 72%, rgba(70,55,120,0.22) 100%)",
          boxShadow:
            "0 12px 24px rgba(167,139,250,0.42), 0 4px 10px rgba(50,30,90,0.48), inset -6px -8px 20px rgba(90,70,150,0.3), inset 6px 6px 18px rgba(255,255,255,0.7)",
        }}
      />
      {/* HEAD specular — bright */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "24%",
          top: "4%",
          width: "16%",
          aspectRatio: "1",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 45%, transparent 75%)",
          filter: "blur(0.4px)",
        }}
      />
      {/* HEAD rim light */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: "18%",
          top: "12%",
          width: "7%",
          height: "22%",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.5)",
          filter: "blur(1.5px)",
        }}
      />
    </div>
  );
}
