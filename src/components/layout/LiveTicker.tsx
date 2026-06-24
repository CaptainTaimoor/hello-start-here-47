import { useEffect, useState } from "react";
import {
  Activity, TrendingUp, Users, Zap, Radio, Eye, CheckCircle2, AlertCircle,
  DollarSign, ShieldCheck, Server, Cpu, Database, GitBranch, ListChecks, FileSpreadsheet, GraduationCap, UserPlus,
} from "lucide-react";
import { useApp } from "@/lib/app-store";

type Item = { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone: string };

const COMMON: Item[] = [
  { icon: Radio,        label: "Live streams",   value: "6 on-air",       tone: "text-rose-400" },
  { icon: Eye,          label: "Watching now",   value: "12,480",         tone: "text-sky-400" },
  { icon: TrendingUp,   label: "Views · 24h",    value: "1.42M  ▲ 8.3%",  tone: "text-emerald-400" },
];

const BY_ROLE: Record<string, Item[]> = {
  Admin: [
    { icon: ShieldCheck, label: "Policy approvals", value: "3 pending",   tone: "text-amber-400" },
    { icon: Users,       label: "Active users",     value: "187",         tone: "text-violet-400" },
    { icon: Server,      label: "Uptime · 30d",     value: "99.98%",      tone: "text-emerald-400" },
    { icon: AlertCircle, label: "Open incidents",   value: "0",           tone: "text-emerald-400" },
  ],
  "Project Manager": [
    { icon: ListChecks,  label: "My tasks",         value: "12 open",     tone: "text-sky-400" },
    { icon: GitBranch,   label: "In review",        value: "5",           tone: "text-amber-400" },
    { icon: CheckCircle2,label: "Shipped · today",  value: "9",           tone: "text-emerald-400" },
    { icon: Users,       label: "Team online",      value: "23 / 41",     tone: "text-violet-400" },
  ],
  "Content Manager": [
    { icon: FileSpreadsheet, label: "Sheets to review", value: "4",       tone: "text-amber-400" },
    { icon: TrendingUp,  label: "Engagement",       value: "+12.4%",      tone: "text-emerald-400" },
    { icon: CheckCircle2,label: "Approved · today", value: "18",          tone: "text-emerald-400" },
  ],
  Editor: [
    { icon: ListChecks,  label: "Edit queue",       value: "7",           tone: "text-sky-400" },
    { icon: Zap,         label: "Avg render",       value: "1.8s",        tone: "text-amber-400" },
    { icon: CheckCircle2,label: "Pushed · today",   value: "11",          tone: "text-emerald-400" },
  ],
  Analyst: [
    { icon: TrendingUp,  label: "KPIs on track",    value: "14 / 18",     tone: "text-emerald-400" },
    { icon: Activity,    label: "Anomalies",        value: "2",           tone: "text-amber-400" },
    { icon: Database,    label: "Datasets synced",  value: "23",          tone: "text-sky-400" },
  ],
  HR: [
    { icon: UserPlus,    label: "New hires · wk",   value: "3",           tone: "text-emerald-400" },
    { icon: GraduationCap,label: "Training due",    value: "12",          tone: "text-amber-400" },
    { icon: Users,       label: "Headcount",        value: "187",         tone: "text-violet-400" },
  ],
  Finance: [
    { icon: DollarSign,  label: "Burn · MTD",       value: "$48.2K",      tone: "text-amber-400" },
    { icon: TrendingUp,  label: "Revenue · MTD",    value: "$214K ▲4.1%", tone: "text-emerald-400" },
    { icon: CheckCircle2,label: "Invoices cleared", value: "27",          tone: "text-emerald-400" },
  ],
  IT: [
    { icon: Server,      label: "Services up",      value: "42 / 42",     tone: "text-emerald-400" },
    { icon: Cpu,         label: "CPU avg",          value: "31%",         tone: "text-sky-400" },
    { icon: AlertCircle, label: "Tickets open",     value: "4",           tone: "text-amber-400" },
    { icon: ShieldCheck, label: "Threats blocked",  value: "1,204",       tone: "text-violet-400" },
  ],
};

function jitter(v: string) {
  // tiny number jitter on numeric leading values for "live" feel
  return v.replace(/^([\d,]+)/, (m) => {
    const n = Number(m.replace(/,/g, ""));
    if (!Number.isFinite(n)) return m;
    const d = Math.round((Math.random() - 0.5) * Math.max(2, n * 0.002));
    return (n + d).toLocaleString();
  });
}

export function LiveTicker() {
  const { user } = useApp();
  const roleItems = BY_ROLE[user?.role ?? ""] ?? BY_ROLE["Project Manager"];
  const [items, setItems] = useState<Item[]>([...COMMON, ...roleItems]);

  // Refresh when role changes
  useEffect(() => {
    setItems([...COMMON, ...(BY_ROLE[user?.role ?? ""] ?? BY_ROLE["Project Manager"])]);
  }, [user?.role]);

  useEffect(() => {
    const id = setInterval(() => {
      setItems((prev) => prev.map((it) => ({ ...it, value: jitter(it.value) })));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  // Duplicate list so the marquee loops seamlessly
  const loop = [...items, ...items];

  return (
    <div
      aria-label="Live activity ticker"
      className="relative overflow-hidden border-y border-white/[0.05] bg-background/40 backdrop-blur-xl"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent 0, black 6%, black 94%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0, black 6%, black 94%, transparent 100%)",
      }}
    >
      <div className="flex items-center gap-2 px-6 py-1.5">
        <span className="inline-flex items-center gap-1.5 shrink-0 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-rose-400 ring-1 ring-rose-500/30">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-rose-400" />
          </span>
          Live · {user?.role ?? "You"}
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max items-center gap-8 ticker-track">
            {loop.map((it, i) => {
              const Icon = it.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-xs whitespace-nowrap">
                  <Icon className={`size-3.5 ${it.tone}`} />
                  <span className="text-muted-foreground">{it.label}</span>
                  <span className="font-medium text-foreground/90 tabular-nums">{it.value}</span>
                  <span className="text-border">·</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}