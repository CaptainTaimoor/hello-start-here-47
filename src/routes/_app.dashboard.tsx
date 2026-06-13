import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  FileSpreadsheet,
  FolderKanban,
  ListChecks,
  Settings2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { NumberTicker } from "@/components/magic/NumberTicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/lib/app-store";
import { MOCK_ANALYTICS } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Orvion Media" }] }),
  component: DashboardPage,
});

const CARDS = [
  { id: "projects", label: "Assigned projects" },
  { id: "team", label: "Assigned team" },
  { id: "tasks", label: "Pending tasks" },
  { id: "sheets", label: "Pending sheets" },
  { id: "activity", label: "Recent activity" },
  { id: "notifications", label: "Notifications" },
  { id: "kpi", label: "KPI status" },
  { id: "quickLinks", label: "Quick links" },
  { id: "hr", label: "HR snapshot" },
  { id: "finance", label: "Finance snapshot" },
  { id: "it", label: "IT snapshot" },
  { id: "editing", label: "Editing queue" },
];

function DashboardPage() {
  const { user, dashboardCards, toggleCard, notifications, channels, sheets } = useApp();

  const role = user?.role ?? "Viewer";

  const showFor = useMemo(
    () => ({
      hr: ["Super Admin", "Admin", "HR"].includes(role),
      finance: ["Super Admin", "Admin", "Finance"].includes(role),
      it: ["Super Admin", "Admin", "IT"].includes(role),
      editing: ["Super Admin", "Admin", "Project Manager", "Content Manager", "Editor"].includes(role),
    }),
    [role],
  );

  const totalRows = Object.values(sheets).reduce((s, r) => s + r.length, 0);
  const teamCount = channels.reduce((s, c) => s + c.team.length, 0);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  // Build channel-views path for inline SVG
  const views = MOCK_ANALYTICS.views;
  const maxV = Math.max(...views.map((v) => v.value));
  const minV = Math.min(...views.map((v) => v.value));
  const chartPath = views
    .map((p, i) => {
      const x = (i / (views.length - 1)) * 800;
      const y = 140 - ((p.value - minV) / (maxV - minV || 1)) * 120;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const chartArea = `${chartPath} L800,150 L0,150 Z`;

  const activity = [
    { who: "Aisha K.", what: "edited Daily Content (3 rows)", when: "5m" },
    { who: "Ben L.", what: "marked Markets close render complete", when: "22m" },
    { who: "Carla R.", what: "added KPI note for Orvion World", when: "1h" },
    { who: "Priya M.", what: "approved thumbnail v3", when: "2h" },
  ];

  const stats = [
    dashboardCards.projects && {
      key: "p",
      icon: FolderKanban,
      value: 1,
      label: "Assigned Projects",
      badge: { text: "+1", tone: "primary" as const },
    },
    dashboardCards.team && {
      key: "t",
      icon: Users,
      value: teamCount,
      label: "Team Members",
      badge: { text: "Active", tone: "muted" as const },
    },
    dashboardCards.tasks && {
      key: "ts",
      icon: ListChecks,
      value: 12,
      label: "Pending Tasks",
      badge: { text: "3 Due", tone: "danger" as const },
    },
    dashboardCards.sheets && {
      key: "sh",
      icon: FileSpreadsheet,
      value: totalRows,
      label: "Pending Sheet Rows",
      badge: null,
    },
  ].filter(Boolean) as Array<{
    key: string;
    icon: typeof FolderKanban;
    value: number;
    label: string;
    badge: { text: string; tone: "primary" | "muted" | "danger" } | null;
  }>;

  const tile =
    "group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[oklch(0.2_0.04_235)] p-6 transition-all duration-500 hover:border-primary/30 hover:-translate-y-0.5";

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
      className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-min"
    >
      {/* HERO */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}
        className="md:col-span-8 relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[oklch(0.2_0.04_235)] p-8 md:p-10 min-h-[320px] flex flex-col justify-between"
      >
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_top_right,oklch(0.78_0.17_205/0.12),transparent_55%)]" />
        <div className="absolute top-6 right-6 z-10">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-white/70">Operational</span>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="font-serif text-6xl md:text-8xl font-normal text-white leading-[0.92] tracking-[-0.03em]">
            Welcome back, <span className="italic text-primary">{firstName}.</span>
          </h1>
          <p className="mt-4 max-w-md text-base md:text-lg text-white/50 font-light leading-relaxed">
            You're signed in as <span className="text-white/85">{role}</span>. Here's your production pulse for today.
          </p>
        </div>
        <div className="relative z-10 mt-6 flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-white/85">
                <Settings2 className="size-4 mr-2 text-primary" />
                Customize View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuLabel>Dashboard cards</DropdownMenuLabel>
              {CARDS.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.id}
                  checked={!!dashboardCards[c.id]}
                  onCheckedChange={() => toggleCard(c.id)}
                >
                  {c.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* LIVE ACTIVITY */}
      {dashboardCards.activity && (
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}
          className={`md:col-span-4 ${tile} flex flex-col`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] uppercase tracking-[0.22em] font-semibold text-white/40">Live Stream</h3>
            <span className="size-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />
          </div>
          <div className="flex gap-4 flex-1">
            <div className="w-px bg-gradient-to-b from-primary/40 via-primary/10 to-transparent" />
            <div className="space-y-5 flex-1">
              {activity.map((a, i) => (
                <div key={i}>
                  <p className="text-sm text-white/80 leading-snug">
                    <span className="font-semibold text-white">{a.who}</span> {a.what}
                  </p>
                  <span className="text-[11px] text-white/30 tracking-wider uppercase">{a.when} ago</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* STAT CARDS */}
      {stats.map((s) => {
        const Icon = s.icon;
        const badgeCls =
          s.badge?.tone === "danger"
            ? "text-rose-400 bg-rose-400/10"
            : s.badge?.tone === "primary"
              ? "text-primary bg-primary/10"
              : "text-white/40 bg-white/5";
        return (
          <motion.div
            key={s.key}
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }}
            className={`md:col-span-3 ${tile}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Icon className="size-5" strokeWidth={1.5} />
              </div>
              {s.badge && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeCls}`}>
                  {s.badge.text}
                </span>
              )}
            </div>
            <p className="text-4xl md:text-5xl font-light text-white tracking-[-0.02em] mb-1 tabular-nums">
              <NumberTicker value={s.value} />
            </p>
            <p className="text-[11px] text-white/40 uppercase tracking-[0.18em] font-semibold">{s.label}</p>
          </motion.div>
        );
      })}

      {/* CHANNEL GROWTH CHART (large) */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}
        className={`md:col-span-9 ${tile} p-8`}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-medium text-white mb-1">Channel Growth</h3>
            <p className="text-xs text-white/40">Aggregated views across all Orvion networks · last 14 days</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-semibold text-white/60">Daily</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">Weekly</span>
          </div>
        </div>
        <div className="h-56 relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 800 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.17 205)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.78 0.17 205)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <motion.path
              d={chartArea}
              fill="url(#chartGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.6 }}
            />
            <motion.path
              d={chartPath}
              fill="none"
              stroke="oklch(0.78 0.17 205)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            />
          </svg>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
            {views.filter((_, i) => i % Math.ceil(views.length / 5) === 0).map((v) => (
              <span key={v.day}>{v.day}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI + EDITING QUEUE side stack */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }}
        className="md:col-span-3 flex flex-col gap-5"
      >
        {dashboardCards.kpi && (
          <div className={`${tile} flex-1`}>
            <h3 className="text-[10px] uppercase tracking-[0.22em] font-semibold text-white/40 mb-5">KPI Status</h3>
            <div className="space-y-4">
              {channels.map((c, i) => {
                const onTrack = c.kpiStatus === "On Track";
                const pct = onTrack ? 88 - i * 6 : 45;
                return (
                  <div key={c.id}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-white/80 font-medium truncate">{c.name}</span>
                      <span className={`font-bold ${onTrack ? "text-primary" : "text-orange-400"}`}>
                        {onTrack ? `${pct}%` : "At Risk"}
                      </span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div
                        className={`${onTrack ? "bg-primary" : "bg-orange-400"} h-1 rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {dashboardCards.editing && showFor.editing && (
          <div className="rounded-3xl bg-primary p-6 flex flex-col justify-between min-h-[140px]">
            <h3 className="text-[10px] uppercase tracking-[0.22em] font-bold text-[oklch(0.15_0.04_235)]/60">Editing Queue</h3>
            <div>
              <p className="text-5xl font-semibold text-[oklch(0.15_0.04_235)] leading-none mb-1 tracking-tight">14</p>
              <p className="text-[10px] font-bold text-[oklch(0.15_0.04_235)]/60 uppercase tracking-wider">Videos in pipeline</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* HR */}
      {dashboardCards.hr && showFor.hr && (
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          className={`md:col-span-4 ${tile}`}
        >
          <h3 className="text-[10px] uppercase tracking-[0.22em] font-semibold text-white/40 mb-6">HR Snapshot</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl">
              <p className="text-2xl font-medium text-white">48</p>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mt-1">Active</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl">
              <p className="text-2xl font-medium text-white">92%</p>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mt-1">Attendance</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl col-span-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-medium text-white">4</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mt-1">Open Hires</p>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Hiring</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* IT */}
      {dashboardCards.it && showFor.it && (
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          className={`md:col-span-4 ${tile}`}
        >
          <h3 className="text-[10px] uppercase tracking-[0.22em] font-semibold text-white/40 mb-6">IT Snapshot</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">App Health</span>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Server Status</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Open Tickets</span>
              <span className="text-sm font-bold text-white">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Uptime</span>
              <span className="text-sm font-mono text-white/80">99.98%</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* FINANCE */}
      {dashboardCards.finance && showFor.finance && (
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          className={`md:col-span-4 ${tile} flex flex-col justify-between`}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] uppercase tracking-[0.22em] font-semibold text-white/40">Finance Pulse</h3>
            <span className="text-[10px] font-mono text-white/30 tracking-tighter">USD · 6mo</span>
          </div>
          <div className="flex items-end gap-2 h-24 mt-4">
            {[40, 60, 55, 80, 75, 95].map((h, i) => (
              <div
                key={i}
                className={`w-full rounded-t-sm transition-all hover:opacity-80 ${i === 5 ? "bg-primary" : "bg-white/10"}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </motion.div>
      )}

      {/* NOTIFICATIONS */}
      {dashboardCards.notifications && (
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          className={`md:col-span-8 ${tile}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] uppercase tracking-[0.22em] font-semibold text-white/40">Notifications</h3>
            <span className="text-[10px] text-white/40">{notifications.length} total</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {notifications.slice(0, 4).map((n) => (
              <div key={n.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
                <span className={`mt-1.5 size-1.5 rounded-full shrink-0 ${n.read ? "bg-white/20" : "bg-primary shadow-[0_0_6px_oklch(0.78_0.17_205)]"}`} />
                <div className="min-w-0">
                  <div className="truncate font-medium text-white/90">{n.title}</div>
                  <div className="truncate text-xs text-white/40 mt-0.5">{n.description}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* QUICK LINKS */}
      {dashboardCards.quickLinks && (
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          className={`md:col-span-4 ${tile}`}
        >
          <h3 className="text-[10px] uppercase tracking-[0.22em] font-semibold text-white/40 mb-5">Quick Links</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { to: "/projects", label: "Projects" },
              { to: "/team", label: "Team" },
              { to: "/admin", label: "Admin" },
              { to: "/settings", label: "Settings" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-2xl bg-white/[0.03] border border-white/5 p-3 hover:border-primary/30 hover:bg-white/[0.06] transition-all uppercase tracking-widest font-semibold text-center text-white/70 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}