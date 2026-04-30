-- Phase 7: Push subscription storage + streak reminder cron
-- Run this in Supabase SQL editor after 0002_league_cron_shop.sql

-- ── Push subscriptions table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON push_subscriptions(user_id);

-- RLS: users can only manage their own subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions: owner full access"
  ON push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Streak reminder cron (requires pg_cron extension) ──────────────────────
-- Fires every day at 18:00 UTC (11 AM or noon for most US timezones).
-- Sends a reminder to users who haven't practiced today but have a streak ≥ 1.
-- Actual push delivery is handled by the /api/push/send route (web-push library).
-- This cron simply writes to a `push_jobs` queue table; a Vercel cron or
-- Supabase Edge Function can poll and deliver.

CREATE TABLE IF NOT EXISTS push_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'streak-reminder',
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS push_jobs_pending_idx ON push_jobs(created_at) WHERE sent_at IS NULL;

-- Function: enqueue streak reminders for at-risk users
CREATE OR REPLACE FUNCTION enqueue_streak_reminders() RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  cutoff TIMESTAMPTZ := NOW() - INTERVAL '22 hours';
BEGIN
  -- At-risk = has streak ≥ 1 AND hasn't done a lesson in 22+ hours
  INSERT INTO push_jobs (user_id, type, payload)
  SELECT
    p.id,
    'streak-reminder',
    jsonb_build_object(
      'title', 'Đừng quên luyện tập hôm nay! 🔥',
      'body', format('%s-day streak at risk — just 5 minutes keeps it alive!', p.streak_days),
      'url', '/learn',
      'tag', 'streak-reminder'
    )
  FROM profiles p
  WHERE p.streak_days >= 1
    AND (p.last_lesson_at IS NULL OR p.last_lesson_at < cutoff)
    AND EXISTS (SELECT 1 FROM push_subscriptions ps WHERE ps.user_id = p.id);
END;
$$;

-- Schedule daily at 18:00 UTC (requires pg_cron)
SELECT cron.schedule(
  'streak-reminders-daily',
  '0 18 * * *',
  $$SELECT enqueue_streak_reminders();$$
);
