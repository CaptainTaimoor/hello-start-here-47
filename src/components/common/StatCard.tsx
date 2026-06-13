import type { LucideIcon } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { useRef, type MouseEvent } from "react";
import { NumberTicker } from "@/components/magic/NumberTicker";

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
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mx.set(x);
    my.set(y);
    ry.set(((x - rect.width / 2) / rect.width) * 8);
    rx.set((-(y - rect.height / 2) / rect.height) * 8);
  }

  function handleLeave() {
    rx.set(0);
    ry.set(0);
  }

  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, oklch(0.82 0.16 205 / 0.18), transparent 60%)`;

  const numeric = typeof value === "number" ? value : Number.isFinite(Number(value)) ? Number(value) : null;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className="premium-card group relative overflow-hidden p-5 will-change-transform"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80 font-medium">{label}</div>
          <div className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-gradient tabular-nums">
            {numeric !== null ? <NumberTicker value={numeric} /> : value}
          </div>
          {delta && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              {delta}
            </div>
          )}
        </div>
        {Icon && (
          <motion.div
            whileHover={{ rotate: 8, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="size-11 rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent text-primary grid place-items-center ring-1 ring-inset ring-primary/25 shadow-[0_0_24px_-6px_var(--primary)]"
          >
            <Icon className="size-5" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}