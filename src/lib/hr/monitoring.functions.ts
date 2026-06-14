import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FN_NAME = "check-platform-policy-updates";

async function callEdgeFn(body: Record<string, unknown>) {
  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${FN_NAME}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${SERVICE_ROLE}`,
      apikey: SERVICE_ROLE,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

async function assertHrOrAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("is_hr_or_admin", { _user_id: ctx.userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: HR/Admin only");
}

// ----- Health -----
export const getMonitoringHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("get_monitoring_health");
    if (error) throw new Error(error.message);
    return data;
  });

// ----- Sources -----
export const listSources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("platform_policy_sources")
      .select("*, digital_platforms(name, slug)")
      .order("source_name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const toggleSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), is_active: z.boolean() }))
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context);
    const { error } = await context.supabase
      .from("platform_policy_sources")
      .update({ is_active: data.is_active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const runManualCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ source_id: z.string().uuid().optional() }).optional())
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context);
    const result = await callEdgeFn(data?.source_id ? { source_id: data.source_id } : {});
    return result.body;
  });

// ----- Updates -----
export const listUpdates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ status: z.string().optional() }).optional())
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("platform_policy_updates")
      .select("*, digital_platforms(name, slug)")
      .order("detected_at", { ascending: false });
    if (data?.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const reviewUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid(),
    action: z.enum(["approve", "reject"]),
    summary: z.string().optional(),
    severity: z.enum(["low","medium","high","critical"]).optional(),
  }))
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context);
    const patch: any = {
      status: data.action === "approve" ? "approved" : "rejected",
      reviewed_by: context.userId,
      reviewed_at: new Date().toISOString(),
    };
    if (data.summary) patch.update_summary = data.summary;
    if (data.severity) patch.severity = data.severity;
    const { error } = await context.supabase
      .from("platform_policy_updates").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    await context.supabase.from("training_audit_logs").insert({
      action_type: `${data.action}_policy_update`,
      module: "digital_platform_training",
      user_id: context.userId,
      entity_id: data.id,
      description: `Policy update ${data.action}d`,
    });
    return { ok: true };
  });

export const publishUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc("publish_policy_update", { _update_id: data.id });
    if (error) throw new Error(error.message);
    return res;
  });

export const editUpdateSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), summary: z.string() }))
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context);
    const { error } = await context.supabase
      .from("platform_policy_updates")
      .update({ update_summary: data.summary })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----- Dev: create test update -----
export const createTestUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertHrOrAdmin(context);
    const { data: plat } = await context.supabase
      .from("digital_platforms").select("id, name").limit(1).single();
    if (!plat) throw new Error("No platform found");
    const title = `TEST update ${new Date().toLocaleTimeString()}`;
    const { data: upd, error } = await context.supabase
      .from("platform_policy_updates").insert({
        platform_id: plat.id,
        update_title: title,
        update_summary: "Synthetic record inserted by Live Monitoring Test.",
        new_text: "This is a synthetic policy update for realtime verification.",
        severity: "low",
        status: "pending_review",
      }).select("id").single();
    if (error) throw new Error(error.message);

    await context.supabase.from("policy_monitoring_logs").insert({
      platform_id: plat.id,
      run_status: "changes_detected",
      message: "Test update inserted",
      detected_updates_count: 1,
    });
    await context.supabase.from("notifications").insert({
      user_id: context.userId,
      type: "policy_update_detected",
      title: `TEST: ${title}`,
      body: "Synthetic notification for realtime verification.",
      entity_table: "platform_policy_updates",
      entity_id: upd!.id,
    });
    return upd;
  });

// ----- Acknowledgements -----
export const listAcknowledgements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("policy_acknowledgements")
      .select("*, platform_policy_updates(update_title, severity), digital_platforms(name)")
      .order("assigned_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const ackAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid(),
    action: z.enum(["acknowledge", "remind", "overdue", "manager_approve"]),
  }))
  .handler(async ({ data, context }) => {
    const now = new Date().toISOString();
    const patch: any = {};
    if (data.action === "acknowledge") { patch.status = "acknowledged"; patch.acknowledged_at = now; }
    if (data.action === "overdue") { patch.status = "overdue"; }
    if (data.action === "manager_approve") {
      patch.manager_approval_status = "approved";
      patch.manager_approved_by = context.userId;
      patch.manager_approved_at = now;
    }
    if (data.action === "remind") {
      const { data: ack } = await context.supabase
        .from("policy_acknowledgements").select("employee_id, policy_update_id").eq("id", data.id).single();
      if (ack) {
        await context.supabase.from("notifications").insert({
          user_id: ack.employee_id,
          type: "ack_reminder",
          title: "Reminder: acknowledge policy update",
          body: "Please acknowledge the assigned policy update.",
          entity_table: "policy_acknowledgements",
          entity_id: data.id,
        });
      }
      return { ok: true };
    }
    const { error } = await context.supabase
      .from("policy_acknowledgements").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----- Notifications -----
export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("notifications").update({ read: true }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----- Logs -----
export const listMonitoringLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("policy_monitoring_logs")
      .select("*, digital_platforms(name), platform_policy_sources(source_name, source_type)")
      .order("checked_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ----- Cron status -----
export const getCronStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertHrOrAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .schema("cron" as any)
      .from("job")
      .select("jobid, jobname, schedule, active")
      .ilike("jobname", "monitor-policy-updates%");
    if (error) return { enabled: false, jobs: [], error: error.message };
    return { enabled: (data ?? []).some((j: any) => j.active), jobs: data ?? [] };
  });

// ----- Permissions probe -----
export const runPermissionsProbe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const results: { name: string; passed: boolean; detail?: string }[] = [];
    const add = (name: string, passed: boolean, detail?: string) =>
      results.push({ name, passed, detail });

    const { data: isHr } = await context.supabase.rpc("is_hr_or_admin", { _user_id: context.userId });
    add("Session is HR or Admin", !!isHr, isHr ? "OK" : "Current user lacks HR/Admin role");

    const { error: srcReadErr } = await context.supabase.from("platform_policy_sources").select("id").limit(1);
    add("Can read policy sources", !srcReadErr, srcReadErr?.message);

    const { error: updReadErr } = await context.supabase.from("platform_policy_updates").select("id").limit(1);
    add("Can read policy updates", !updReadErr, updReadErr?.message);

    const { error: notifReadErr } = await context.supabase.from("notifications").select("id").limit(1);
    add("Can read own notifications", !notifReadErr, notifReadErr?.message);

    // Negative test: non-hr cannot insert source
    if (!isHr) {
      const { error: srcInsErr } = await context.supabase
        .from("platform_policy_sources").insert({ platform_id: "00000000-0000-0000-0000-000000000000", source_name: "x" });
      add("Non-HR blocked from writing sources", !!srcInsErr, srcInsErr?.message ?? "no error");
    } else {
      add("HR can mutate sources (skipped destructive check)", true);
    }

    return results;
  });