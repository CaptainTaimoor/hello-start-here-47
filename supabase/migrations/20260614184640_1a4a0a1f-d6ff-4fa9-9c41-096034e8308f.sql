
-- 1. content_hash on sources
ALTER TABLE public.platform_policy_sources
  ADD COLUMN IF NOT EXISTS content_hash text;

-- 2. notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  entity_table text,
  entity_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif read own" ON public.notifications;
CREATE POLICY "notif read own" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notif update own" ON public.notifications;
CREATE POLICY "notif update own" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);

-- 3. Realtime publication + replica identity
ALTER TABLE public.platform_policy_updates  REPLICA IDENTITY FULL;
ALTER TABLE public.policy_monitoring_logs   REPLICA IDENTITY FULL;
ALTER TABLE public.policy_acknowledgements  REPLICA IDENTITY FULL;
ALTER TABLE public.notifications            REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_policy_updates; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.policy_monitoring_logs;  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.policy_acknowledgements; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;           EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- 4. Health summary RPC
CREATE OR REPLACE FUNCTION public.get_monitoring_health()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'active_sources',       (SELECT count(*) FROM platform_policy_sources WHERE is_active),
    'total_sources',        (SELECT count(*) FROM platform_policy_sources),
    'pending_updates',      (SELECT count(*) FROM platform_policy_updates WHERE status='pending_review'),
    'published_updates',    (SELECT count(*) FROM platform_policy_updates WHERE status='published'),
    'pending_acks',         (SELECT count(*) FROM policy_acknowledgements WHERE status='pending'),
    'last_run',             (SELECT max(checked_at) FROM policy_monitoring_logs),
    'last_success',         (SELECT max(checked_at) FROM policy_monitoring_logs WHERE run_status IN ('success','no_change','changes_detected')),
    'last_failed',          (SELECT max(checked_at) FROM policy_monitoring_logs WHERE run_status='failed'),
    'is_hr_or_admin',       public.is_hr_or_admin(auth.uid())
  ) INTO result;
  RETURN result;
END $$;

GRANT EXECUTE ON FUNCTION public.get_monitoring_health() TO authenticated, anon;

-- 5. Atomic publish RPC
CREATE OR REPLACE FUNCTION public.publish_policy_update(_update_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_upd public.platform_policy_updates;
  v_ack_count int := 0;
  v_notif_count int := 0;
  v_user record;
BEGIN
  IF NOT public.is_hr_or_admin(v_caller) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO v_upd FROM platform_policy_updates WHERE id = _update_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'update not found'; END IF;

  UPDATE platform_policy_updates
     SET status = 'published',
         published_at = now(),
         reviewed_by = COALESCE(reviewed_by, v_caller),
         reviewed_at = COALESCE(reviewed_at, now())
   WHERE id = _update_id;

  -- create ack + notification for every existing user
  FOR v_user IN SELECT id FROM auth.users LOOP
    INSERT INTO policy_acknowledgements (employee_id, platform_id, policy_update_id, status, assigned_by, due_date)
      VALUES (v_user.id, v_upd.platform_id, _update_id, 'pending', v_caller, now() + interval '7 days')
      ON CONFLICT DO NOTHING;
    v_ack_count := v_ack_count + 1;

    INSERT INTO notifications (user_id, type, title, body, entity_table, entity_id)
      VALUES (v_user.id, 'policy_published',
              'New policy update: ' || v_upd.update_title,
              COALESCE(v_upd.update_summary, ''), 'platform_policy_updates', _update_id);
    v_notif_count := v_notif_count + 1;
  END LOOP;

  INSERT INTO training_audit_logs (action_type, module, user_id, platform_id, entity_id, description, metadata)
    VALUES ('publish_policy_update', 'digital_platform_training', v_caller, v_upd.platform_id, _update_id,
            'Published policy update "' || v_upd.update_title || '"',
            jsonb_build_object('acks_created', v_ack_count, 'notifications_created', v_notif_count));

  RETURN jsonb_build_object('ok', true, 'acks', v_ack_count, 'notifications', v_notif_count);
END $$;

GRANT EXECUTE ON FUNCTION public.publish_policy_update(uuid) TO authenticated;
