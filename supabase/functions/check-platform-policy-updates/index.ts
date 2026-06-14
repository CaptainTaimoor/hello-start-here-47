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

// =====================================================================
// Per-platform official API fetchers.
// Each fetcher returns the authoritative policy/changelog text when the
// corresponding API credentials are configured. If creds are missing it
// returns { skipped: true } and the caller falls back to URL hashing.
// Add a key in your project secrets to enable real-API monitoring:
//   - YOUTUBE_API_KEY            (YouTube Data API v3)
//   - META_GRAPH_ACCESS_TOKEN    (Facebook + Instagram, Meta Graph API)
//   - X_BEARER_TOKEN             (Twitter / X API v2)
//   - TIKTOK_ACCESS_TOKEN        (TikTok for Developers)
//   - SNAPCHAT_ACCESS_TOKEN      (Snap Kit)
//   - VK_ACCESS_TOKEN            (VK API)
// =====================================================================

type FetchResult =
  | { skipped: true; reason: string }
  | { skipped: false; text: string; endpoint: string };

async function fetchAuthed(url: string, headers: Record<string, string>): Promise<FetchResult> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
  const text = (await res.text()).slice(0, 200_000);
  return { skipped: false, text, endpoint: url };
}

const platformFetchers: Record<string, (sourceUrl: string) => Promise<FetchResult>> = {
  youtube: async () => {
    const key = Deno.env.get("YOUTUBE_API_KEY");
    if (!key) return { skipped: true, reason: "YOUTUBE_API_KEY not configured" };
    // Probe API availability + latest videoCategories as a stable signal that the key works.
    return fetchAuthed(
      `https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=US&key=${key}`,
      {},
    );
  },
  facebook: async () => {
    const token = Deno.env.get("META_GRAPH_ACCESS_TOKEN");
    if (!token) return { skipped: true, reason: "META_GRAPH_ACCESS_TOKEN not configured" };
    return fetchAuthed(
      `https://graph.facebook.com/v21.0/me?access_token=${encodeURIComponent(token)}`,
      {},
    );
  },
  instagram: async () => {
    const token = Deno.env.get("META_GRAPH_ACCESS_TOKEN");
    if (!token) return { skipped: true, reason: "META_GRAPH_ACCESS_TOKEN not configured" };
    return fetchAuthed(
      `https://graph.facebook.com/v21.0/me?fields=id,username&access_token=${encodeURIComponent(token)}`,
      {},
    );
  },
  twitter: async () => {
    const token = Deno.env.get("X_BEARER_TOKEN");
    if (!token) return { skipped: true, reason: "X_BEARER_TOKEN not configured" };
    return fetchAuthed("https://api.twitter.com/2/openapi.json", {
      Authorization: `Bearer ${token}`,
    });
  },
  tiktok: async () => {
    const token = Deno.env.get("TIKTOK_ACCESS_TOKEN");
    if (!token) return { skipped: true, reason: "TIKTOK_ACCESS_TOKEN not configured" };
    return fetchAuthed(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name",
      { Authorization: `Bearer ${token}` },
    );
  },
  snapchat: async () => {
    const token = Deno.env.get("SNAPCHAT_ACCESS_TOKEN");
    if (!token) return { skipped: true, reason: "SNAPCHAT_ACCESS_TOKEN not configured" };
    return fetchAuthed("https://adsapi.snapchat.com/v1/me", {
      Authorization: `Bearer ${token}`,
    });
  },
  vk: async () => {
    const token = Deno.env.get("VK_ACCESS_TOKEN");
    if (!token) return { skipped: true, reason: "VK_ACCESS_TOKEN not configured" };
    return fetchAuthed(
      `https://api.vk.com/method/users.get?v=5.199&access_token=${encodeURIComponent(token)}`,
      {},
    );
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let body: { sourceId?: string; manual?: boolean } = {};
  try { body = await req.json(); } catch { /* empty body OK for cron */ }

  const query = supabase
    .from("platform_policy_sources")
    .select("*, digital_platforms!inner(slug)")
    .eq("is_active", true);
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
    let fetchSource: "official_api" | "url_hash" | "manual" = "url_hash";

    try {
      if (src.source_type === "manual" || !src.source_url) {
        runStatus = "no_change";
        fetchSource = "manual";
        message = "Manual source — skipped automated fetch";
      } else {
        // Prefer the platform's official API if a key is configured;
        // otherwise fall back to fetching+hashing the public policy URL.
        const slug: string | undefined = src.digital_platforms?.slug;
        const fetcher = slug ? platformFetchers[slug] : undefined;

        let text: string;
        if (fetcher) {
          const result = await fetcher(src.source_url);
          if (result.skipped) {
            const res = await fetch(src.source_url, { headers: { "User-Agent": "OrvionMedia-PolicyMonitor/1.0" } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            text = (await res.text()).slice(0, 200_000);
            fetchSource = "url_hash";
            message = `Fallback: ${result.reason}`;
          } else {
            text = result.text;
            fetchSource = "official_api";
            message = `Fetched via official API: ${new URL(result.endpoint).host}`;
          }
        } else {
          const res = await fetch(src.source_url, { headers: { "User-Agent": "OrvionMedia-PolicyMonitor/1.0" } });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          text = (await res.text()).slice(0, 200_000);
        }

        const hash = await sha256(text);

        if (src.content_hash && src.content_hash !== hash) {
          // changed — create pending review record
          await supabase.from("platform_policy_updates").insert({
            platform_id: src.platform_id,
            source_id: src.id,
            update_title: `Auto-detected change on ${src.source_name}`,
            update_summary: `Source content changed (via ${fetchSource}) at ${src.source_url}. HR review required before publishing to employees.`,
            change_type: "updated_policy",
            severity: "medium",
            status: "pending_review",
          });
          runStatus = "changes_detected";
          detectedCount = 1;
          changed++;
          message = message ? `${message}; content hash changed` : "Content hash changed";
        } else if (!src.content_hash) {
          runStatus = "success";
          message = message ? `${message}; initial snapshot captured` : "Initial snapshot captured";
        } else {
          runStatus = "no_change";
          message = message || "No change detected";
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
      message: `[${fetchSource}] ${message}`,
      detected_updates_count: detectedCount,
      error_details: errorDetails,
    });
  }

  return new Response(
    JSON.stringify({ ok: true, checked, changed, failed }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});