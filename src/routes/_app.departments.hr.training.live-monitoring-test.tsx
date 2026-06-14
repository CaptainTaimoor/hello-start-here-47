import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Activity, AlertCircle, CheckCircle2, XCircle, Clock, Radio, Database,
  Play, RefreshCw, Wifi, Bell, FileSearch, Shield, ListChecks,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  getMonitoringHealth, listSources, toggleSource, runManualCheck,
  listUpdates, reviewUpdate, publishUpdate, editUpdateSummary, createTestUpdate,
  listAcknowledgements, ackAction, listNotifications, markNotificationRead,
  listMonitoringLogs, getCronStatus, runPermissionsProbe,
} from "@/lib/hr/monitoring.functions";

export const Route = createFileRoute("/_app/departments/hr/training/live-monitoring-test")({
  head: () => ({ meta: [{ title: "Live Monitoring Test — Orvion HR" }] }),
  component: LiveMonitoringTestPage,
});

type Status = "passed" | "failed" | "warning" | "untested";
const statusBadge = (s: Status) => ({
  passed: <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">Passed</Badge>,
  failed: <Badge className="bg-rose-500/15 text-rose-300 border-rose-500/30">Failed</Badge>,
  warning: <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30">Warning</Badge>,
  untested: <Badge variant="outline">Not tested</Badge>,
}[s]);

