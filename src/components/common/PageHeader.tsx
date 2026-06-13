import type { ReactNode } from "react";
import { motion } from "motion/react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  // Split title for italic accent on the last word (editorial bento style)
  const parts = title.trim().split(" ");
  const head = parts.slice(0, -1).join(" ");
  const accent = parts[parts.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-wrap items-end justify-between gap-4 mb-8 pb-6 border-b border-white/[0.06]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -left-10 size-64 rounded-full bg-primary/15 blur-3xl opacity-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 right-1/3 size-48 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, oklch(0.65 0.22 280 / 0.4), transparent 70%)" }}
      />
      <div className="relative min-w-0">
        <h1 className="serif-display text-4xl md:text-5xl text-foreground">
          {head ? <>{head} <span className="italic text-primary">{accent}</span></> : <span className="italic text-primary">{accent}</span>}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl leading-relaxed font-light">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="relative flex items-center gap-2 flex-wrap">{actions}</div>}
    </motion.div>
  );
}