import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Activity,
  CheckCircle2,
  FileSpreadsheet,
  FolderKanban,
  Gauge,
  ListChecks,
  Settings2,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div>
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-card/60 to-card/40 p-8 md:p-10">
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(800px_300px_at_85%_-20%,oklch(0.78_0.17_205/0.35),transparent_60%),radial-gradient(500px_300px_at_-10%_120%,oklch(0.6_0.18_250/0.25),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgb(74_222_128/0.8)]" />
              All systems operational
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-gradient">
              Welcome back, {user?.name?.split(" ")[0] ?? "there"}.
            </h1>
            <p className="mt-3 max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">
              You're signed in as <span className="text-foreground font-medium">{role}</span>. Here's everything happening across Orvion Media today.
            </p>
          </div>
          <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="backdrop-blur bg-background/40 border-border/60">
                <Settings2 className="size-4 mr-2" />
                Customize
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
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
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {dashboardCards.projects && (
          <StatCard label="Assigned projects" value={1} delta="+1 this month" icon={FolderKanban} />
        )}
        {dashboardCards.team && (
          <StatCard label="Team members" value={channels.reduce((s, c) => s + c.team.length, 0)} icon={Users} />
        )}
        {dashboardCards.tasks && (
          <StatCard label="Pending tasks" value={12} delta="3 due today" icon={ListChecks} />
        )}
        {dashboardCards.sheets && (
          <StatCard label="Pending sheet rows" value={totalRows} icon={FileSpreadsheet} />
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Channel views — last 14 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={MOCK_ANALYTICS.views} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="value" stroke="var(--primary)" fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {dashboardCards.kpi && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Gauge className="size-4" /> KPI status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {channels.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.todayCount} uploads today</div>
                  </div>
                  <Badge variant="outline" className="text-xs">{c.kpiStatus}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        {dashboardCards.activity && (
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="size-4"/> Recent activity</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3">
              {[
                { who: "Aisha K.", what: "edited Daily Content (3 rows)", when: "5m" },
                { who: "Ben L.", what: "marked Markets close render complete", when: "20m" },
                { who: "Carla R.", what: "added KPI note for Orvion World", when: "1h" },
                { who: "Priya M.", what: "approved thumbnail v3", when: "2h" },
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span><b>{a.who}</b> {a.what}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.when}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {dashboardCards.notifications && (
          <Card>
            <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="flex items-start gap-2">
                  <span className={`mt-1.5 size-1.5 rounded-full ${n.read ? "bg-muted-foreground/40" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{n.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{n.description}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        {dashboardCards.editing && showFor.editing && (
          <Card>
            <CardHeader><CardTitle className="text-base">Editing queue</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span>To do</span><b>5</b></div>
              <div className="flex justify-between"><span>In progress</span><b>3</b></div>
              <div className="flex justify-between"><span>Review</span><b>2</b></div>
              <div className="flex justify-between"><span>Done</span><b>14</b></div>
            </CardContent>
          </Card>
        )}
        {dashboardCards.hr && showFor.hr && (
          <Card>
            <CardHeader><CardTitle className="text-base">HR snapshot</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span>Active employees</span><b>48</b></div>
              <div className="flex justify-between"><span>Today's attendance</span><b>92%</b></div>
              <div className="flex justify-between"><span>Open hires</span><b>4</b></div>
            </CardContent>
          </Card>
        )}
        {dashboardCards.finance && showFor.finance && (
          <Card>
            <CardHeader><CardTitle className="text-base">Finance snapshot</CardTitle></CardHeader>
            <CardContent className="h-40">
              <ResponsiveContainer>
                <BarChart data={[
                  { m: "Jan", v: 64 }, { m: "Feb", v: 72 }, { m: "Mar", v: 81 },
                  { m: "Apr", v: 78 }, { m: "May", v: 88 }, { m: "Jun", v: 95 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="m" fontSize={11} stroke="var(--muted-foreground)"/>
                  <YAxis fontSize={11} stroke="var(--muted-foreground)"/>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}/>
                  <Bar dataKey="v" fill="var(--primary)" radius={4}/>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        {dashboardCards.it && showFor.it && (
          <Card>
            <CardHeader><CardTitle className="text-base">IT snapshot</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span>App health</span><b className="text-emerald-600">Healthy</b></div>
              <div className="flex justify-between"><span>Open tickets</span><b>2</b></div>
              <div className="flex justify-between"><span>Server status</span><b className="text-emerald-600">Online</b></div>
            </CardContent>
          </Card>
        )}
        {dashboardCards.quickLinks && (
          <Card>
            <CardHeader><CardTitle className="text-base">Quick links</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              <Link to="/projects" className="rounded-md border p-2 hover:bg-accent">Projects</Link>
              <Link to="/team" className="rounded-md border p-2 hover:bg-accent">Team Workspace</Link>
              <Link to="/admin" className="rounded-md border p-2 hover:bg-accent">Admin</Link>
              <Link to="/settings" className="rounded-md border p-2 hover:bg-accent">Settings</Link>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}