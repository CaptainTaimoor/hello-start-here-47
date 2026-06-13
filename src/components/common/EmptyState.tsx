import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 px-8 py-12 text-center">
      <Icon className="mx-auto size-8 text-muted-foreground" />
      <div className="mt-3 text-sm font-semibold">{title}</div>
      {description && (
        <div className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">{description}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}