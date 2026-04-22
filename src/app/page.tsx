import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LiveDashboardPreview } from "@/components/landing/live-dashboard-preview";

/**
 * Landing — editorial-fintech direction.
 *
 * Типографика: Fraunces (display serif) × Inter (body) × Geist Mono (numbers).
 * Палитра: warm cream / ink / hunter-green / honey.
 * Без purple gradients. Без glass. Без dark-tech vibes.
 * Это высокоранговая wellness-публикация о деньгах.
 */
export default function LandingPage() {
  return (
    <main className="landing-theme landing-paper min-h-dvh text-[color:var(--lp-ink)]" style={{ background: "var(--lp-cream)" }}>
      {/* Subtle grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(26,22,18,0.35) 1px, transparent 1px)",
          backgroundSize: "2.2px 2.2px",
          mixBlendMode: "multiply",
        }}
      />

      <NavBar />
      <Hero />
      <Masthead />
      <Manifesto />
      <VoiceContrast />
      <Metrics />
      <FinalCTA />
      <Footer />
    </main>
  );
}

/* ============================================================ */
/*  NAV                                                          */
/* ============================================================ */

function NavBar() {
  return (
    <header className="relative z-30 mx-auto flex w-full max-w-[1340px] items-center justify-between px-6 py-6 md:px-10 md:py-7">
      <Link href="/" className="flex items-center gap-2.5">
        <svg viewBox="0 0 28 28" className="h-7 w-7">
          <defs>
            <linearGradient id="lp-logo" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1E3A2E" />
              <stop offset="100%" stopColor="#2D5A4F" />
            </linearGradient>
          </defs>
          <circle cx="14" cy="14" r="13" fill="url(#lp-logo)" />
          <path
            d="M 8 10 L 8 19 M 8 10 L 14 15 L 20 10 M 20 10 L 20 19"
            stroke="#F8F4EC"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-serif text-[18px] font-medium tracking-tight" style={{ fontVariationSettings: '"opsz" 144' }}>
          Mindful Money
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 text-[13.5px] text-[color:var(--lp-ink-soft)]">
        <a href="#manifesto" className="hover:text-[color:var(--lp-ink)] transition-colors">Манифест</a>
        <a href="#voice" className="hover:text-[color:var(--lp-ink)] transition-colors">Голос</a>
        <a href="#numbers" className="hover:text-[color:var(--lp-ink)] transition-colors">Цифры</a>
      </nav>

      <div className="flex items-center gap-1.5">
        <Link
          href="/app"
          className="hidden sm:inline-flex h-10 items-center rounded-full border border-[color:var(--lp-line)] bg-[color:var(--lp-paper)] px-4 text-[13px] font-medium hover:bg-[color:var(--lp-cream-deep)] transition-colors"
        >
          Войти
        </Link>
        <Link
          href="/app"
          className="group inline-flex h-10 items-center gap-1.5 rounded-full bg-[color:var(--lp-ink)] px-5 text-[13px] font-medium text-[color:var(--lp-cream)] transition-transform hover:scale-[0.98]"
        >
          Открыть приложение
          <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </header>
  );
}

/* ============================================================ */
/*  HERO — editorial split                                       */
/* ============================================================ */

function Hero() {
  return (
    <section className="relative mx-auto w-full max-w-[1340px] px-6 pt-6 pb-24 md:px-10 md:pt-10 md:pb-28">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.18fr_1fr] lg:gap-14">
        {/* LEFT: typography */}
        <div className="relative pt-4 md:pt-8">
          <Kicker>вып. №01 · Март 2026</Kicker>

          <h1
            className="mt-8 font-serif font-medium tracking-tight"
            style={{
              fontSize: "clamp(2.75rem, 6.2vw, 5.75rem)",
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
              fontVariationSettings: '"SOFT" 35, "opsz" 144',
            }}
          >
            Спокойно{" "}
            <em
              className="not-italic"
              style={{
                fontStyle: "italic",
                fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
                color: "var(--lp-accent)",
              }}
            >
              о&nbsp;ваших
            </em>
            <br />
            деньгах —{" "}
            <em
              style={{
                fontStyle: "italic",
                fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
                color: "var(--lp-accent)",
              }}
            >
              без&nbsp;упрёка.
            </em>
          </h1>

          <p className="mt-8 max-w-[480px] text-[16px] leading-[1.6] text-[color:var(--lp-ink-soft)]">
            Мы не говорим «ты тратишь слишком много». Мы замечаем паттерны
            и предлагаем подумать — <span className="font-serif italic">а решение всегда остаётся за вами.</span>
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--lp-ink)] pl-6 pr-3 text-[14px] font-medium text-[color:var(--lp-cream)] transition-transform hover:scale-[0.985]"
            >
              Открыть за 30 секунд
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: "var(--lp-honey)" }}
              >
                <ArrowUpRight className="size-4 text-[color:var(--lp-ink)]" />
              </span>
            </Link>
            <Link
              href="#manifesto"
              className="inline-flex h-12 items-center rounded-full border border-[color:var(--lp-line)] bg-[color:var(--lp-paper)] px-5 text-[13.5px] font-medium hover:bg-[color:var(--lp-cream-deep)] transition-colors"
            >
              Как мы думаем →
            </Link>
          </div>

          {/* Hero stats */}
          <dl className="mt-14 grid max-w-[460px] grid-cols-3 gap-4 border-t border-[color:var(--lp-line-soft)] pt-6">
            <HeroStat n="0₽" label="Реклама" />
            <HeroStat n="3" label="Инсайта в неделю" />
            <HeroStat n="5" label="Валют сразу" />
          </dl>
        </div>

        {/* RIGHT: live product */}
        <div className="relative">
          <LiveDashboardPreview />
        </div>
      </div>
    </section>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-[color:var(--lp-line)]" aria-hidden />
      <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.28em] text-[color:var(--lp-ink-muted)]">
        {children}
      </span>
    </div>
  );
}

