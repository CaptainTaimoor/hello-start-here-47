// Edge function: scans active official policy sources, hashes their HTML body,
// and only creates pending_review updates when the hash changes.
// Never auto-publishes. All detected changes require HR/Admin review.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let body: { source_id?: string } = {};
  try { body = await req.json(); } catch { /* empty body ok */ }

  let q = admin.from("platform_policy_sources").select("*").eq("is_active", true);
  if (body.source_id) q = admin.from("platform_policy_sources").select("*").eq("id", body.source_id);
  const { data: sources, error: srcErr } = await q;
  if (srcErr) {
    return new Response(JSON.stringify({ ok: false, error: srcErr.message }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  // HR/Admin user ids for notifications
  const { data: hrRoles } = await admin
    .from("user_roles")
    .select("user_id")
    .in("role", ["super_admin", "admin", "hr"]);
  const hrUserIds = (hrRoles ?? []).map((r) => r.user_id);

  const results: any[] = [];
  let changed = 0, failed = 0;

  for (const src of sources ?? []) {
    const checked_at = new Date().toISOString();
    try {
      if (!src.source_url) {
        await admin.from("policy_monitoring_logs").insert({
          platform_id: src.platform_id, source_id: src.id,
          run_status: "failed", message: "Missing source_url", checked_at,
        });
        failed++;
        results.push({ source_id: src.id, status: "failed", reason: "missing_url" });
        continue;
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const resp = await fetch(src.source_url, {
        headers: {
          "user-agent": "OrvionMedia-PolicyMonitor/1.0 (+hr-compliance)",
          accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));

      if (!resp.ok) {
        const msg = `HTTP ${resp.status} ${resp.statusText}`;
        await admin.from("platform_policy_sources")
          .update({ last_checked_at: checked_at, last_status: msg }).eq("id", src.id);
        await admin.from("policy_monitoring_logs").insert({
          platform_id: src.platform_id, source_id: src.id,
          run_status: "failed", message: msg, error_details: msg, checked_at,
        });
        failed++;
        results.push({ source_id: src.id, status: "failed", reason: msg });
        continue;
      }

      const html = await resp.text();
      const text = stripHtml(html).slice(0, 200_000);
      const hash = await sha256(text);
      const previous_hash = src.content_hash as string | null;

      if (previous_hash && previous_hash === hash) {
        await admin.from("platform_policy_sources")
          .update({ last_checked_at: checked_at, last_status: "ok" }).eq("id", src.id);
        await admin.from("policy_monitoring_logs").insert({
          platform_id: src.platform_id, source_id: src.id,
          run_status: "no_change", message: "No change detected", checked_at,
        });
        results.push({ source_id: src.id, status: "no_change" });
        continue;
      }

      // First check OR content changed → record source state.
      // Only create a pending review row when there was a previous hash.
      await admin.from("platform_policy_sources")
        .update({ content_hash: hash, last_checked_at: checked_at, last_status: "ok" })
        .eq("id", src.id);

      if (!previous_hash) {
        await admin.from("policy_monitoring_logs").insert({
          platform_id: src.platform_id, source_id: src.id,
          run_status: "success", message: "Baseline hash recorded", checked_at,
        });
        results.push({ source_id: src.id, status: "baseline" });
        continue;
      }

      const { data: upd } = await admin.from("platform_policy_updates").insert({
        platform_id: src.platform_id,
        source_id: src.id,
        update_title: `Detected change at ${src.source_name}`,
        update_summary: `Source content changed at ${src.source_url}. Review and publish to roll out to employees.`,
        new_text: text.slice(0, 50_000),
        change_type: "updated_policy",
        severity: "medium",
        status: "pending_review",
      }).select("id").single();

      await admin.from("policy_monitoring_logs").insert({
        platform_id: src.platform_id, source_id: src.id,
        run_status: "changes_detected",
        message: `Change detected; pending_review created`,
        detected_updates_count: 1, checked_at,
      });

      if (upd?.id && hrUserIds.length) {
        await admin.from("notifications").insert(
          hrUserIds.map((uid: string) => ({
            user_id: uid,
            type: "policy_update_detected",
            title: `Policy change detected: ${src.source_name}`,
            body: `A change was detected at ${src.source_url}. Review pending.`,
            entity_table: "platform_policy_updates",
            entity_id: upd.id,
          })),
        );
      }

      changed++;
      results.push({ source_id: src.id, status: "changed", update_id: upd?.id });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await admin.from("policy_monitoring_logs").insert({
        platform_id: src.platform_id, source_id: src.id,
        run_status: "failed", message: "Fetch error", error_details: msg, checked_at,
      });
      failed++;
      results.push({ source_id: src.id, status: "failed", reason: msg });
    }
  }

  return new Response(
    JSON.stringify({ ok: true, checked: results.length, changed, failed, results }),
    { headers: { ...corsHeaders, "content-type": "application/json" } },
  );
});