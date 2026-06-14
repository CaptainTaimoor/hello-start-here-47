## Goal

Build a single test/admin dashboard at **Departments → HR → Training → Digital Platform Training Center → Live Monitoring Test** that proves the full policy-monitoring pipeline works end-to-end against the real backend (database, edge function, realtime, RLS).

Route: `/_app/departments/hr/training/live-monitoring-test` (HR/Admin gated in-component; uses existing `_app` layout).

## Scope clarifications

- **No real external scraping in this turn.** The edge function fetches each official source URL with `fetch()`, hashes the response body, compares to the last stored hash, and only inserts a `pending_review` row when the hash differs. Many official sites (YouTube Help, Meta Transparency, etc.) block server-side fetches with 403 / CORS at the origin — the function logs that as `failed` with the real HTTP status. No mock scrapers, no random sources.
- **Sources are admin-approved only**: seeded with the 7 official URLs the user listed. Admins can toggle active/inactive and add new ones, but every source row carries `is_official=true` and an `approved_by` user id.
- **Never auto-publish.** Edge function only writes `status='pending_review'`. Publish is a separate HR/Admin action.
- **Notifications table is missing** — add it in a migration (with RLS + grants + realtime publication).
- **Realtime**: enable publication for `platform_policy_updates`, `policy_monitoring_logs`, `notifications`, `policy_acknowledgements`.
- **Cron**: schedule the edge function daily via `pg_cron` + `pg_net` using the project anon key. "Pause/Resume" buttons in UI call server fns that `cron.unschedule` / `cron.schedule`.
- **Permissions test** = live probe: runs a series of supabase calls as the current session and reports pass/fail. No role-switching simulator.

## Work breakdown

### 1. Database migration
- New table `notifications` (user_id, type, title, body, entity_table, entity_id, read, created_at) + RLS (`auth.uid() = user_id` for select/update; service_role insert) + grants.
- Add column `content_hash text` and `last_checked_at timestamptz` to `platform_policy_sources` if missing.
- Add column `previous_text text`, `new_text text`, `diff_summary text` to `platform_policy_updates` if missing.
- `ALTER PUBLICATION supabase_realtime ADD TABLE ...` for the 4 realtime tables; set `REPLICA IDENTITY FULL` on each.
- Helper RPC `get_monitoring_health()` returning the counts the System Health cards need (one round-trip).

### 2. Seed data (via `supabase--insert`)
- Insert 7 rows into `digital_platforms` (youtube, facebook, instagram, twitter, tiktok, snapchat, vk) if not present.
- Insert one official `platform_policy_sources` row per platform with the canonical policy URL, `source_type='url'`, `is_official=true`, `is_active=true`, `check_frequency='daily'`.

### 3. Edge function `check-platform-policy-updates`
- Service-role client, accepts optional `{ source_id }` body (single-source test) or runs all active official sources.
- For each source: `fetch(url)` with timeout + UA header; on non-2xx log `failed` with status; on success compute sha256 of body, compare to `content_hash`. If changed: insert `platform_policy_updates` (`status='pending_review'`, `previous_text`, `new_text` truncated), update source hash + `last_checked_at`, insert notifications for all HR/Admin users, insert `policy_monitoring_logs` row (`changes_detected`). If unchanged: log `no_change`.
- Returns `{ checked, changed, failed, results: [...] }`.

### 4. pg_cron job
- Daily 03:00 UTC POST to the edge function with `apikey` header = anon key.
- Server fns `pauseMonitoringCron` / `resumeMonitoringCron` / `getCronStatus` wrapping `cron.unschedule` / `cron.schedule` / `select from cron.job`. Gated by `is_hr_or_admin`.

### 5. Server functions (`src/lib/hr/monitoring.functions.ts`)
All `.middleware([requireSupabaseAuth])`, all role-checked via `is_hr_or_admin` RPC where mutating:
- `getMonitoringHealth` — calls `get_monitoring_health()` RPC.
- `listSources`, `toggleSource`, `testSourceFetch(sourceId)` — last one calls edge fn for single source.
- `runManualCheck()` — invokes edge fn for all sources.
- `listPendingUpdates`, `approveUpdate`, `rejectUpdate`, `editUpdateSummary`, `publishUpdate` — publish creates `policy_acknowledgements` for all `authenticated` users + notifications + audit log inside one RPC (`publish_policy_update(update_id)`) for atomicity.
- `listAcknowledgements`, `acknowledgePolicy(update_id)`, `sendAckReminder(ack_id)`, `markOverdue(ack_id)`, `managerApproveAck(ack_id)`.
- `listNotifications`, `markNotificationRead`.
- `listMonitoringLogs(filters)`.
- `createTestUpdate()` — dev-only insert path (still requires HR/Admin), inserts a fake pending update + log + notifications so realtime can be visually verified.
- `runPermissionsProbe()` — runs a fixed sequence of supabase calls under the user's RLS and returns pass/fail per check.

### 6. UI page `src/routes/_app.departments.hr.training.live-monitoring-test.tsx`
Sections 1–12 from the spec, each a `Card`. Data via TanStack Query (`useServerFn` + `useQuery`); realtime via a single `useEffect` that opens one channel for the 4 tables and calls `queryClient.invalidateQueries` on each event. Diff viewer uses a simple line-by-line comparison highlighting added/removed lines. Test Checklist + System Health derive from health RPC + last log row + realtime channel state.

Add a "Live Monitoring Test" link to the existing `DigitalPlatformTrainingCenter` component so HR can reach it from the Training tab.

### 7. Replace mock state in `DigitalPlatformTrainingCenter.tsx`
Out of scope for this turn unless trivially needed — the new test page is the source of truth. Will only swap the "Live updates" feed there to read from the real `platform_policy_updates` table (status in `approved`,`published`).

## Out of scope this turn
- Real per-platform parsers (RSS/API). Function only does hash-on-raw-body; per-platform parsing is a follow-up.
- Email delivery for notifications (in-app only).
- Role simulator UI (we probe the *current* session instead).

Confirm and I'll execute the migration first, then seed + edge function + server fns + page in batched edits.