// Scans pending/overdue acknowledgements & training assignments, marks
// expired records overdue, and inserts reminder notifications.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const nowIso = new Date().toISOString();

  // Mark overdue acknowledgements
  const { data: overdueAcks } = await supabase
    .from("policy_acknowledgements")
    .update({ status: "overdue" })
    .eq("status", "pending")
    .lt("due_date", nowIso)
    .select("id, employee_id, platform_id, policy_update_id");

  // Mark overdue training assignments
  const { data: overdueAssign } = await supabase
    .from("training_assignments")
    .update({ status: "overdue" })
    .eq("status", "assigned")
    .lt("due_date", nowIso)
    .select("id, assigned_to_employee_id, platform_id, lesson_id");

  // Reminder notifications for still-pending items (due within 3 days)
  const soon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const { data: dueAcks } = await supabase
    .from("policy_acknowledgements")
    .select("id, employee_id, due_date")
    .eq("status", "pending")
    .lt("due_date", soon);

  let notif = 0;
  for (const a of dueAcks ?? []) {
    await supabase.from("notifications").insert({
      user_id: a.employee_id,
      type: "ack_reminder",
      title: "Action required: policy acknowledgement",
      body: `You have a policy acknowledgement due by ${a.due_date}.`,
      entity_table: "policy_acknowledgements",
      entity_id: a.id,
    });
    notif++;
  }
  for (const ov of overdueAcks ?? []) {
    await supabase.from("notifications").insert({
      user_id: ov.employee_id,
      type: "ack_overdue",
      title: "Overdue: policy acknowledgement",
      body: "An assigned policy acknowledgement is now overdue. Please complete it immediately.",
      entity_table: "policy_acknowledgements",
      entity_id: ov.id,
    });
    notif++;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      overdue_acks: overdueAcks?.length ?? 0,
      overdue_assignments: overdueAssign?.length ?? 0,
      notifications_created: notif,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});