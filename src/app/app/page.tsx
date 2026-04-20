import { GlassCard } from "@/components/ui/glass-card";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <section>
        <h1 className="text-[24px] font-semibold tracking-tight">Доброе утро</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Здесь появится картина ваших финансов. Каркас готов — виджеты придут на следующем шаге.
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["Net Flow", "Breakdown", "Последние операции"].map((t) => (
          <GlassCard key={t} live className="h-[180px] p-5">
            <div className="text-[13px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              {t}
            </div>
            <div className="mt-6 h-20 rounded-xl bg-[var(--surface-3)]" />
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
