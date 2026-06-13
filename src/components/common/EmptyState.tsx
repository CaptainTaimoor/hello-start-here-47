import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { EMPTY_COPY } from "@/lib/copy";

export function EmptyState({
  icon: Icon = Inbox,
  title = EMPTY_COPY.generic.title,
  description = EMPTY_COPY.generic.description,
  action,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-card/30 backdrop-blur-xl px-8 py-16 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-56 rounded-full blur-3xl opacity-50"
        style={{
          background:
            "radial-gradient(circle, oklch(0.78 0.17 205 / 0.35), oklch(0.55 0.22 285 / 0.2) 50%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto grid size-14 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-white/10 backdrop-blur-md">
        <Icon className="size-6 text-primary" strokeWidth={1.5} />
      </div>
      <div className="relative mt-5 serif-display text-2xl text-foreground">{title}</div>
      {description && (
        <div className="relative mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">{description}</div>
      )}
      {action && <div className="relative mt-6">{action}</div>}
    </div>
  );
}