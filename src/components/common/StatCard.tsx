import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="premium-card group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_rgb(0_0_0/0.5)]">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/80">{label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-gradient">{value}</div>
          {delta && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              {delta}
            </div>
          )}
        </div>
        {Icon && (
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 text-primary grid place-items-center ring-1 ring-inset ring-primary/20">
            <Icon className="size-5" />
          </div>
        )}
      </div>
    </div>
  );
}