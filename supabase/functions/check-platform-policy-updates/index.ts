// Daily monitor: fetches every active policy source, hashes the response,
// and creates a `pending_review` entry in platform_policy_updates whenever
// the content hash changes. Never publishes directly to employees.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let body: { sourceId?: string; manual?: boolean } = {};
  try { body = await req.json(); } catch { /* empty body OK for cron */ }

  const query = supabase.from("platform_policy_sources").select("*").eq("is_active", true);
  if (body.sourceId) query.eq("id", body.sourceId);
  const { data: sources, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  let checked = 0, changed = 0, failed = 0;

  for (const src of sources ?? []) {
    checked++;
    let runStatus: "success" | "failed" | "no_change" | "changes_detected" = "success";
    let message = "";
    let detectedCount = 0;
    let errorDetails: string | null = null;

    try {
      if (src.source_type === "manual" || !src.source_url) {
        runStatus = "no_change";
        message = "Manual source — skipped automated fetch";
      } else {
        const res = await fetch(src.source_url, { headers: { "User-Agent": "OrvionMedia-PolicyMonitor/1.0" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = (await res.text()).slice(0, 200_000);
        const hash = await sha256(text);

        if (src.content_hash && src.content_hash !== hash) {
          // changed — create pending review record
          await supabase.from("platform_policy_updates").insert({
            platform_id: src.platform_id,
            source_id: src.id,
            update_title: `Auto-detected change on ${src.source_name}`,
            update_summary: `Source content changed at ${src.source_url}. HR review required before publishing to employees.`,
            change_type: "updated_policy",
            severity: "medium",
            status: "pending_review",
          });
          runStatus = "changes_detected";
          detectedCount = 1;
          changed++;
          message = "Content hash changed";
        } else if (!src.content_hash) {
          runStatus = "success";
          message = "Initial snapshot captured";
        } else {
          runStatus = "no_change";
          message = "No change detected";
        }

        await supabase.from("platform_policy_sources").update({
          content_hash: hash, last_checked_at: new Date().toISOString(), last_status: runStatus,
        }).eq("id", src.id);
      }
    } catch (e) {
      runStatus = "failed";
      failed++;
      errorDetails = (e as Error).message;
      message = `Fetch failed: ${errorDetails}`;
      await supabase.from("platform_policy_sources").update({
        last_checked_at: new Date().toISOString(), last_status: "failed",
      }).eq("id", src.id);
    }

    await supabase.from("policy_monitoring_logs").insert({
      platform_id: src.platform_id,
      source_id: src.id,
      run_status: runStatus,
      message,
      detected_updates_count: detectedCount,
      error_details: errorDetails,
    });
  }

  return new Response(
    JSON.stringify({ ok: true, checked, changed, failed }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});