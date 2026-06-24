import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Youtube, Facebook, Instagram, Twitter, Music2, Ghost, Globe,
  ShieldCheck, AlertTriangle, FileText, GraduationCap, ClipboardCheck,
  Users, History, Bell, Plus, CheckCircle2, Clock, RefreshCw, Eye, Send,
  ListChecks, Radio, Activity, XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Platform = Database["public"]["Tables"]["digital_platforms"]["Row"];
type Source = Database["public"]["Tables"]["platform_policy_sources"]["Row"];
type Policy = Database["public"]["Tables"]["platform_policies"]["Row"];
type Update = Database["public"]["Tables"]["platform_policy_updates"]["Row"];
type Lesson = Database["public"]["Tables"]["training_lessons"]["Row"];
type Ack = Database["public"]["Tables"]["policy_acknowledgements"]["Row"];
type Log = Database["public"]["Tables"]["policy_monitoring_logs"]["Row"];
type Version = Database["public"]["Tables"]["platform_policy_versions"]["Row"];

const ICONS: Record<string, LucideIcon> = {
  youtube: Youtube, facebook: Facebook, instagram: Instagram, twitter: Twitter,
  tiktok: Music2, snapchat: Ghost, vk: Globe,
};
const TINTS: Record<string, string> = {
  youtube: "text-red-500", facebook: "text-blue-500", instagram: "text-pink-500",
  twitter: "text-sky-400", tiktok: "text-fuchsia-400", snapchat: "text-yellow-400", vk: "text-indigo-400",
};

const POLICY_CATEGORIES = [
  "Community Guidelines", "Monetization Policies", "Copyright Policies", "Content Restrictions",
  "Political / News Content Rules", "Thumbnail & Title Rules", "Hashtag Rules", "AI-Generated Content Rules",
  "Misinformation Rules", "Strike & Violation Rules", "Upload & Publishing Rules", "Platform Best Practices",
];

const SEVERITIES = ["low", "medium", "high", "critical"] as const;
const SEVERITY_TONE: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  high: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  critical: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

// ─────────────────────────────────────────────────────────────────────────

function useIsHrAdmin() {
  return useQuery({
    queryKey: ["isHrAdmin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.rpc("is_hr_or_admin", { _user_id: u.user.id });
      return !!data;
    },
  });
}

function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });
}

// ─────────────────────────────────────────────────────────────────────────

