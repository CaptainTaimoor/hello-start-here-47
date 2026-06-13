import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  Active: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  "On Track": "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Good: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Done: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Paid: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Live: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Passed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Verified: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Received: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Recorded: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  "In Progress": "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "In Review": "bg-blue-500/15 text-blue-600 border-blue-500/30",
  Scheduled: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  Rendering: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  Uploaded: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "At Risk": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Average: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Medium: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  "Off Track": "bg-red-500/15 text-red-600 border-red-500/30",
  Poor: "bg-red-500/15 text-red-600 border-red-500/30",
  High: "bg-red-500/15 text-red-600 border-red-500/30",
  Failed: "bg-red-500/15 text-red-600 border-red-500/30",
  Rejected: "bg-red-500/15 text-red-600 border-red-500/30",
  Missing: "bg-red-500/15 text-red-600 border-red-500/30",
  Open: "bg-red-500/15 text-red-600 border-red-500/30",
  Inactive: "bg-muted text-muted-foreground border-border",
  Paused: "bg-muted text-muted-foreground border-border",
  Closed: "bg-muted text-muted-foreground border-border",
  Low: "bg-muted text-muted-foreground border-border",
  "Coming Soon": "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ value }: { value: string }) {
  const cls = MAP[value] ?? "bg-muted text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={cn("font-medium border", cls)}>
      {value}
    </Badge>
  );
}