function HeroStat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div
        className="font-serif leading-none text-[color:var(--lp-ink)]"
        style={{ fontSize: "32px", fontVariationSettings: '"SOFT" 50, "opsz" 144' }}
      >
        {n}
      </div>
      <div className="mt-1.5 text-[11px] leading-snug text-[color:var(--lp-ink-muted)]">
        {label}
      </div>
    </div>
  );
}

/* ============================================================ */
/*  MASTHEAD — типографический ribbon                            */
/* ============================================================ */

function Masthead() {
  return (
    <section className="relative overflow-hidden border-y border-[color:var(--lp-line-soft)]" style={{ background: "var(--lp-paper)" }}>
      <div className="mx-auto flex w-full max-w-[1340px] items-center gap-12 px-6 py-6 md:px-10">
        <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.28em] text-[color:var(--lp-ink-muted)] shrink-0">
          Что мы делаем
        </span>
        <div className="flex flex-1 flex-wrap items-center gap-x-10 gap-y-3 text-[color:var(--lp-ink-soft)]">
          {[
            "Sankey-потоки",
            "AI-инсайты без упрёка",
            "Мультивалютность",
            "Цели накоплений",
            "Автодетекция подписок",
            "Мягкие бюджеты",
          ].map((t, i) => (
            <span key={t} className="flex items-center gap-3">
              {i > 0 && <span className="h-1 w-1 rounded-full bg-[color:var(--lp-line)]" />}
              <span className="font-serif text-[17px] italic" style={{ fontVariationSettings: '"SOFT" 100, "opsz" 36' }}>
                {t}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/*  MANIFESTO — 3 принципа в editorial-сетке                     */
/* ============================================================ */

function Manifesto() {
  const principles = [
    {
      n: "I.",
      title: "Уважение вместо управления",
      body: "Мы не говорим вам, что делать. Мы показываем, что вы делаете, и предлагаем подумать. Финальное решение всегда за вами.",
    },
    {
      n: "II.",
      title: "Спокойствие вместо тревоги",
      body: "Никакого красного для денег. Никаких тревожных восклицаний. Предупреждения — это наблюдения, а не обвинения.",
    },
    {
      n: "III.",
      title: "Прогресс, а не идеальность",
      body: "Нет нулевой точки провала. Прогресс-бар начинается с 1% и медленно растёт. Частичное использование приносит ценность.",
    },
  ];

  return (
    <section id="manifesto" className="mx-auto w-full max-w-[1340px] px-6 py-24 md:px-10 md:py-32">
      <div className="grid grid-cols-1 gap-16 md:grid-cols-[0.9fr_1.4fr] md:gap-20">
        <div className="md:sticky md:top-20 md:self-start">
          <Kicker>манифест</Kicker>
          <h2
            className="mt-6 font-serif font-medium"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              fontVariationSettings: '"SOFT" 40, "opsz" 144',
            }}
          >
            Три принципа,
            <br />
            на которых{" "}
            <em
              style={{
                fontStyle: "italic",
                fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
                color: "var(--lp-accent)",
              }}
            >
              мы стоим.
            </em>
          </h2>
          <p className="mt-5 max-w-[360px] text-[14.5px] leading-[1.65] text-[color:var(--lp-ink-soft)]">
            Если решение противоречит хотя&nbsp;бы одному — мы от него отказываемся.
            Даже если оно добавляет метрику.
          </p>
        </div>

        <ol className="space-y-14">
          {principles.map((p) => (
            <li key={p.n} className="grid grid-cols-[auto_1fr] gap-6 border-t border-[color:var(--lp-line-soft)] pt-8">
              <span
                className="font-serif text-[color:var(--lp-accent)]"
                style={{
                  fontSize: "32px",
                  lineHeight: 1,
                  fontStyle: "italic",
                  fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
                }}
              >
                {p.n}
              </span>
              <div>
                <h3
                  className="font-serif"
                  style={{
                    fontSize: "clamp(1.35rem, 2.2vw, 1.85rem)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                    fontVariationSettings: '"SOFT" 50, "opsz" 144',
                  }}
                >
                  {p.title}
                </h3>
                <p className="mt-3.5 max-w-[520px] text-[15px] leading-[1.7] text-[color:var(--lp-ink-soft)]">
                  {p.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ============================================================ */
/*  VOICE — bad vs good copy                                     */
/* ============================================================ */

function VoiceContrast() {
  const rows = [
    {
      bad: "Вы превысили бюджет на еду на 23%! Внимание!",
      good: "Бюджет прошёл 123%. Это ваш месяц, и вы можете захотеть именно этого.",
    },
    {
      bad: "Срочно отмените 11 подписок — вы теряете деньги!",
      good: "У вас 11 подписок на 8 450 ₽ в месяц. Часть точно нужна. Решать вам.",
    },
    {
      bad: "⚠ Вы потратили на кофе слишком много!",
      good: "Мы заметили, что на кофе ушло около 4 200 ₽ за неделю. Ни хорошо, ни плохо.",
    },
  ];

  return (
    <section
      id="voice"
      className="relative overflow-hidden"
      style={{ background: "var(--lp-ink)", color: "var(--lp-cream)" }}
    >
      {/* Warm vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 60% at 80% 0%, rgba(212,167,62,0.2), transparent 60%), radial-gradient(50% 50% at 0% 100%, rgba(157,183,169,0.15), transparent 60%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1340px] px-6 py-24 md:px-10 md:py-32">
        <div className="flex items-center gap-3 text-[color:var(--lp-cream)]/60">
          <span className="h-px w-8 bg-[color:var(--lp-cream)]/20" />
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.28em]">
            голос
          </span>
        </div>

        <h2
          className="mt-6 max-w-[780px] font-serif"
          style={{
            fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            fontVariationSettings: '"SOFT" 40, "opsz" 144',
          }}
        >
          Как говорят другие —{" "}
          <em
            style={{
              fontStyle: "italic",
              fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
              color: "var(--lp-honey)",
            }}
          >
            и&nbsp;как говорим мы.
          </em>
        </h2>

        <div className="mt-14 grid gap-3">
          {rows.map((r, i) => (
            <div
              key={i}
              className="grid items-stretch overflow-hidden rounded-2xl border border-white/10 md:grid-cols-2"
            >
              <blockquote className="relative p-6 md:p-8" style={{ background: "rgba(232,180,160,0.06)" }}>
                <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[color:var(--lp-blush)]">
                  ❌ Конкуренты
                </div>
                <p className="font-serif text-[17px] leading-[1.5] text-white/80 line-through decoration-[color:var(--lp-blush)]/60 decoration-1" style={{ fontVariationSettings: '"SOFT" 60, "opsz" 144' }}>
                  «{r.bad}»
                </p>
              </blockquote>
              <blockquote className="relative border-t border-white/10 p-6 md:border-l md:border-t-0 md:p-8" style={{ background: "rgba(157,183,169,0.08)" }}>
                <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: "#9DB7A9" }}>
                  ✓ Mindful Money
                </div>
                <p className="font-serif text-[17px] leading-[1.5] text-white" style={{ fontVariationSettings: '"SOFT" 60, "opsz" 144' }}>
                  «{r.good}»
                </p>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/*  METRICS                                                      */
/* ============================================================ */

function Metrics() {
  const data = [
    { n: "40%", label: "D7 retention таргет", note: "Верх категории" },
    { n: "≥50", label: "NPS целевой", note: "Критично для wellness-позиции" },
    { n: "60%", label: "Снижение финансового стресса", note: "Самоотчёты через 3 мес." },
    { n: "4×", label: "Сессий в неделю", note: "Среднее на активного" },
  ];

  return (
    <section id="numbers" className="mx-auto w-full max-w-[1340px] px-6 py-24 md:px-10 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Kicker>цифры</Kicker>
          <h2
            className="mt-6 max-w-[700px] font-serif"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              fontVariationSettings: '"SOFT" 40, "opsz" 144',
            }}
          >
            Метрики, которые{" "}
            <em
              style={{
                fontStyle: "italic",
                fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
                color: "var(--lp-accent)",
              }}
            >
              важны только если вам стало спокойнее.
            </em>
          </h2>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-[color:var(--lp-line-soft)] md:grid-cols-4" style={{ background: "var(--lp-line-soft)" }}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-col gap-3 p-6 md:p-8" style={{ background: "var(--lp-paper)" }}>
            <div
              className="font-serif leading-none"
              style={{
                fontSize: "clamp(2.5rem, 4.5vw, 4rem)",
                letterSpacing: "-0.03em",
                fontVariationSettings: '"SOFT" 40, "opsz" 144',
                color: "var(--lp-accent)",
              }}
            >
              {d.n}
            </div>
            <div className="mt-auto">
              <div className="text-[13px] font-medium text-[color:var(--lp-ink)]">{d.label}</div>
              <div className="mt-1 text-[11.5px] text-[color:var(--lp-ink-muted)]">{d.note}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ */
/*  FINAL CTA                                                    */
/* ============================================================ */

function FinalCTA() {
  return (
    <section className="mx-auto w-full max-w-[1340px] px-6 pb-20 md:px-10 md:pb-28">
      <div
        className="relative overflow-hidden rounded-[32px] p-10 md:p-16"
        style={{
          background:
            "linear-gradient(130deg, var(--lp-honey) 0%, #E4B859 65%, #EBC774 100%)",
          color: "var(--lp-ink)",
        }}
      >
        {/* decorative serif ornament */}
        <div
          aria-hidden
          className="absolute -right-16 -top-24 font-serif opacity-[0.12] pointer-events-none select-none"
          style={{
            fontSize: "24rem",
            lineHeight: 1,
            fontStyle: "italic",
            fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
            color: "var(--lp-ink)",
          }}
        >
          &
        </div>

        <div className="relative max-w-[680px]">
          <h2
            className="font-serif"
            style={{
              fontSize: "clamp(2.25rem, 5vw, 4rem)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontVariationSettings: '"SOFT" 50, "opsz" 144',
            }}
          >
            Откройте приложение,{" "}
            <em style={{ fontStyle: "italic", fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
              когда станет спокойно.
            </em>
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-[color:var(--lp-ink-soft)]">
            Без регистрации, без рекламы, без передачи данных третьим сторонам.
            Вы решаете, когда и как пользоваться.
          </p>
          <Link
            href="/app"
            className="group mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--lp-ink)] pl-6 pr-3 text-[14px] font-medium text-[color:var(--lp-cream)] transition-transform hover:scale-[0.985]"
          >
            Попробовать сейчас
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--lp-honey)]">
              <ArrowUpRight className="size-4 text-[color:var(--lp-ink)]" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/*  FOOTER                                                       */
/* ============================================================ */

function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[1340px] px-6 pb-16 md:px-10">
      <div className="flex flex-col gap-6 border-t border-[color:var(--lp-line-soft)] pt-10 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-serif text-[28px] leading-none" style={{ fontVariationSettings: '"SOFT" 40, "opsz" 144', letterSpacing: "-0.015em" }}>
            Mindful Money
          </div>
          <p className="mt-3 max-w-xs text-[12.5px] leading-relaxed text-[color:var(--lp-ink-muted)]">
            Это наблюдения, а не финансовый совет. Решение всегда за вами.
          </p>
        </div>
        <div className="flex gap-10 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--lp-ink-muted)]">
          <span>© 2026</span>
          <Link href="/app" className="hover:text-[color:var(--lp-ink)] transition-colors">
            Приложение
          </Link>
          <a href="#manifesto" className="hover:text-[color:var(--lp-ink)] transition-colors">
            Манифест
          </a>
        </div>
      </div>
    </footer>
  );
}
