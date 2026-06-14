import { useEffect, useMemo, useState } from "react";
import {
  Youtube, Facebook, Instagram, Twitter, Music2, Ghost, Globe,
  Radio, ShieldCheck, AlertTriangle, FileText, GraduationCap, ClipboardCheck,
  Users, History, Bell, Download, Filter, Plus, ArrowRight, CheckCircle2, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";
import type { PlatformKey, Severity } from "@/lib/services/platform-policy-service";

// ────────────────────────────────────────────────────────────────────────────
// Mock data
// ────────────────────────────────────────────────────────────────────────────

interface PlatformMeta {
  key: PlatformKey;
  name: string;
  icon: LucideIcon;
  tint: string;
  activePolicies: number;
  lastUpdate: string;
  trained: number;
  pending: number;
  risk: "Low" | "Medium" | "High";
  compliance: number;
  status: "Active" | "Monitoring" | "Paused";
}

const PLATFORMS: PlatformMeta[] = [
  { key: "youtube",   name: "YouTube",     icon: Youtube,   tint: "text-red-500",       activePolicies: 42, lastUpdate: "2026-06-13", trained: 36, pending: 12, risk: "Medium", compliance: 88, status: "Active" },
  { key: "facebook",  name: "Facebook",    icon: Facebook,  tint: "text-blue-500",      activePolicies: 38, lastUpdate: "2026-06-12", trained: 30, pending: 18, risk: "Medium", compliance: 81, status: "Active" },
  { key: "instagram", name: "Instagram",   icon: Instagram, tint: "text-pink-500",      activePolicies: 31, lastUpdate: "2026-06-11", trained: 28, pending: 20, risk: "Low",    compliance: 92, status: "Active" },
  { key: "twitter",   name: "Twitter / X", icon: Twitter,   tint: "text-sky-400",       activePolicies: 27, lastUpdate: "2026-06-14", trained: 22, pending: 26, risk: "High",   compliance: 74, status: "Monitoring" },
  { key: "tiktok",    name: "TikTok",      icon: Music2,    tint: "text-fuchsia-400",   activePolicies: 35, lastUpdate: "2026-06-13", trained: 25, pending: 23, risk: "High",   compliance: 78, status: "Active" },
  { key: "snapchat",  name: "Snapchat",    icon: Ghost,     tint: "text-yellow-400",    activePolicies: 22, lastUpdate: "2026-06-09", trained: 14, pending: 34, risk: "Medium", compliance: 70, status: "Active" },
  { key: "vk",        name: "VK",          icon: Globe,     tint: "text-indigo-400",    activePolicies: 19, lastUpdate: "2026-06-08", trained: 9,  pending: 39, risk: "Medium", compliance: 65, status: "Monitoring" },
];

const POLICY_CATEGORIES = [
  "Community Guidelines", "Monetization Policies", "Copyright Policies", "Content Restrictions",
  "Political / News Content Rules", "Thumbnail & Title Rules", "Hashtag Rules", "AI-Generated Content Rules",
  "Misinformation Rules", "Strike & Violation Rules", "Upload & Publishing Rules", "Platform Best Practices",
];

const MOCK_UPDATES_SEED: Array<{ title: string; summary: string; severity: Severity; team: string; action: string; source: string }> = [
  { title: "Stricter AI-generated content disclosure",       summary: "Creators must clearly label synthetic media in the description and title overlay.",  severity: "High",     team: "News", action: "Update upload checklist by 2026-06-20", source: "Official Help Center" },
  { title: "Updated monetization eligibility thresholds",    summary: "Channels under 500 subs no longer eligible for mid-roll ads in news categories.",      severity: "Medium",   team: "Finance & Editors", action: "Audit affected channels", source: "Creator Insider" },
  { title: "Copyright Match expansion to short-form",        summary: "Shorts are now scanned against the full Content ID database.",                          severity: "High",     team: "Editors", action: "Review last 30 days of shorts", source: "Policy Blog" },
  { title: "Political content labeling requirement",         summary: "Election-adjacent content must include a paid-for-by disclosure.",                       severity: "Critical", team: "News & Current Affairs", action: "Mandatory training within 48h", source: "Transparency Center" },
  { title: "Thumbnail clickbait enforcement",                summary: "Misleading thumbnails will demote videos algorithmically.",                              severity: "Low",      team: "Thumbnail Designers", action: "Refresh thumbnail templates", source: "Creator Newsroom" },
];

const LESSON_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
const LESSON_TOPICS = [
  "Platform Policy Fundamentals", "Copyright & Fair Use", "Monetization Rules",
  "Content Safety", "News & Current Affairs Content", "Uploading & Publishing",
];

const QUIZZES = [
  { id: "q1", name: "Platform Policy Quiz",      pass: 80, attempts: 2, result: "Passed",   score: 86 },
  { id: "q2", name: "Copyright Quiz",            pass: 75, attempts: 1, result: "Passed",   score: 78 },
  { id: "q3", name: "Monetization Quiz",         pass: 80, attempts: 3, result: "Retake",   score: 72 },
  { id: "q4", name: "Community Guideline Quiz",  pass: 70, attempts: 1, result: "Pending",  score: 0  },
];

const EMPLOYEES = [
  { id: "e1", name: "Aisha Khan",   dept: "News",       lessons: 8,  total: 10, score: 88, last: "2026-06-12", pending: 1, status: "Compliant" },
  { id: "e2", name: "Ben Larson",   dept: "Editors",    lessons: 6,  total: 10, score: 74, last: "2026-06-10", pending: 3, status: "At Risk" },
  { id: "e3", name: "Carla Reyes",  dept: "Thumbnails", lessons: 10, total: 10, score: 95, last: "2026-06-13", pending: 0, status: "Compliant" },
  { id: "e4", name: "David Singh",  dept: "Producers",  lessons: 4,  total: 10, score: 62, last: "2026-06-05", pending: 5, status: "Non-Compliant" },
  { id: "e5", name: "Emma Walters", dept: "News",       lessons: 9,  total: 10, score: 91, last: "2026-06-13", pending: 1, status: "Compliant" },
];

const ACKNOWLEDGEMENTS = [
  { id: "a1", emp: "Aisha Khan",   policy: "AI Content Disclosure",        status: "Acknowledged", date: "2026-06-13", approval: "Approved" },
  { id: "a2", emp: "Ben Larson",   policy: "Monetization Thresholds",      status: "Pending",      date: "—",          approval: "—" },
  { id: "a3", emp: "Carla Reyes",  policy: "Thumbnail Clickbait",          status: "Acknowledged", date: "2026-06-12", approval: "Approved" },
  { id: "a4", emp: "David Singh",  policy: "Political Content Labeling",   status: "Pending",      date: "—",          approval: "—" },
  { id: "a5", emp: "Emma Walters", policy: "Copyright Match — Shorts",     status: "Acknowledged", date: "2026-06-13", approval: "Approved" },
];

const CHANGE_HISTORY = [
  { id: "c1", title: "AI Content Disclosure",     old: "v1.2", new: "v1.3", summary: "Stricter labeling rules for synthetic media.",   date: "2026-06-13", severity: "High"     as Severity, by: "Policy Bot",  team: "News",            notes: "Mandatory training assigned." },
  { id: "c2", title: "Monetization Eligibility",  old: "v3.0", new: "v3.1", summary: "Raised thresholds for news channels.",            date: "2026-06-12", severity: "Medium"   as Severity, by: "Admin (HR)",  team: "Finance",         notes: "Audit triggered." },
  { id: "c3", title: "Copyright Match — Shorts",  old: "v2.4", new: "v2.5", summary: "Scope expanded to short-form.",                   date: "2026-06-11", severity: "High"     as Severity, by: "RSS Feed",    team: "Editors",         notes: "—" },
  { id: "c4", title: "Political Content Labels",  old: "v1.0", new: "v1.1", summary: "Paid-for-by disclosure required.",                date: "2026-06-10", severity: "Critical" as Severity, by: "Admin (Compliance)", team: "News",      notes: "48h compliance window." },
];

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

export function DigitalPlatformTrainingCenter() {
  const [active, setActive] = useState<PlatformMeta | null>(null);

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary"/>
              Digital Platform Training Center
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Train teams on each platform's rules, monetization, copyright and daily policy updates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-emerald-500/40 text-emerald-400">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"/>
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400"/>
              </span>
              <Radio className="size-3"/> Live Policy Monitoring
            </Badge>
            <Button size="sm" variant="outline" onClick={() => toast.success("Training report exported (mock)")}>
              <Download className="size-3.5 mr-1.5"/> Export report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {PLATFORMS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.key}
                  onClick={() => setActive(p)}
                  className="group text-left rounded-xl border bg-card/40 p-4 hover:border-primary/60 hover:bg-card/70 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className={`size-10 rounded-lg bg-white/[0.04] grid place-items-center ${p.tint}`}>
                      <Icon className="size-5"/>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                  </div>
                  <div className="mt-3 font-semibold">{p.name}</div>
                  <div className="mt-1 grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
                    <div>{p.activePolicies} policies</div>
                    <div className="text-right">Risk: <span className={riskColor(p.risk)}>{p.risk}</span></div>
                    <div>Trained: {p.trained}</div>
                    <div className="text-right">Pending: {p.pending}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Compliance</span>
                    <span className="font-semibold">{p.compliance}%</span>
                  </div>
                  <Progress value={p.compliance} className="mt-1 h-1"/>
                  <div className="mt-3 inline-flex items-center gap-1 text-primary text-[11px] font-medium opacity-0 group-hover:opacity-100 transition">
                    Open workspace <ArrowRight className="size-3"/>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-5xl overflow-y-auto">
          {active && <PlatformWorkspace platform={active}/>}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Workspace (per platform)
// ────────────────────────────────────────────────────────────────────────────

function PlatformWorkspace({ platform }: { platform: PlatformMeta }) {
  const Icon = platform.icon;
  const [addPolicy, setAddPolicy] = useState(false);
  const [addUpdate, setAddUpdate] = useState(false);
  const [editPolicy, setEditPolicy] = useState<string | null>(null);
  const [empDrawer, setEmpDrawer] = useState<typeof EMPLOYEES[number] | null>(null);
  const [severity, setSeverity] = useState<string>("all");
  const [updates, setUpdates] = useState(() =>
    MOCK_UPDATES_SEED.map((u, i) => ({
      ...u,
      id: `u${i}`,
      effectiveDate: `2026-06-${10 + i}`,
      reviewed: i > 2,
    }))
  );

  // Mock real-time feed: append a synthesized update every 15s.
  useEffect(() => {
    const t = setInterval(() => {
      setUpdates((prev) => [
        {
          id: `live-${Date.now()}`,
          title: "Live policy bulletin",
          summary: "Mock real-time update — replace with RSS / API feed.",
          severity: (["Low","Medium","High","Critical"] as Severity[])[Math.floor(Math.random()*4)],
          team: "All teams",
          action: "Review at next standup",
          source: "Mock stream",
          effectiveDate: new Date().toISOString().slice(0,10),
          reviewed: false,
        },
        ...prev,
      ].slice(0, 20));
    }, 15000);
    return () => clearInterval(t);
  }, []);

  const filteredUpdates = useMemo(
    () => updates.filter((u) => severity === "all" || u.severity === severity),
    [updates, severity]
  );

  return (
    <div className="space-y-4">
      <SheetHeader className="space-y-0">
        <SheetTitle className="flex items-center gap-3">
          <span className={`size-10 rounded-lg bg-white/[0.04] grid place-items-center ${platform.tint}`}>
            <Icon className="size-5"/>
          </span>
          <span>{platform.name} · Training Workspace</span>
        </SheetTitle>
      </SheetHeader>

      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Platform Policies</TabsTrigger>
          <TabsTrigger value="updates">Daily Policy Updates</TabsTrigger>
          <TabsTrigger value="lessons">Training Lessons</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="progress">Employee Progress</TabsTrigger>
          <TabsTrigger value="ack">Acknowledgements</TabsTrigger>
          <TabsTrigger value="history">Change History</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Status"           value={platform.status}/>
            <Stat label="Active policies"  value={platform.activePolicies}/>
            <Stat label="Latest update"    value={platform.lastUpdate}/>
            <Stat label="Trained"          value={platform.trained}/>
            <Stat label="Pending training" value={platform.pending}/>
            <Stat label="Risk level"       value={platform.risk} tone={platform.risk === "High" ? "danger" : platform.risk === "Medium" ? "warn" : "ok"}/>
            <Stat label="Compliance score" value={`${platform.compliance}%`}/>
            <Stat label="Effective today"  value={"2 updates"}/>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Quick actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setAddPolicy(true)}><Plus className="size-3.5 mr-1.5"/> Add policy</Button>
              <Button size="sm" variant="outline" onClick={() => setAddUpdate(true)}><Bell className="size-3.5 mr-1.5"/> Add daily update</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Training assigned (mock)")}><GraduationCap className="size-3.5 mr-1.5"/> Assign training</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Reminder sent (mock)")}><Bell className="size-3.5 mr-1.5"/> Send reminder</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Report exported (mock)")}><Download className="size-3.5 mr-1.5"/> Export report</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies" className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">{POLICY_CATEGORIES.length} policy categories</div>
            <Button size="sm" onClick={() => setAddPolicy(true)}><Plus className="size-3.5 mr-1.5"/> Add policy</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {POLICY_CATEGORIES.map((cat) => (
              <Card key={cat}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-md bg-primary/10 text-primary grid place-items-center"><FileText className="size-4"/></div>
                    <div>
                      <div className="font-medium text-sm">{cat}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Last reviewed 2026-06-{10 + (cat.length % 5)}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setEditPolicy(cat)}>Edit</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Updates */}
        <TabsContent value="updates" className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 border-emerald-500/40 text-emerald-400">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"/>
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400"/>
                </span>
                Live feed (mock)
              </Badge>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="h-8 w-[140px] text-xs"><Filter className="size-3 mr-1"/><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={() => setAddUpdate(true)}><Plus className="size-3.5 mr-1.5"/> Add update</Button>
          </div>

          <div className="space-y-2">
            {filteredUpdates.map((u) => (
              <Card key={u.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <SeverityBadge level={u.severity}/>
                        <span className="font-semibold text-sm">{u.title}</span>
                        {!u.reviewed && <Badge variant="outline" className="text-[10px]">New</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{u.summary}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span>Source: {u.source}</span>
                        <span>Effective: {u.effectiveDate}</span>
                        <span>Team: {u.team}</span>
                        <span>Action: {u.action}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => {
                        setUpdates((prev) => prev.map((x) => x.id === u.id ? { ...x, reviewed: true } : x));
                        toast.success("Marked as reviewed");
                      }}>
                        <CheckCircle2 className="size-3.5 mr-1.5"/> Reviewed
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toast.success("Assigned to team (mock)")}>
                        <Users className="size-3.5 mr-1.5"/> Assign
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Lessons */}
        <TabsContent value="lessons" className="mt-4 space-y-4">
          {LESSON_LEVELS.map((level) => (
            <Card key={level}>
              <CardHeader><CardTitle className="text-sm">{level} lessons</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {LESSON_TOPICS.map((topic, i) => {
                  const done = (i + level.length) % 3 === 0;
                  return (
                    <div key={topic} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="size-4 text-primary"/>
                        <div>
                          <div className="text-sm font-medium">{topic}</div>
                          <div className="text-[11px] text-muted-foreground">{level} · {platform.name}</div>
                        </div>
                      </div>
                      {done
                        ? <Badge variant="outline" className="text-emerald-400 border-emerald-500/40"><CheckCircle2 className="size-3 mr-1"/> Completed</Badge>
                        : <Badge variant="outline"><Clock className="size-3 mr-1"/> In progress</Badge>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Quizzes */}
        <TabsContent value="quizzes" className="mt-4 space-y-2">
          {QUIZZES.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-md bg-primary/10 text-primary grid place-items-center"><ClipboardCheck className="size-4"/></div>
                  <div>
                    <div className="font-medium text-sm">{q.name}</div>
                    <div className="text-[11px] text-muted-foreground">Passing: {q.pass}% · Attempts: {q.attempts}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold">{q.score || "—"}{q.score ? "%" : ""}</div>
                    <div className="text-[11px] text-muted-foreground">{q.result}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`${q.name} — retake started (mock)`)}>Retake</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Employee Progress */}
        <TabsContent value="progress" className="mt-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-muted-foreground text-left border-b">
                  <th className="py-2 px-4">Employee</th><th>Dept</th><th>Lessons</th><th>Quiz</th>
                  <th>Last training</th><th>Pending</th><th>Status</th><th></th>
                </tr></thead>
                <tbody>
                  {EMPLOYEES.map((e) => (
                    <tr key={e.id} className="border-b last:border-0 hover:bg-accent/40">
                      <td className="py-2 px-4 font-medium">{e.name}</td>
                      <td>{e.dept}</td>
                      <td>{e.lessons}/{e.total}</td>
                      <td>{e.score}%</td>
                      <td>{e.last}</td>
                      <td>{e.pending}</td>
                      <td><Badge variant="outline" className={statusColor(e.status)}>{e.status}</Badge></td>
                      <td className="pr-4 text-right"><Button size="sm" variant="ghost" onClick={() => setEmpDrawer(e)}>View</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Acknowledgements */}
        <TabsContent value="ack" className="mt-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-muted-foreground text-left border-b">
                  <th className="py-2 px-4">Employee</th><th>Policy</th><th>Platform</th>
                  <th>Status</th><th>Date</th><th>Manager</th><th></th>
                </tr></thead>
                <tbody>
                  {ACKNOWLEDGEMENTS.map((a) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="py-2 px-4 font-medium">{a.emp}</td>
                      <td>{a.policy}</td>
                      <td>{platform.name}</td>
                      <td><Badge variant="outline" className={a.status === "Acknowledged" ? "text-emerald-400 border-emerald-500/40" : ""}>{a.status}</Badge></td>
                      <td>{a.date}</td>
                      <td>{a.approval}</td>
                      <td className="pr-4 text-right">
                        <Button size="sm" variant="ghost" onClick={() => toast.success(`Reminder sent to ${a.emp}`)}>
                          <Bell className="size-3.5 mr-1.5"/> Remind
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="mt-4 space-y-2">
          {CHANGE_HISTORY.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <History className="size-4 text-muted-foreground mt-1"/>
                    <div>
                      <div className="font-medium text-sm">{c.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {c.old} → <b className="text-foreground">{c.new}</b> · {c.date} · by {c.by} · team {c.team}
                      </div>
                      <p className="text-xs mt-2">{c.summary}</p>
                      {c.notes !== "—" && <p className="text-[11px] text-muted-foreground mt-1">Notes: {c.notes}</p>}
                    </div>
                  </div>
                  <SeverityBadge level={c.severity}/>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <Dialog open={addPolicy} onOpenChange={setAddPolicy}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add platform policy — {platform.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Policy title</Label><Input placeholder="e.g. AI Content Disclosure"/></div>
            <div className="space-y-1.5"><Label>Category</Label><Input placeholder="Community Guidelines"/></div>
            <div className="space-y-1.5"><Label>Summary</Label><Textarea rows={3}/></div>
            <div className="space-y-1.5"><Label>Effective date</Label><Input type="date"/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPolicy(false)}>Cancel</Button>
            <Button onClick={() => { setAddPolicy(false); toast.success("Policy added (mock)"); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPolicy} onOpenChange={(o) => !o && setEditPolicy(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit policy — {editPolicy}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Title</Label><Input defaultValue={editPolicy ?? ""}/></div>
            <div className="space-y-1.5"><Label>Summary</Label><Textarea rows={4} defaultValue="Current policy text…"/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPolicy(null)}>Cancel</Button>
            <Button onClick={() => { setEditPolicy(null); toast.success("Policy updated (mock)"); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addUpdate} onOpenChange={setAddUpdate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add daily policy update — {platform.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Headline</Label><Input/></div>
            <div className="space-y-1.5"><Label>Summary</Label><Textarea rows={3}/></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Severity</Label>
                <Select defaultValue="Medium">
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Effective date</Label><Input type="date"/></div>
            </div>
            <div className="space-y-1.5"><Label>Affected team</Label><Input placeholder="e.g. News"/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUpdate(false)}>Cancel</Button>
            <Button onClick={() => {
              setAddUpdate(false);
              setUpdates((prev) => [{
                id: `manual-${Date.now()}`, title: "Manually added update", summary: "Mock entry added by HR admin.",
                severity: "Medium" as Severity, team: "All teams", action: "Review",
                source: "Admin entry", effectiveDate: new Date().toISOString().slice(0,10), reviewed: false,
              }, ...prev]);
              toast.success("Update published (mock)");
            }}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!empDrawer} onOpenChange={(o) => !o && setEmpDrawer(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>{empDrawer?.name}</SheetTitle></SheetHeader>
          {empDrawer && (
            <div className="mt-4 space-y-3 text-sm px-1">
              <div className="flex items-center gap-3">
                <Avatar className="size-12"><AvatarFallback>{empDrawer.name.split(" ").map((x) => x[0]).join("")}</AvatarFallback></Avatar>
                <div>
                  <div className="font-semibold">{empDrawer.name}</div>
                  <div className="text-xs text-muted-foreground">{empDrawer.dept} · {platform.name}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Lessons" value={`${empDrawer.lessons}/${empDrawer.total}`}/>
                <Stat label="Quiz score" value={`${empDrawer.score}%`}/>
                <Stat label="Last training" value={empDrawer.last}/>
                <Stat label="Pending policies" value={empDrawer.pending}/>
              </div>
              <div>
                <Label className="text-xs">Manager notes</Label>
                <Textarea rows={3} defaultValue="On track. Needs to complete monetization quiz." className="mt-1"/>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => toast.success("Reminder sent")}>Send reminder</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Training assigned")}>Assign training</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "ok" | "warn" | "danger" }) {
  const color = tone === "danger" ? "text-red-400" : tone === "warn" ? "text-amber-400" : tone === "ok" ? "text-emerald-400" : "text-foreground";
  return (
    <div className="rounded-lg border bg-card/40 p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-base font-semibold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function SeverityBadge({ level }: { level: Severity }) {
  const map: Record<Severity, string> = {
    Low:      "border-emerald-500/40 text-emerald-400",
    Medium:   "border-amber-500/40 text-amber-400",
    High:     "border-orange-500/40 text-orange-400",
    Critical: "border-red-500/40 text-red-400",
  };
  return (
    <Badge variant="outline" className={`gap-1 ${map[level]}`}>
      <AlertTriangle className="size-3"/> {level}
    </Badge>
  );
}

function riskColor(r: "Low" | "Medium" | "High") {
  return r === "High" ? "text-red-400" : r === "Medium" ? "text-amber-400" : "text-emerald-400";
}

function statusColor(s: string) {
  if (s === "Compliant") return "text-emerald-400 border-emerald-500/40";
  if (s === "At Risk") return "text-amber-400 border-amber-500/40";
  return "text-red-400 border-red-500/40";
}