export function DigitalPlatformTrainingCenter() {
  const [active, setActive] = useState<Platform | null>(null);
  const isHr = useIsHrAdmin().data ?? false;
  const qc = useQueryClient();

  const platforms = useQuery({
    queryKey: ["platforms"],
    queryFn: async () => (await supabase.from("digital_platforms").select("*").order("name")).data ?? [],
  });

  const health = useQuery({
    queryKey: ["dpc-health"],
    queryFn: async () => (await supabase.rpc("get_monitoring_health")).data as Record<string, unknown> | null,
    refetchInterval: 30_000,
  });

  // Realtime: refresh updates feed when new ones arrive
  useEffect(() => {
    const ch = supabase
      .channel("dpc-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "platform_policy_updates" }, () => {
        qc.invalidateQueries({ queryKey: ["dpc-updates"] });
        qc.invalidateQueries({ queryKey: ["dpc-health"] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [qc]);

  const runMonitor = useMutation({
    mutationFn: async () => (await supabase.functions.invoke("check-platform-policy-updates", { body: {} })).data,
    onSuccess: (data) => {
      const d = data as { checked?: number; changed?: number; failed?: number } | null;
      toast.success(`Monitor run: checked ${d?.checked ?? 0}, changes ${d?.changed ?? 0}, failed ${d?.failed ?? 0}`);
      qc.invalidateQueries();
    },
    onError: (e: unknown) => toast.error("Monitor failed: " + (e as Error).message),
  });

  const sendReminders = useMutation({
    mutationFn: async () => (await supabase.functions.invoke("send-training-reminders", { body: {} })).data,
    onSuccess: (data) => {
      const d = data as { notifications_created?: number } | null;
      toast.success(`Reminders sent: ${d?.notifications_created ?? 0}`);
    },
    onError: (e: unknown) => toast.error("Reminders failed: " + (e as Error).message),
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="border-primary/20 relative overflow-hidden">
        {/* animated gradient sweep */}
        <div className="pointer-events-none absolute inset-0 -z-0 opacity-60">
          <div className="absolute -inset-x-20 -top-20 h-40 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 blur-2xl animate-[shimmer_6s_linear_infinite]"
               style={{ backgroundSize: "200% 100%" }} />
        </div>
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3 gap-3 flex-wrap">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary"/>
              Digital Platform Training Center
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Live policy monitoring, HR review workflow, training & acknowledgements — connected to Lovable Cloud.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-emerald-500/40 bg-emerald-500/5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70"/>
                <span className="absolute inline-flex h-full w-full animate-[ping_2.4s_ease-out_infinite] rounded-full bg-emerald-400 opacity-30"/>
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"/>
              </span>
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent font-semibold">Live Policy Monitoring</span>
            </Badge>
            {isHr && (
              <>
                <Button size="sm" variant="outline" onClick={() => runMonitor.mutate()} disabled={runMonitor.isPending}>
                  <RefreshCw className={`size-3.5 mr-1.5 ${runMonitor.isPending ? "animate-spin" : ""}`}/> Run check
                </Button>
                <Button size="sm" variant="outline" onClick={() => sendReminders.mutate()} disabled={sendReminders.isPending}>
                  <Bell className="size-3.5 mr-1.5"/> Send reminders
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <HealthRow health={health.data} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {(platforms.data ?? []).map((p) => <PlatformCard key={p.id} platform={p} onOpen={() => setActive(p)} />)}
      </div>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-[min(96vw,1100px)] overflow-y-auto">
          {active && <PlatformWorkspace platform={active} isHr={isHr} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function HealthRow({ health }: { health: Record<string, unknown> | null | undefined }) {
  const h = health ?? {};
  const items: Array<[string, string | number]> = [
    ["Active sources", `${h.active_sources ?? 0}/${h.total_sources ?? 0}`],
    ["Pending review", Number(h.pending_updates ?? 0)],
    ["Published updates", Number(h.published_updates ?? 0)],
    ["Pending acks", Number(h.pending_acks ?? 0)],
    ["Last run", h.last_run ? new Date(String(h.last_run)).toLocaleString() : "—"],
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {items.map(([k, v], i) => (
        <div
          key={k}
          className="group relative rounded-md border p-3 overflow-hidden transition-all duration-300 hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(99,102,241,0.45)] animate-fade-in"
          style={{ animationDelay: `${i * 70}ms`, animationFillMode: "backwards" }}
        >
          <div className="pointer-events-none absolute inset-x-0 -top-1/2 h-full bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span className="size-1 rounded-full bg-primary/70 animate-pulse"/>
            {k}
          </div>
          <div className="text-lg font-bold mt-1 truncate tabular-nums">{v}</div>
        </div>
      ))}
    </div>
  );
}

function PlatformCard({ platform, onOpen }: { platform: Platform; onOpen: () => void }) {
  const Icon = ICONS[platform.slug] ?? Globe;
  const tint = TINTS[platform.slug] ?? "text-primary";
  const counts = useQuery({
    queryKey: ["platform-counts", platform.id],
    queryFn: async () => {
      const [pol, pending, pub] = await Promise.all([
        supabase.from("platform_policies").select("id", { count: "exact", head: true }).eq("platform_id", platform.id),
        supabase.from("platform_policy_updates").select("id", { count: "exact", head: true }).eq("platform_id", platform.id).eq("status", "pending_review"),
        supabase.from("platform_policy_updates").select("id", { count: "exact", head: true }).eq("platform_id", platform.id).eq("status", "published"),
      ]);
      return { policies: pol.count ?? 0, pending: pending.count ?? 0, published: pub.count ?? 0 };
    },
  });
  const pending = counts.data?.pending ?? 0;
  return (
    <button
      onClick={onOpen}
      className="group relative text-left rounded-lg border p-4 bg-card overflow-hidden transition-all duration-300 hover:border-primary/60 hover:-translate-y-1 hover:shadow-[0_12px_30px_-12px_rgba(99,102,241,0.5)] animate-fade-in"
    >
      <div className="pointer-events-none absolute -inset-px rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/10 via-transparent to-primary/5"/>
      <div className="relative flex items-center justify-between">
        <Icon className={`size-6 ${tint} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]`} />
        <Badge variant="outline" className="text-[10px]">{platform.status}</Badge>
      </div>
      <div className="relative mt-3 font-semibold">{platform.name}</div>
      <div className="relative text-xs text-muted-foreground mt-1 tabular-nums">
        {counts.data?.policies ?? 0} policies · {counts.data?.published ?? 0} published
      </div>
      {pending > 0 && (
        <div className="relative mt-2 inline-flex items-center gap-1.5 text-[11px] text-amber-300">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70"/>
            <span className="relative inline-flex size-1.5 rounded-full bg-amber-400"/>
          </span>
          <AlertTriangle className="size-3"/> {pending} pending review
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────

function PlatformWorkspace({ platform, isHr }: { platform: Platform; isHr: boolean }) {
  return (
    <div>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          {(() => { const I = ICONS[platform.slug] ?? Globe; return <I className={`size-5 ${TINTS[platform.slug] ?? "text-primary"}`}/>; })()}
          {platform.name}
        </SheetTitle>
      </SheetHeader>
      <Tabs defaultValue="overview" className="mt-4">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="updates">Daily Updates</TabsTrigger>
          {isHr && <TabsTrigger value="pending">Pending Review</TabsTrigger>}
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="acks">Acknowledgements</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="history">Change History</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="logs">Monitoring Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4"><OverviewTab platform={platform}/></TabsContent>
        <TabsContent value="policies" className="mt-4"><PoliciesTab platform={platform} isHr={isHr}/></TabsContent>
        <TabsContent value="updates" className="mt-4"><UpdatesTab platform={platform} statusFilter={["published","approved"]}/></TabsContent>
        {isHr && <TabsContent value="pending" className="mt-4"><PendingReviewTab platform={platform}/></TabsContent>}
        <TabsContent value="lessons" className="mt-4"><LessonsTab platform={platform} isHr={isHr}/></TabsContent>
        <TabsContent value="acks" className="mt-4"><AcksTab platform={platform} isHr={isHr}/></TabsContent>
        <TabsContent value="progress" className="mt-4"><ProgressTab platform={platform}/></TabsContent>
        <TabsContent value="history" className="mt-4"><HistoryTab platform={platform}/></TabsContent>
        <TabsContent value="sources" className="mt-4"><SourcesTab platform={platform} isHr={isHr}/></TabsContent>
        <TabsContent value="logs" className="mt-4"><LogsTab platform={platform}/></TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab({ platform }: { platform: Platform }) {
  const stats = useQuery({
    queryKey: ["overview", platform.id],
    queryFn: async () => {
      const [p, pen, pub, ack, prog, last] = await Promise.all([
        supabase.from("platform_policies").select("id", { count: "exact", head: true }).eq("platform_id", platform.id),
        supabase.from("platform_policy_updates").select("id", { count: "exact", head: true }).eq("platform_id", platform.id).eq("status", "pending_review"),
        supabase.from("platform_policy_updates").select("id", { count: "exact", head: true }).eq("platform_id", platform.id).eq("status", "published"),
        supabase.from("policy_acknowledgements").select("id", { count: "exact", head: true }).eq("platform_id", platform.id).eq("status", "pending"),
        supabase.from("employee_training_progress").select("id", { count: "exact", head: true }).eq("platform_id", platform.id).eq("status", "completed"),
        supabase.from("policy_monitoring_logs").select("checked_at,run_status").eq("platform_id", platform.id).order("checked_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      return {
        policies: p.count ?? 0, pending: pen.count ?? 0, published: pub.count ?? 0,
        pendingAck: ack.count ?? 0, completed: prog.count ?? 0,
        last: last.data,
      };
    },
  });
  const s = stats.data;
  const tiles = [
    ["Policies", s?.policies ?? 0],
    ["Published updates", s?.published ?? 0],
    ["Pending review", s?.pending ?? 0],
    ["Pending acknowledgements", s?.pendingAck ?? 0],
    ["Employees trained", s?.completed ?? 0],
    ["Last monitor run", s?.last?.checked_at ? new Date(s.last.checked_at).toLocaleString() : "—"],
  ] as const;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {tiles.map(([k, v]) => (
        <div key={k} className="rounded-md border p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
          <div className="text-lg font-bold mt-1 truncate">{v}</div>
        </div>
      ))}
      {platform.official_policy_url && (
        <a href={platform.official_policy_url} target="_blank" rel="noreferrer" className="col-span-full text-xs text-primary underline underline-offset-2">
          Official policy page →
        </a>
      )}
    </div>
  );
}

// ── Policies ────────────────────────────────────────────────────────────
function PoliciesTab({ platform, isHr }: { platform: Platform; isHr: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", category: POLICY_CATEGORIES[0], summary: "", current_content: "", risk_level: "medium" as Policy["risk_level"] });
  const q = useQuery({
    queryKey: ["policies", platform.id],
    queryFn: async () => (await supabase.from("platform_policies").select("*").eq("platform_id", platform.id).order("created_at", { ascending: false })).data ?? [],
  });
  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("platform_policies").insert({ platform_id: platform.id, ...form, status: "active", current_version: "v1.0" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Policy added"); setOpen(false); setForm({ title: "", category: POLICY_CATEGORIES[0], summary: "", current_content: "", risk_level: "medium" }); qc.invalidateQueries({ queryKey: ["policies", platform.id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-3">
      {isHr && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="size-3.5 mr-1.5"/> Add policy</Button>
        </div>
      )}
      {(q.data ?? []).length === 0 && <EmptyMsg icon={FileText} text="No policies yet. Add the first one or import from a source."/>}
      <div className="space-y-2">
        {(q.data ?? []).map((p) => (
          <div key={p.id} className="rounded-md border p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-sm">{p.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{p.category} · {p.current_version}</div>
                {p.summary && <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{p.summary}</p>}
              </div>
              <Badge variant="outline" className={SEVERITY_TONE[p.risk_level]}>{p.risk_level}</Badge>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add policy</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}/></Field>
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{POLICY_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Risk level">
              <Select value={form.risk_level} onValueChange={(v) => setForm((f) => ({ ...f, risk_level: v as Policy["risk_level"] }))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Summary"><Textarea rows={2} value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}/></Field>
            <Field label="Content"><Textarea rows={5} value={form.current_content} onChange={(e) => setForm((f) => ({ ...f, current_content: e.target.value }))}/></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => create.mutate()} disabled={!form.title || create.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Updates ─────────────────────────────────────────────────────────────
function UpdatesTab({ platform, statusFilter }: { platform: Platform; statusFilter: Array<Update["status"]> }) {
  const q = useQuery({
    queryKey: ["dpc-updates", platform.id, statusFilter.join(",")],
    queryFn: async () => (await supabase.from("platform_policy_updates").select("*").eq("platform_id", platform.id).in("status", statusFilter).order("published_at", { ascending: false, nullsFirst: false })).data ?? [],
  });
  if (!q.data?.length) return <EmptyMsg icon={Radio} text="No published updates yet. Approved updates from Pending Review appear here."/>;
  return (
    <div className="space-y-2">
      {q.data.map((u) => (
        <div key={u.id} className="rounded-md border p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-sm">{u.update_title}</div>
              {u.update_summary && <p className="text-sm text-muted-foreground mt-1">{u.update_summary}</p>}
              <div className="text-[11px] text-muted-foreground mt-2">
                {u.affected_team && <>Affects: <b>{u.affected_team}</b> · </>}
                Published {u.published_at ? new Date(u.published_at).toLocaleString() : "—"}
              </div>
              {u.action_required && <div className="text-xs mt-1.5 inline-flex items-center gap-1 text-amber-300"><AlertTriangle className="size-3"/> {u.action_required}</div>}
            </div>
            <Badge variant="outline" className={SEVERITY_TONE[u.severity]}>{u.severity}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Pending review ─────────────────────────────────────────────────────
function PendingReviewTab({ platform }: { platform: Platform }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["dpc-pending", platform.id],
    queryFn: async () => (await supabase.from("platform_policy_updates").select("*").eq("platform_id", platform.id).eq("status", "pending_review").order("detected_at", { ascending: false })).data ?? [],
  });
  const [editing, setEditing] = useState<Update | null>(null);

  const publish = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.functions.invoke("publish-approved-policy-update", { body: { updateId: id } });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Published to employees"); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const reject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("platform_policy_updates").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Rejected"); qc.invalidateQueries(); },
  });

  if (!q.data?.length) return <EmptyMsg icon={CheckCircle2} text="Nothing pending. Auto-detected changes will appear here for review."/>;

  return (
    <div className="space-y-2">
      {q.data.map((u) => (
        <div key={u.id} className="rounded-md border p-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <div className="font-semibold text-sm">{u.update_title}</div>
              <div className="text-[11px] text-muted-foreground">Detected {new Date(u.detected_at).toLocaleString()}</div>
            </div>
            <Badge variant="outline" className={SEVERITY_TONE[u.severity]}>{u.severity}</Badge>
          </div>
          {u.update_summary && <p className="text-sm text-muted-foreground">{u.update_summary}</p>}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => setEditing(u)}><Eye className="size-3.5 mr-1.5"/> Review & edit</Button>
            <Button size="sm" onClick={() => publish.mutate(u.id)} disabled={publish.isPending}><Send className="size-3.5 mr-1.5"/> Approve & publish</Button>
            <Button size="sm" variant="ghost" onClick={() => reject.mutate(u.id)}><XCircle className="size-3.5 mr-1.5"/> Reject</Button>
          </div>
        </div>
      ))}
      {editing && <EditUpdateDialog update={editing} onClose={() => setEditing(null)}/>}
    </div>
  );
}

function EditUpdateDialog({ update, onClose }: { update: Update; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    update_title: update.update_title,
    update_summary: update.update_summary ?? "",
    severity: update.severity,
    affected_team: update.affected_team ?? "",
    action_required: update.action_required ?? "",
    old_text: update.old_text ?? "",
    new_text: update.new_text ?? "",
  });
  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("platform_policy_updates").update(form).eq("id", update.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries(); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Review policy update</DialogTitle></DialogHeader>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <Field label="Title"><Input value={form.update_title} onChange={(e) => setForm((f) => ({ ...f, update_title: e.target.value }))}/></Field>
          <Field label="Summary"><Textarea rows={3} value={form.update_summary} onChange={(e) => setForm((f) => ({ ...f, update_summary: e.target.value }))}/></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Severity">
              <Select value={form.severity} onValueChange={(v) => setForm((f) => ({ ...f, severity: v as Update["severity"] }))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Affected team"><Input value={form.affected_team} onChange={(e) => setForm((f) => ({ ...f, affected_team: e.target.value }))}/></Field>
          </div>
          <Field label="Action required"><Input value={form.action_required} onChange={(e) => setForm((f) => ({ ...f, action_required: e.target.value }))}/></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Old text"><Textarea rows={4} value={form.old_text} onChange={(e) => setForm((f) => ({ ...f, old_text: e.target.value }))}/></Field>
            <Field label="New text"><Textarea rows={4} value={form.new_text} onChange={(e) => setForm((f) => ({ ...f, new_text: e.target.value }))}/></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Lessons ────────────────────────────────────────────────────────────
function LessonsTab({ platform, isHr }: { platform: Platform; isHr: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", lesson_content: "", level: "beginner" as Lesson["level"], estimated_minutes: 15, is_required: true, status: "published" as Lesson["status"] });
  const q = useQuery({
    queryKey: ["lessons", platform.id],
    queryFn: async () => (await supabase.from("training_lessons").select("*").eq("platform_id", platform.id).order("created_at", { ascending: false })).data ?? [],
  });
  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("training_lessons").insert({ ...form, platform_id: platform.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Lesson created"); setOpen(false); qc.invalidateQueries({ queryKey: ["lessons", platform.id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-3">
      {isHr && <div className="flex justify-end"><Button size="sm" onClick={() => setOpen(true)}><Plus className="size-3.5 mr-1.5"/> New lesson</Button></div>}
      {(q.data ?? []).length === 0 && <EmptyMsg icon={GraduationCap} text="No lessons yet. Create one to train employees on this platform."/>}
      <div className="grid md:grid-cols-2 gap-3">
        {(q.data ?? []).map((l) => (
          <div key={l.id} className="rounded-md border p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-sm">{l.title}</div>
              <Badge variant="outline" className="text-[10px]">{l.status}</Badge>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{l.level} · {l.estimated_minutes} min{l.is_required ? " · required" : ""}</div>
            {l.description && <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{l.description}</p>}
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New lesson</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}/></Field>
            <Field label="Description"><Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}/></Field>
            <Field label="Content"><Textarea rows={5} value={form.lesson_content} onChange={(e) => setForm((f) => ({ ...f, lesson_content: e.target.value }))}/></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Level">
                <Select value={form.level} onValueChange={(v) => setForm((f) => ({ ...f, level: v as Lesson["level"] }))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Minutes"><Input type="number" value={form.estimated_minutes} onChange={(e) => setForm((f) => ({ ...f, estimated_minutes: Number(e.target.value) }))}/></Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Lesson["status"] }))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent>
                </Select>
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => create.mutate()} disabled={!form.title || create.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Acknowledgements ────────────────────────────────────────────────────
function AcksTab({ platform, isHr }: { platform: Platform; isHr: boolean }) {
  const qc = useQueryClient();
  const user = useCurrentUser().data;
  const q = useQuery({
    queryKey: ["acks", platform.id, isHr, user?.id],
    queryFn: async () => {
      let qb = supabase.from("policy_acknowledgements").select("*, platform_policy_updates(update_title, severity)").eq("platform_id", platform.id);
      if (!isHr && user) qb = qb.eq("employee_id", user.id);
      return (await qb.order("assigned_at", { ascending: false })).data ?? [];
    },
    enabled: !!user,
  });
  const ack = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("policy_acknowledgements").update({ status: "acknowledged", acknowledged_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Acknowledged"); qc.invalidateQueries({ queryKey: ["acks", platform.id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!q.data?.length) return <EmptyMsg icon={ClipboardCheck} text="No acknowledgements yet. They are created when HR publishes policy updates."/>;
  return (
    <div className="space-y-2">
      {q.data.map((a) => {
        const upd = (a as Ack & { platform_policy_updates: { update_title: string; severity: string } | null }).platform_policy_updates;
        return (
          <div key={a.id} className="rounded-md border p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{upd?.update_title ?? "Policy update"}</div>
              <div className="text-[11px] text-muted-foreground">
                Assigned {new Date(a.assigned_at).toLocaleDateString()}
                {a.due_date && <> · Due {new Date(a.due_date).toLocaleDateString()}</>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={a.status === "overdue" ? SEVERITY_TONE.critical : a.status === "acknowledged" ? SEVERITY_TONE.low : SEVERITY_TONE.medium}>{a.status}</Badge>
              {a.status !== "acknowledged" && (a.employee_id === user?.id) && (
                <Button size="sm" onClick={() => ack.mutate(a.id)}><CheckCircle2 className="size-3.5 mr-1.5"/> Acknowledge</Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Progress ───────────────────────────────────────────────────────────
function ProgressTab({ platform }: { platform: Platform }) {
  const q = useQuery({
    queryKey: ["progress", platform.id],
    queryFn: async () => (await supabase.from("employee_training_progress").select("*, training_lessons(title)").eq("platform_id", platform.id).order("last_activity_at", { ascending: false, nullsFirst: false })).data ?? [],
  });
  if (!q.data?.length) return <EmptyMsg icon={Activity} text="No training activity yet."/>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-xs text-muted-foreground text-left border-b"><th className="py-2">Employee</th><th>Lesson</th><th>Status</th><th>Progress</th><th>Score</th><th>Last activity</th></tr></thead>
        <tbody>
          {q.data.map((r) => {
            const lesson = (r as { training_lessons: { title: string } | null }).training_lessons;
            return (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2 font-mono text-xs">{r.employee_id.slice(0, 8)}</td>
                <td>{lesson?.title ?? "—"}</td>
                <td><Badge variant="outline">{r.status}</Badge></td>
              <td>{`${r.progress_percent}%`}</td>
                <td>{r.quiz_score ?? "—"}</td>
                <td className="text-muted-foreground">{r.last_activity_at ? new Date(r.last_activity_at).toLocaleString() : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Change history ─────────────────────────────────────────────────────
function HistoryTab({ platform }: { platform: Platform }) {
  const q = useQuery({
    queryKey: ["history", platform.id],
      queryFn: async () => (await supabase.from("platform_policy_updates").select("*").eq("platform_id", platform.id).in("status", ["published","approved","rejected","archived"] as Update["status"][]).order("detected_at", { ascending: false })).data ?? [],
  });
  if (!q.data?.length) return <EmptyMsg icon={History} text="No change history yet."/>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-xs text-muted-foreground text-left border-b"><th className="py-2">Title</th><th>Status</th><th>Severity</th><th>Detected</th><th>Published</th></tr></thead>
        <tbody>
          {q.data.map((u) => (
            <tr key={u.id} className="border-b last:border-0">
              <td className="py-2">{u.update_title}</td>
              <td><Badge variant="outline">{u.status}</Badge></td>
              <td><Badge variant="outline" className={SEVERITY_TONE[u.severity]}>{u.severity}</Badge></td>
              <td className="text-muted-foreground">{new Date(u.detected_at).toLocaleDateString()}</td>
              <td className="text-muted-foreground">{u.published_at ? new Date(u.published_at).toLocaleDateString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Sources ────────────────────────────────────────────────────────────
function SourcesTab({ platform, isHr }: { platform: Platform; isHr: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Source | null>(null);
  const blank: Partial<Source> = { source_name: "", source_url: "", source_type: "official_url", is_active: true, check_frequency: "daily" };
  const [form, setForm] = useState<Partial<Source>>(blank);
  const q = useQuery({
    queryKey: ["sources", platform.id],
    queryFn: async () => (await supabase.from("platform_policy_sources").select("*").eq("platform_id", platform.id).order("created_at")).data ?? [],
  });
  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("platform_policy_sources").update(form).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("platform_policy_sources").insert({ platform_id: platform.id, source_name: form.source_name!, source_url: form.source_url ?? null, source_type: form.source_type!, is_active: form.is_active!, check_frequency: form.check_frequency! });
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Saved"); setOpen(false); setEditing(null); setForm(blank); qc.invalidateQueries({ queryKey: ["sources", platform.id] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("platform_policy_sources").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sources", platform.id] }),
  });
  const check = useMutation({
    mutationFn: async (id: string) => (await supabase.functions.invoke("check-platform-policy-updates", { body: { sourceId: id } })).data,
    onSuccess: () => { toast.success("Source checked"); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });

  function openEdit(s: Source) { setEditing(s); setForm(s); setOpen(true); }
  function openCreate() { setEditing(null); setForm(blank); setOpen(true); }

  return (
    <div className="space-y-3">
      {isHr && <div className="flex justify-end"><Button size="sm" onClick={openCreate}><Plus className="size-3.5 mr-1.5"/> Add source</Button></div>}
      {(q.data ?? []).length === 0 && <EmptyMsg icon={ListChecks} text="No sources yet. Add an official policy URL, RSS feed, or API source."/>}
      <div className="space-y-2">
        {(q.data ?? []).map((s) => (
          <div key={s.id} className="rounded-md border p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold flex items-center gap-2">{s.source_name}<Badge variant="outline" className="text-[10px]">{s.source_type}</Badge></div>
                {s.source_url && <a href={s.source_url} target="_blank" rel="noreferrer" className="text-xs text-primary truncate block max-w-md">{s.source_url}</a>}
                <div className="text-[11px] text-muted-foreground mt-1">
                  {s.check_frequency} · last {s.last_checked_at ? new Date(s.last_checked_at).toLocaleString() : "never"} · {s.last_status ?? "—"}
                </div>
              </div>
              {isHr && (
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={s.is_active} onCheckedChange={(v) => toggle.mutate({ id: s.id, active: v })}/>
                  <Button size="sm" variant="outline" onClick={() => check.mutate(s.id)} disabled={check.isPending}><RefreshCw className={`size-3.5 ${check.isPending ? "animate-spin" : ""}`}/></Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>Edit</Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit source" : "Add source"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Name"><Input value={form.source_name ?? ""} onChange={(e) => setForm((f) => ({ ...f, source_name: e.target.value }))}/></Field>
            <Field label="Source URL"><Input value={form.source_url ?? ""} onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))} placeholder="https://..."/></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <Select value={form.source_type} onValueChange={(v) => setForm((f) => ({ ...f, source_type: v as Source["source_type"] }))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="official_url">Official URL</SelectItem>
                    <SelectItem value="rss">RSS</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Check frequency">
                <Select value={form.check_frequency} onValueChange={(v) => setForm((f) => ({ ...f, check_frequency: v as Source["check_frequency"] }))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="manual">Manual</SelectItem></SelectContent>
                </Select>
              </Field>
            </div>
            <div className="flex items-center gap-2"><Switch checked={!!form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}/><span className="text-sm">Active</span></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!form.source_name || save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Logs ────────────────────────────────────────────────────────────────
function LogsTab({ platform }: { platform: Platform }) {
  const q = useQuery({
    queryKey: ["logs", platform.id],
    queryFn: async () => (await supabase.from("policy_monitoring_logs").select("*").eq("platform_id", platform.id).order("checked_at", { ascending: false }).limit(50)).data ?? [],
  });
  if (!q.data?.length) return <EmptyMsg icon={Activity} text="No monitoring runs yet for this platform."/>;
  return (
    <div className="space-y-2">
      {q.data.map((l) => (
        <div key={l.id} className="rounded-md border p-2 text-xs flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-medium">{l.message ?? l.run_status}</div>
            <div className="text-muted-foreground">{new Date(l.checked_at).toLocaleString()}{l.error_details ? ` · ${l.error_details}` : ""}</div>
          </div>
          <Badge variant="outline" className={l.run_status === "failed" ? SEVERITY_TONE.critical : l.run_status === "changes_detected" ? SEVERITY_TONE.high : SEVERITY_TONE.low}>{l.run_status}</Badge>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
function EmptyMsg({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="rounded-md border border-dashed p-8 text-center">
      <Icon className="size-6 mx-auto text-muted-foreground mb-2"/>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}