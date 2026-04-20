import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          aria-hidden
          className="absolute left-1/2 top-[-10%] h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--accent-primary) 40%, transparent), transparent)",
            filter: "blur(40px)",
          }}
        />
        <div
          aria-hidden
          className="absolute right-[-10%] top-[30%] h-[420px] w-[680px] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--accent-mint) 40%, transparent), transparent)",
            filter: "blur(56px)",
          }}
        />
      </div>

      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div
            className="glass flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "color-mix(in oklab, var(--accent-primary) 20%, transparent)" }}
          >
            <span className="text-sm font-semibold text-[var(--accent-primary)]">M</span>
          </div>
          <span className="text-[17px] font-semibold tracking-tight">Mindful Money</span>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/app"
            className="rounded-full px-4 py-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Войти
          </Link>
          <Link
            href="/app"
            className="rounded-full px-4 py-2 font-medium text-white shadow-sm transition-transform hover:scale-[0.98] active:scale-95"
            style={{ background: "var(--accent-primary)" }}
          >
            Начать за 1 минуту
          </Link>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-[1200px] px-6 pt-16 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-mint)]" />
            Wellness-first финансы · 2026
          </span>
          <h1
            className="mt-6 text-balance font-semibold tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1.08 }}
          >
            Спокойно о ваших <span className="text-[var(--accent-primary)]">деньгах</span> — без
            стыда и без тревоги
          </h1>
          <p className="mt-6 text-pretty text-[var(--text-secondary)] text-lg leading-relaxed">
            Мы не говорим «ты тратишь слишком много». Мы показываем паттерны, мягкие инсайты и
            красивые графики — а решение всегда за вами.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="rounded-full px-6 py-3 font-medium text-white shadow-lg transition-transform hover:scale-[0.98] active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent-primary), color-mix(in oklab, var(--accent-primary) 60%, var(--accent-mint)))",
              }}
            >
              Открыть приложение →
            </Link>
            <Link
              href="#features"
              className="glass rounded-full px-6 py-3 font-medium transition-all hover:-translate-y-0.5"
            >
              Как это работает
            </Link>
          </div>
        </div>

        <div id="features" className="mt-24 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Мягкие AI-инсайты",
              body: "До 3 наблюдений в неделю. Мы замечаем паттерны и предлагаем подумать — без упрёков.",
              tint: "var(--accent-primary)",
            },
            {
              title: "Sankey-потоки",
              body: "Видите, откуда и куда движутся деньги. Одна картина вместо таблицы.",
              tint: "var(--accent-mint)",
            },
            {
              title: "Мультивалютность",
              body: "До 5 валют с авто-конвертацией по курсу даты транзакции. Всё в одной картине.",
              tint: "var(--accent-sky)",
            },
          ].map((f) => (
            <div key={f.title} className="glass glass-live rounded-2xl p-6">
              <div
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `color-mix(in oklab, ${f.tint} 20%, transparent)` }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: f.tint }} />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto w-full max-w-[1200px] px-6 pb-10 text-center text-xs text-[var(--text-tertiary)]">
        Mindful Money · Это наблюдения, а не финансовый совет. Решение всегда за вами.
      </footer>
    </main>
  );
}