function StatCard({ label, value, hint, tone = "default" }: { label: string; value: React.ReactNode; hint?: string; tone?: "default"|"good"|"bad"|"warn" }) {
  const toneCls = { default: "", good: "text-emerald-300", bad: "text-rose-300", warn: "text-amber-300" }[tone];
  return (
    <Card><CardContent className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-xl font-semibold mt-1 ${toneCls}`}>{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </CardContent></Card>
  );
}

function fmt(ts?: string | null) { return ts ? new Date(ts).toLocaleString() : "—"; }

function LiveMonitoringTestPage() {
  const qc = useQueryClient();
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting"|"connected"|"closed"|"error">("connecting");
  const [reviewing, setReviewing] = useState<any | null>(null);

  // server-fn bindings
  const _health = useServerFn(getMonitoringHealth);
  const _sources = useServerFn(listSources);
  const _toggle = useServerFn(toggleSource);
  const _check = useServerFn(runManualCheck);
  const _updates = useServerFn(listUpdates);
  const _review = useServerFn(reviewUpdate);
  const _publish = useServerFn(publishUpdate);
  const _editSum = useServerFn(editUpdateSummary);
  const _testIns = useServerFn(createTestUpdate);
  const _acks = useServerFn(listAcknowledgements);
  const _ackAct = useServerFn(ackAction);
  const _notifs = useServerFn(listNotifications);
  const _markRead = useServerFn(markNotificationRead);
  const _logs = useServerFn(listMonitoringLogs);
  const _cron = useServerFn(getCronStatus);
  const _probe = useServerFn(runPermissionsProbe);

  const health = useQuery({ queryKey: ["mon","health"], queryFn: () => _health({}) });
  const sources = useQuery({ queryKey: ["mon","sources"], queryFn: () => _sources({}) });
  const pending = useQuery({ queryKey: ["mon","updates","pending_review"], queryFn: () => _updates({ data: { status: "pending_review" } }) });
  const allUpdates = useQuery({ queryKey: ["mon","updates","all"], queryFn: () => _updates({}) });
  const acks = useQuery({ queryKey: ["mon","acks"], queryFn: () => _acks({}) });
  const notifs = useQuery({ queryKey: ["mon","notifs"], queryFn: () => _notifs({}) });
  const logs = useQuery({ queryKey: ["mon","logs"], queryFn: () => _logs({}) });
  const cron = useQuery({ queryKey: ["mon","cron"], queryFn: () => _cron({}) });
  const probe = useQuery({ queryKey: ["mon","probe"], queryFn: () => _probe({}) });

  // realtime
  useEffect(() => {
    const ch = supabase.channel("mon-test")
      .on("postgres_changes", { event: "*", schema: "public", table: "platform_policy_updates" }, () => {
        qc.invalidateQueries({ queryKey: ["mon","updates","pending_review"] });
        qc.invalidateQueries({ queryKey: ["mon","updates","all"] });
        qc.invalidateQueries({ queryKey: ["mon","health"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "policy_monitoring_logs" }, () => {
        qc.invalidateQueries({ queryKey: ["mon","logs"] });
        qc.invalidateQueries({ queryKey: ["mon","health"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        qc.invalidateQueries({ queryKey: ["mon","notifs"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "policy_acknowledgements" }, () => {
        qc.invalidateQueries({ queryKey: ["mon","acks"] });
        qc.invalidateQueries({ queryKey: ["mon","health"] });
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setRealtimeStatus("connected");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setRealtimeStatus("error");
        else if (status === "CLOSED") setRealtimeStatus("closed");
      });
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  // mutations
  const mCheck = useMutation({
    mutationFn: (vars?: { source_id?: string }) => _check(vars ? { data: vars } : {}),
    onSuccess: (r: any) => {
      const { changed = 0, failed = 0, checked = 0 } = r ?? {};
      if (changed > 0) toast.success(`${changed} change(s) detected · ${checked} checked`);
      else if (failed > 0) toast.warning(`${failed} of ${checked} source(s) failed`);
      else toast.success(`No changes detected (${checked} checked)`);
      qc.invalidateQueries({ queryKey: ["mon"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Check failed"),
  });
  const mToggle = useMutation({ mutationFn: (v: {id: string; is_active: boolean}) => _toggle({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["mon","sources"] }) });
  const mReview = useMutation({ mutationFn: (v: any) => _review({ data: v }), onSuccess: () => { toast.success("Review saved"); qc.invalidateQueries({ queryKey: ["mon"] }); setReviewing(null); } });
  const mPublish = useMutation({ mutationFn: (id: string) => _publish({ data: { id } }), onSuccess: (r: any) => { toast.success(`Published · ${r?.acks ?? 0} acks created`); qc.invalidateQueries({ queryKey: ["mon"] }); setReviewing(null); } });
  const mEditSum = useMutation({ mutationFn: (v: {id:string; summary:string}) => _editSum({ data: v }), onSuccess: () => toast.success("Summary updated") });
  const mTest = useMutation({ mutationFn: () => _testIns({}), onSuccess: () => toast.success("Test update inserted — watch the live panels") });
  const mAck = useMutation({ mutationFn: (v: any) => _ackAct({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["mon","acks"] }) });
  const mMarkRead = useMutation({ mutationFn: (id: string) => _markRead({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["mon","notifs"] }) });

  const h = (health.data ?? {}) as any;
  const isHrOrAdmin = !!h.is_hr_or_admin;

  // ----- Test Checklist -----
  const checklist: { name: string; status: Status; detail?: string }[] = useMemo(() => {
    const lastLog = (logs.data?.[0] as any);
    const anyPending = (h.pending_updates ?? 0) > 0;
    const anyPublished = (h.published_updates ?? 0) > 0;
    const anyAck = (acks.data?.length ?? 0) > 0;
    const anyNotif = (notifs.data?.length ?? 0) > 0;
    const anyLog = (logs.data?.length ?? 0) > 0;
    return [
      { name: "Supabase connection", status: health.isSuccess ? "passed" : health.isError ? "failed" : "untested" },
      { name: "Backend tables reachable", status: sources.isSuccess && updatesOrEmpty(allUpdates) ? "passed" : "failed" },
      { name: "Active policy source exists", status: (h.active_sources ?? 0) > 0 ? "passed" : "warning", detail: `${h.active_sources ?? 0} active` },
      { name: "Edge function callable", status: lastLog ? "passed" : "untested", detail: lastLog ? `last run ${fmt(lastLog.checked_at)}` : "Run a manual check" },
      { name: "Manual check ran", status: mCheck.isSuccess ? "passed" : mCheck.isError ? "failed" : "untested" },
      { name: "Change detection produced record", status: anyPending || anyPublished ? "passed" : "untested" },
      { name: "Pending review record created", status: anyPending ? "passed" : "untested" },
      { name: "Realtime channel connected", status: realtimeStatus === "connected" ? "passed" : realtimeStatus === "error" ? "failed" : "warning" },
      { name: "HR approval works", status: (allUpdates.data ?? []).some((u: any) => u.status === "approved" || u.status === "published") ? "passed" : "untested" },
      { name: "Publish workflow works", status: anyPublished ? "passed" : "untested" },
      { name: "Employee acknowledgement created", status: anyAck ? "passed" : "untested" },
      { name: "Notification created", status: anyNotif ? "passed" : "untested" },
      { name: "Monitoring log created", status: anyLog ? "passed" : "untested" },
      { name: "RLS permission probe", status: probe.data ? ((probe.data as any[]).every((p) => p.passed) ? "passed" : "warning") : "untested", detail: probe.data ? `${(probe.data as any[]).filter((p)=>p.passed).length}/${(probe.data as any[]).length}` : undefined },
    ];
  }, [health.isSuccess, health.isError, sources.isSuccess, allUpdates.data, h, realtimeStatus, mCheck.isSuccess, mCheck.isError, acks.data, notifs.data, logs.data, probe.data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Monitoring Test"
        description="End-to-end verification of the Digital Platform policy monitoring pipeline."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/departments/hr">Back to HR</Link></Button>
            <Button size="sm" onClick={() => mCheck.mutate(undefined)} disabled={mCheck.isPending || !isHrOrAdmin}>
              {mCheck.isPending ? <RefreshCw className="size-4 mr-2 animate-spin"/> : <Play className="size-4 mr-2"/>}
              Run Live Policy Check Now
            </Button>
          </div>
        }
      />

      {!isHrOrAdmin && health.isSuccess && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-sm flex gap-2 items-start">
            <AlertCircle className="size-4 text-amber-400 mt-0.5"/>
            <div>You are signed in but do not have the <b>HR</b> or <b>Admin</b> role. Read access works, but mutations (run check, approve, publish) will fail with a Forbidden error.</div>
          </CardContent>
        </Card>
      )}

      {/* 1. System Health */}
      <section>
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-2"><Activity className="size-4"/> System Health</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          <StatCard label="Supabase" value={health.isSuccess ? "Connected" : health.isError ? "Error" : "…"} tone={health.isSuccess?"good":health.isError?"bad":"default"}/>
          <StatCard label="Tables" value={sources.isSuccess ? "OK" : "…"} tone={sources.isSuccess?"good":"default"}/>
          <StatCard label="Edge function" value={mCheck.isError ? "Error" : (logs.data?.length ? "Reachable" : "Unknown")} tone={mCheck.isError?"bad":(logs.data?.length?"good":"default")} hint="Reachable if any log exists"/>
          <StatCard label="Realtime" value={realtimeStatus} tone={realtimeStatus==="connected"?"good":realtimeStatus==="error"?"bad":"warn"}/>
          <StatCard label="Cron" value={cron.data ? (cron.data as any).enabled ? "Enabled" : "Disabled" : "…"} tone={(cron.data as any)?.enabled?"good":"warn"}/>
          <StatCard label="Last run" value={fmt(h.last_run)}/>
          <StatCard label="Last success" value={fmt(h.last_success)} tone="good"/>
          <StatCard label="Last failed" value={fmt(h.last_failed)} tone={h.last_failed?"bad":"default"}/>
          <StatCard label="Active sources" value={h.active_sources ?? "—"}/>
          <StatCard label="Pending review" value={h.pending_updates ?? "—"} tone={(h.pending_updates??0)>0?"warn":"default"}/>
          <StatCard label="Published updates" value={h.published_updates ?? "—"}/>
          <StatCard label="Acks pending" value={h.pending_acks ?? "—"}/>
        </div>
      </section>

      {/* 2. Platform Sources */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="size-4"/> Platform sources</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted-foreground text-left border-b">
              <th className="py-2">Platform</th><th>Source URL</th><th>Type</th><th>Frequency</th><th>Last checked</th><th>Status</th><th>Active</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {(sources.data ?? []).map((s: any) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{s.digital_platforms?.name ?? "—"}</td>
                  <td className="max-w-[280px] truncate"><a className="text-primary underline" href={s.source_url} target="_blank" rel="noreferrer">{s.source_url}</a></td>
                  <td><Badge variant="outline">{s.source_type}</Badge></td>
                  <td>{s.check_frequency}</td>
                  <td className="text-xs text-muted-foreground">{fmt(s.last_checked_at)}</td>
                  <td><Badge variant="outline" className={s.last_status === "ok" ? "border-emerald-500/40 text-emerald-300" : s.last_status ? "border-rose-500/40 text-rose-300" : ""}>{s.last_status ?? "—"}</Badge></td>
                  <td><Switch checked={!!s.is_active} onCheckedChange={(v) => mToggle.mutate({ id: s.id, is_active: v })} disabled={!isHrOrAdmin}/></td>
                  <td><Button size="sm" variant="outline" onClick={() => mCheck.mutate({ source_id: s.id })} disabled={mCheck.isPending || !isHrOrAdmin}>Test source</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 3 + 4. Realtime test */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wifi className="size-4"/> Realtime test panel</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge className={realtimeStatus==="connected"?"bg-emerald-500/15 text-emerald-300 border-emerald-500/30":"bg-amber-500/15 text-amber-300 border-amber-500/30"}>Channel: {realtimeStatus}</Badge>
            <Badge variant="outline">platform_policy_updates</Badge>
            <Badge variant="outline">policy_monitoring_logs</Badge>
            <Badge variant="outline">notifications</Badge>
            <Badge variant="outline">policy_acknowledgements</Badge>
            <Button size="sm" variant="outline" onClick={() => mTest.mutate()} disabled={mTest.isPending || !isHrOrAdmin}>Create test update</Button>
          </div>
          <p className="text-xs text-muted-foreground">Insert a synthetic pending-review row, log, and notification. The panels below update without a page refresh if realtime is wired correctly.</p>
        </CardContent>
      </Card>

      {/* 5. Pending Review */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileSearch className="size-4"/> Pending review queue</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {(pending.data ?? []).length === 0 ? (
            <div className="text-sm text-muted-foreground">No updates awaiting review.</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-muted-foreground text-left border-b">
                <th className="py-2">Platform</th><th>Title</th><th>Severity</th><th>Detected</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {(pending.data ?? []).map((u: any) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2">{u.digital_platforms?.name ?? "—"}</td>
                    <td className="font-medium max-w-[320px] truncate">{u.update_title}</td>
                    <td><Badge variant="outline">{u.severity}</Badge></td>
                    <td className="text-xs text-muted-foreground">{fmt(u.detected_at)}</td>
                    <td><Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30">{u.status}</Badge></td>
                    <td className="flex gap-1 py-2">
                      <Button size="sm" variant="outline" onClick={() => setReviewing(u)}>View / Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* 7. Acknowledgements + 8. Notifications + 9. Logs in tabs */}
      <Tabs defaultValue="acks">
        <TabsList>
          <TabsTrigger value="acks">Acknowledgements</TabsTrigger>
          <TabsTrigger value="notifs">Notifications</TabsTrigger>
          <TabsTrigger value="logs">Monitoring logs</TabsTrigger>
        </TabsList>

        <TabsContent value="acks" className="mt-3">
          <Card><CardContent className="p-4 overflow-x-auto">
            {(acks.data ?? []).length === 0 ? <div className="text-sm text-muted-foreground">No acknowledgements yet. Publish a pending update to generate them.</div> : (
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-muted-foreground text-left border-b">
                  <th className="py-2">Employee</th><th>Platform</th><th>Policy</th><th>Status</th><th>Due</th><th>Ack at</th><th>Mgr</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {(acks.data ?? []).map((a: any) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="py-2 font-mono text-xs">{a.employee_id.slice(0,8)}…</td>
                      <td>{a.digital_platforms?.name ?? "—"}</td>
                      <td className="max-w-[240px] truncate">{a.platform_policy_updates?.update_title ?? "—"}</td>
                      <td><Badge variant="outline">{a.status}</Badge></td>
                      <td className="text-xs">{fmt(a.due_date)}</td>
                      <td className="text-xs">{fmt(a.acknowledged_at)}</td>
                      <td className="text-xs">{a.manager_approval_status ?? "—"}</td>
                      <td className="flex gap-1 py-2">
                        <Button size="sm" variant="outline" onClick={() => mAck.mutate({ id: a.id, action: "acknowledge" })}>Ack</Button>
                        <Button size="sm" variant="outline" onClick={() => mAck.mutate({ id: a.id, action: "remind" })}>Remind</Button>
                        <Button size="sm" variant="outline" onClick={() => mAck.mutate({ id: a.id, action: "overdue" })}>Overdue</Button>
                        <Button size="sm" variant="outline" onClick={() => mAck.mutate({ id: a.id, action: "manager_approve" })} disabled={!isHrOrAdmin}>Mgr ✓</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="notifs" className="mt-3">
          <Card><CardContent className="p-4 space-y-2">
            {(notifs.data ?? []).length === 0 ? <div className="text-sm text-muted-foreground">No notifications yet.</div> :
              (notifs.data ?? []).map((n: any) => (
                <div key={n.id} className={`rounded-md border p-3 flex justify-between items-start ${n.read ? "opacity-60" : ""}`}>
                  <div>
                    <div className="flex gap-2 items-center"><Bell className="size-3"/><b className="text-sm">{n.title}</b><Badge variant="outline" className="text-[10px]">{n.type}</Badge></div>
                    <div className="text-xs text-muted-foreground mt-1">{n.body}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{fmt(n.created_at)}</div>
                  </div>
                  {!n.read && <Button size="sm" variant="ghost" onClick={() => mMarkRead.mutate(n.id)}>Mark read</Button>}
                </div>
              ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-3">
          <Card><CardContent className="p-4 overflow-x-auto">
            {(logs.data ?? []).length === 0 ? <div className="text-sm text-muted-foreground">No monitoring logs yet.</div> : (
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-muted-foreground text-left border-b">
                  <th className="py-2">Time</th><th>Platform</th><th>Source</th><th>Status</th><th>Message</th><th>Changes</th>
                </tr></thead>
                <tbody>
                  {(logs.data ?? []).map((l: any) => (
                    <tr key={l.id} className="border-b last:border-0">
                      <td className="py-2 text-xs">{fmt(l.checked_at)}</td>
                      <td>{l.digital_platforms?.name ?? "—"}</td>
                      <td className="text-xs">{l.platform_policy_sources?.source_name ?? "—"}</td>
                      <td>
                        <Badge variant="outline" className={
                          l.run_status === "failed" ? "border-rose-500/40 text-rose-300" :
                          l.run_status === "changes_detected" ? "border-amber-500/40 text-amber-300" :
                          "border-emerald-500/40 text-emerald-300"
                        }>{l.run_status}</Badge>
                      </td>
                      <td className="text-xs">{l.message ?? l.error_details ?? "—"}</td>
                      <td>{l.detected_updates_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* 10. Cron */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="size-4"/> Scheduled monitoring</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {cron.data ? (
            (cron.data as any).error ? (
              <div className="text-amber-300 text-xs">Could not read cron schedule: {(cron.data as any).error}</div>
            ) : (cron.data as any).jobs.length === 0 ? (
              <div className="text-muted-foreground text-xs">No scheduled jobs found.</div>
            ) : (cron.data as any).jobs.map((j: any) => (
              <div key={j.jobid} className="flex justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{j.jobname}</div>
                  <div className="text-xs text-muted-foreground">schedule: <code>{j.schedule}</code></div>
                </div>
                <Badge variant="outline" className={j.active ? "border-emerald-500/40 text-emerald-300" : "border-amber-500/40 text-amber-300"}>{j.active ? "Active" : "Paused"}</Badge>
              </div>
            ))
          ) : <div className="text-xs text-muted-foreground">Loading…</div>}
          <p className="text-xs text-muted-foreground">Runs daily at 03:00 UTC. Use “Run Live Policy Check Now” at the top to trigger immediately.</p>
        </CardContent>
      </Card>

      {/* 11. Checklist */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ListChecks className="size-4"/> Test checklist</CardTitle></CardHeader>
        <CardContent>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {checklist.map((c) => (
              <li key={c.name} className="rounded-md border p-3 flex justify-between items-center">
                <div>
                  <div className="flex gap-2 items-center">
                    {c.status === "passed" ? <CheckCircle2 className="size-4 text-emerald-400"/> :
                     c.status === "failed" ? <XCircle className="size-4 text-rose-400"/> :
                     c.status === "warning" ? <AlertCircle className="size-4 text-amber-400"/> :
                     <Clock className="size-4 text-muted-foreground"/>}
                    <span>{c.name}</span>
                  </div>
                  {c.detail && <div className="text-xs text-muted-foreground mt-0.5 ml-6">{c.detail}</div>}
                </div>
                {statusBadge(c.status)}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 12. Permissions probe */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Shield className="size-4"/> Permissions probe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span>Probes run as the current logged-in user (RLS applies).</span>
            <Button size="sm" variant="outline" onClick={() => probe.refetch()}>Re-run</Button>
          </div>
          <ul className="space-y-2 text-sm">
            {(probe.data as any[] | undefined)?.map((p) => (
              <li key={p.name} className="rounded-md border p-3 flex justify-between items-start gap-3">
                <div>
                  <div className="font-medium">{p.name}</div>
                  {p.detail && <div className="text-xs text-muted-foreground">{p.detail}</div>}
                </div>
                {p.passed ? <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">Pass</Badge> : <Badge className="bg-rose-500/15 text-rose-300 border-rose-500/30">Fail</Badge>}
              </li>
            )) ?? <li className="text-xs text-muted-foreground">Loading…</li>}
          </ul>
        </CardContent>
      </Card>

      {/* Review drawer */}
      <ReviewDialog
        item={reviewing}
        onClose={() => setReviewing(null)}
        onReview={(action, payload) => mReview.mutate({ id: reviewing.id, action, ...payload })}
        onPublish={() => mPublish.mutate(reviewing.id)}
        onSaveSummary={(summary) => mEditSum.mutate({ id: reviewing.id, summary })}
        canPublish={isHrOrAdmin}
      />
    </div>
  );
}

function updatesOrEmpty(q: { isSuccess: boolean }) { return q.isSuccess; }

function ReviewDialog({ item, onClose, onReview, onPublish, onSaveSummary, canPublish }: {
  item: any | null;
  onClose: () => void;
  onReview: (action: "approve"|"reject", payload: { summary?: string; severity?: string }) => void;
  onPublish: () => void;
  onSaveSummary: (s: string) => void;
  canPublish: boolean;
}) {
  const [summary, setSummary] = useState("");
  const [severity, setSeverity] = useState<string>("medium");
  useEffect(() => { if (item) { setSummary(item.update_summary ?? ""); setSeverity(item.severity ?? "medium"); } }, [item]);
  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item.update_title}</DialogTitle></DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Severity</div>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  {["low","medium","high","critical"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Status</div>
              <Badge variant="outline">{item.status}</Badge>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">HR summary</div>
            <Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)}/>
            <div className="text-right mt-1">
              <Button size="sm" variant="ghost" onClick={() => onSaveSummary(summary)}>Save summary</Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Old text</div>
              <pre className="text-xs whitespace-pre-wrap rounded-md border p-3 bg-muted/30 max-h-64 overflow-auto">{item.old_text ?? "(none)"}</pre>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">New text</div>
              <pre className="text-xs whitespace-pre-wrap rounded-md border p-3 bg-muted/30 max-h-64 overflow-auto">{item.new_text ?? "(none)"}</pre>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => onReview("reject", { summary, severity })}>Reject</Button>
          <Button variant="outline" onClick={() => onReview("approve", { summary, severity })}>Approve</Button>
          <Button onClick={onPublish} disabled={!canPublish || item.status === "published"}>Publish to employees</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}