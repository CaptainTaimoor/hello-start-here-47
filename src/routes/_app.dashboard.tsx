import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  FileSpreadsheet,
  FolderKanban,
  ListChecks,
  Settings2,
  Users,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { NumberTicker } from "@/components/magic/NumberTicker";
import { SignatureChart } from "@/components/magic/SignatureChart";
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
import { LiveTicker } from "@/components/layout/LiveTicker";

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

  // === Live ticker: gently nudges a "watching" count every 8s for that real-product feel
  const [watching, setWatching] = useState(() => 3 + Math.floor(Math.random() * 4));
  useEffect(() => {
    const id = setInterval(() => {
      setWatching((v) => Math.max(2, v + (Math.random() > 0.5 ? 1 : -1)));
    }, 8000);
    return () => clearInterval(id);
  }, []);

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
  const sigLabels = views.map((v) => v.day);
  const sigSeries = useMemo(() => {
    const colors = ["oklch(0.82 0.16 205)", "oklch(0.7 0.2 240)", "oklch(0.62 0.22 285)", "oklch(0.75 0.18 175)"];
    return channels.slice(0, 4).map((c, idx) => ({
      name: c.name,
      color: colors[idx % colors.length],
      data: views.map((v, i) =>
        Math.round(v.value * (0.18 + 0.08 * idx) * (1 + 0.12 * Math.sin(i / 2 + idx))),
      ),
    }));
  }, [channels, views]);

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
      {/* LIVE TICKER */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
        className="md:col-span-12 rounded-2xl overflow-hidden border border-white/[0.06]"
      >
        <LiveTicker />
      </motion.div>

      {/* HERO */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}
        className="md:col-span-8 relative overflow-hidden rounded-[2rem] border border-white/10 bg-[oklch(0.16_0.03_235)] shadow-2xl shadow-[oklch(0.5_0.15_220/0.18)] min-h-[360px]"
      >
        {/* ambient glows */}
        <div className="pointer-events-none absolute -top-48 -right-48 size-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-[300px] rounded-full bg-violet-600/10 blur-[100px]" />

        {/* Top utility bar */}
        <div className="relative z-10 flex items-center justify-between px-8 md:px-10 pt-7 gap-4">
          <div className="flex items-center gap-5">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-0.5">Current Session</span>
              <span className="text-xs font-medium text-white/70 tabular-nums">
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })} · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="hidden sm:block h-8 w-px bg-white/10" />
            <div className="hidden sm:flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="text-xs font-medium text-white/70">All systems clear</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md border border-white/5 rounded-full pl-3 pr-4 py-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">Operational</span>
            <span className="w-px h-3 bg-white/20" />
            <span className="text-[10px] font-medium text-primary/90 tabular-nums">{watching} watching</span>
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 px-8 md:px-10 pt-10 pb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          <div className="max-w-2xl">
            <h1 className="font-serif text-6xl md:text-7xl font-normal text-white leading-[1.02] tracking-[-0.03em]">
              Welcome back, <span className="italic aurora-text">{firstName}.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-white/55 max-w-md font-light leading-relaxed">
              You're signed in as <span className="text-white/90 font-medium">{role}</span>. Here's your production pulse for today.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-white/90 group">
                    <Settings2 className="size-4 mr-2 text-primary transition-transform group-hover:rotate-12" />
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

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {["RS", "PM", "AK", "BL"].map((i, n) => (
                    <div
                      key={n}
                      className="size-9 rounded-full border-2 border-[oklch(0.16_0.03_235)] bg-gradient-to-br from-primary/40 to-violet-500/40 flex items-center justify-center text-[10px] font-semibold text-white"
                    >
                      {i}
                    </div>
                  ))}
                  <div className="size-9 rounded-full border-2 border-[oklch(0.16_0.03_235)] bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    +{Math.max(teamCount - 4, 0)}
                  </div>
                </div>
                <span className="text-[10px] text-white/40 font-semibold tracking-[0.18em] uppercase">Team Active</span>
              </div>
            </div>
          </div>

          {/* Right micro-KPIs */}
          <div className="hidden lg:flex flex-col gap-7 items-end shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1.5">System Health</div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-light text-white tracking-tighter tabular-nums">
                  <NumberTicker value={98.4} decimals={1} /><span className="text-base text-primary/70">%</span>
                </span>
                <svg className="w-16 h-8 text-emerald-400/60 mb-1.5" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d="M0 35 Q 10 20 20 30 T 40 10 T 60 25 T 80 15 T 100 35" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1.5">Active Nodes</div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-light text-white tracking-tighter tabular-nums">
                  <NumberTicker value={4281} />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-bold text-emerald-400">+12%</span>
                  <span className="text-[9px] text-white/30">vs LY</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
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
          <SignatureChart labels={sigLabels} series={sigSeries} height={220} />
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

      {/* SPOTLIGHT — second fold, 16:9 editorial card, breaks the grid rhythm */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
        className="md:col-span-12 relative overflow-hidden rounded-[28px] border border-white/[0.06] aspect-[16/7] min-h-[280px]"
        style={{
          background:
            "radial-gradient(800px circle at 20% 30%, oklch(0.78 0.17 205 / 0.28), transparent 55%), radial-gradient(700px circle at 85% 80%, oklch(0.55 0.22 285 / 0.32), transparent 60%), linear-gradient(180deg, oklch(0.22 0.05 240), oklch(0.14 0.03 240))",
        }}
      >
        {/* Floating orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[55%] size-40 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-[10%] right-[20%] size-56 rounded-full bg-purple-500/15 blur-3xl" style={{ animation: "float-y 6s ease-in-out infinite" }} />
        </div>
        {/* Grain overlay */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
        />
        <div className="relative h-full grid grid-cols-1 md:grid-cols-12 gap-6 p-8 md:p-12">
          <div className="md:col-span-7 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center size-8 rounded-xl bg-white/10 backdrop-blur-md text-primary">
                <Sparkles className="size-4" />
              </span>
              <span className="eyebrow text-white/60">Aurora · in beta</span>
            </div>
            <div className="max-w-xl">
              <h2 className="font-serif text-4xl md:text-6xl font-normal text-white leading-[0.95] tracking-[-0.025em]">
                Ask anything.<br />
                <span className="italic text-primary/90">Aurora answers in your data.</span>
              </h2>
              <p className="mt-4 text-sm md:text-base text-white/50 max-w-md leading-relaxed">
                The signature moment: hit <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-white/15 bg-white/[0.06]">⌘ .</kbd> from anywhere and Aurora opens. She knows your channels, sheets, and team — so you can stop hunting and start shipping.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    const ev = new KeyboardEvent("keydown", { key: ".", metaKey: true });
                    window.dispatchEvent(ev);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                >
                  Open Aurora
                  <ArrowUpRight className="size-4" />
                </button>
                <Link to="/settings" className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white/80 px-4 py-2 text-sm font-medium hover:bg-white/10 transition">
                  Configure
                </Link>
              </div>
            </div>
          </div>
          <div className="md:col-span-5 hidden md:flex items-center justify-center">
            {/* Decorative aurora hexagon */}
            <svg viewBox="0 0 200 200" className="w-full max-w-[280px] drop-shadow-[0_20px_60px_rgba(99,102,241,0.4)]">
              <defs>
                <linearGradient id="sp-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.85 0.16 205)" />
                  <stop offset="60%" stopColor="oklch(0.7 0.2 240)" />
                  <stop offset="100%" stopColor="oklch(0.55 0.22 285)" />
                </linearGradient>
              </defs>
              <path d="M100 14 L172 56 L172 144 L100 186 L28 144 L28 56 Z" fill="none" stroke="url(#sp-g)" strokeWidth="1.5" opacity="0.85" />
              <path d="M100 34 L154 66 L154 134 L100 166 L46 134 L46 66 Z" fill="none" stroke="url(#sp-g)" strokeWidth="1" opacity="0.5" />
              <path d="M100 54 L138 76 L138 124 L100 146 L62 124 L62 76 Z" fill="none" stroke="url(#sp-g)" strokeWidth="0.8" opacity="0.3" />
              <circle cx="100" cy="100" r="6" fill="url(#sp-g)" />
              <circle cx="100" cy="100" r="14" fill="none" stroke="url(#sp-g)" strokeWidth="0.6" opacity="0.5" />
            </svg>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}