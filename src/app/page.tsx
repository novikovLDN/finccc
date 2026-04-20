import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Eye } from "lucide-react";
import { HeroPortalAnimation } from "@/components/landing/hero-portal";

/**
 * Landing — full-bleed dark hero 1:1 с Voxr reference.
 *
 * Layout:
 *   ┌─ HEADER ─────────────────────────────────────────┐
 *   │                                                   │
 *   │  Text (left)              Pills (right, stacked)  │
 *   │  Text                                             │
 *   │  Text                                             │
 *   │  Description                                      │
 *   │  [CTA pill]                                       │
 *   │                                                   │
 *   │  [============ PORTAL SCENE full-width =========] │
 *   │                                                   │
 *   └───────────────────────────────────────────────────┘
 */
export default function LandingPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0a0915] text-white">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          aria-hidden
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(1200px 600px at 50% -10%, rgba(124,111,232,0.35), transparent 55%), radial-gradient(900px 500px at 80% 30%, rgba(94,234,212,0.18), transparent 60%), radial-gradient(700px 400px at 10% 70%, rgba(167,139,250,0.16), transparent 55%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.6) 0.6px, transparent 0.6px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* HEADER */}
      <header className="relative z-20 mx-auto flex w-full max-w-[1360px] items-center justify-between px-5 sm:px-8 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #A78BFA, #5EEAD4)" }}
          >
            <span className="text-sm font-bold text-[#0a0915]">M</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Mindful Money</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[14px] text-white/70">
          <a href="#features" className="hover:text-white transition-colors">
            Возможности
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Тарифы
          </a>
          <a href="#about" className="hover:text-white transition-colors">
            О нас
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="#contact"
            className="hidden sm:inline-flex h-10 items-center rounded-full bg-white/[0.06] px-5 text-[13px] font-medium text-white/80 hover:bg-white/[0.10] transition-colors"
          >
            Связаться
          </Link>
          <Link
            href="/app"
            className="group inline-flex items-center gap-1 rounded-full bg-white pl-5 pr-1 py-1 text-[13px] font-semibold text-[#0a0915] hover:scale-[0.98] transition-transform"
          >
            Войти
            <span className="ml-2 flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "#A78BFA" }}>
              <ArrowRight className="size-4 text-white transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </header>

      {/* HERO — full viewport, animation integrated */}
      <section className="relative mx-auto w-full max-w-[1360px] px-5 sm:px-8 pt-4 sm:pt-8 min-h-[calc(100dvh-80px)]">
        {/* TOP: text + pills в grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-14 items-start relative z-10">
          {/* LEFT: heading + copy + CTA */}
          <div className="relative">
            <h1
              className="font-semibold tracking-tight leading-[1.02]"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
            >
              <span className="text-white">Хватит упрекать себя</span>{" "}
              <span className="text-white">за деньги.</span>{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #E9E3FF 0%, #A78BFA 55%, #5EEAD4 100%)",
                }}
              >
                Начните спокойно их понимать.
              </span>
            </h1>

            <p className="mt-7 max-w-[540px] text-[15px] sm:text-[16px] leading-relaxed text-white/65">
              Wellness-first платформа учёта личных финансов. Мы замечаем паттерны,
              мягко делимся наблюдениями и показываем красивые графики — решение
              всегда остаётся за вами.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/app"
                className="group inline-flex items-center gap-1 rounded-full bg-white pl-6 pr-1 py-1.5 text-[14px] font-semibold text-[#0a0915] hover:scale-[0.98] transition-transform"
              >
                Попробовать
                <span className="ml-3 flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "#A78BFA" }}>
                  <ArrowRight className="size-4 text-white transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <Link
                href="#features"
                className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/[0.04] px-5 text-[13px] font-medium text-white/80 hover:bg-white/[0.08] transition-colors"
              >
                Как это работает
              </Link>
            </div>
          </div>

          {/* RIGHT: pills stacked */}
          <div className="flex flex-col items-end gap-3 sm:gap-4 lg:mt-4">
            <Pill icon={<Sparkles className="size-3.5" style={{ color: "#A78BFA" }} />}>
              Спокойные AI-инсайты до 3 в неделю
            </Pill>
            <Pill icon={<ShieldCheck className="size-3.5" style={{ color: "#5EEAD4" }} />}>
              Без красных цифр и упрёков
            </Pill>
            <Pill icon={<Eye className="size-3.5" style={{ color: "#A5B4FC" }} />}>
              Видим паттерны за вас
            </Pill>
          </div>
        </div>

        {/* ANIMATION — full-bleed bottom, больше viewport, интегрирована как фон */}
        <div className="relative z-0 -mx-5 sm:-mx-8 mt-6 sm:mt-10 md:-mt-4">
          <div className="pointer-events-none">
            <HeroPortalAnimation />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8 py-16"
      >
        <h2
          className="font-semibold tracking-tight"
          style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
        >
          Что внутри
        </h2>
        <p className="mt-3 max-w-xl text-white/60 text-[15px] leading-relaxed">
          Семь разделов, построенных вокруг одного: дать вам спокойствие и контроль.
        </p>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {[
            {
              title: "Sankey-потоки",
              body: "Видите, откуда и куда движутся деньги. Одна картина вместо таблицы.",
              tint: "#A78BFA",
            },
            {
              title: "Мягкие AI-инсайты",
              body: "Замечаем паттерны и предлагаем подумать — без упрёков и тревоги.",
              tint: "#5EEAD4",
            },
            {
              title: "Мультивалютность",
              body: "До 5 валют с авто-конвертацией по курсу даты транзакции.",
              tint: "#A5B4FC",
            },
            {
              title: "Цели накоплений",
              body: "Реалистичный прогноз даты достижения. Celebration без давления.",
              tint: "#FDBA74",
            },
            {
              title: "Подписки",
              body: "Автодетекция повторяющихся платежей. Видите всё одной картиной.",
              tint: "#A78BFA",
            },
            {
              title: "Бюджеты-ориентиры",
              body: "Flexible-методология. Никаких envelope, никакого давления.",
              tint: "#5EEAD4",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-5 backdrop-blur-md transition-transform hover:-translate-y-0.5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: `color-mix(in oklab, ${f.tint} 22%, transparent)` }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: f.tint }} />
              </div>
              <h3 className="text-[16px] font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-[13.5px] text-white/55 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8 pb-12">
        <div
          className="rounded-3xl p-6 sm:p-10"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(167,139,250,0.18), transparent 55%), radial-gradient(circle at 80% 70%, rgba(94,234,212,0.14), transparent 55%), rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h3
            className="font-semibold tracking-tight"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
          >
            Откройте приложение за 30 секунд
          </h3>
          <p className="mt-2 text-white/60">
            Без регистрации, без рекламы, без передачи данных третьим сторонам.
          </p>
          <div className="mt-6">
            <Link
              href="/app"
              className="group inline-flex items-center gap-1 rounded-full bg-white pl-6 pr-1 py-1.5 text-[14px] font-semibold text-[#0a0915] hover:scale-[0.98] transition-transform"
            >
              Открыть Mindful Money
              <span className="ml-3 flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "#A78BFA" }}>
                <ArrowRight className="size-4 text-white transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/35">
          Это наблюдения, а не финансовый совет. Решение всегда за вами.
        </p>
      </footer>
    </main>
  );
}

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] sm:text-[14px] font-medium text-white/80 backdrop-blur-md"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        {icon}
      </span>
      {children}
    </div>
  );
}
