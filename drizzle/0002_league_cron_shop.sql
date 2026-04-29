-- =====================================================================
-- Phase 3: League promote/demote + weekly leaderboard cron
-- Phase 4: Shop seed data
-- Run in Supabase SQL editor after 0001_rls_and_triggers.sql
-- =====================================================================

-- -----------------------------------------------------------------------
-- 1. Materialized view for weekly XP (refreshed by pg_cron every Monday)
-- -----------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_weekly AS
SELECT
  p.id         AS user_id,
  p.display_name,
  p.username,
  p.avatar_variant,
  p.league,
  p.streak_days,
  COALESCE(SUM(e.amount), 0)::int AS period_xp
FROM profiles p
LEFT JOIN xp_events e
  ON e.user_id = p.id
  AND e.created_at >= date_trunc('week', now())
GROUP BY p.id, p.display_name, p.username, p.avatar_variant, p.league, p.streak_days;

CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_weekly_user_id_idx ON leaderboard_weekly (user_id);

-- -----------------------------------------------------------------------
-- 2. pg_cron: refresh weekly leaderboard every Monday at 00:05 UTC
--    (requires pg_cron extension enabled in Supabase dashboard)
-- -----------------------------------------------------------------------
SELECT cron.schedule(
  'refresh-leaderboard-weekly',
  '5 0 * * MON',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_weekly$$
);

-- -----------------------------------------------------------------------
-- 3. League promotion/demotion — runs every Monday at 00:10 UTC
--    Logic:
--      - If weekly XP >= next league threshold → promote
--      - If weekly XP < current league threshold AND not in Trà Đá → demote
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION promote_demote_leagues()
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  leagues TEXT[] := ARRAY['tra-da','tra-sua','bac-ha','hoa-mai','hoang-kim','thien-long'];
  thresholds INT[] := ARRAY[0, 50, 150, 400, 1000, 2500];
  r RECORD;
  cur_idx INT;
BEGIN
  FOR r IN
    SELECT p.id, p.league,
           COALESCE(SUM(e.amount),0)::int AS weekly_xp
    FROM profiles p
    LEFT JOIN xp_events e
      ON e.user_id = p.id
      AND e.created_at >= date_trunc('week', now())
    GROUP BY p.id, p.league
  LOOP
    cur_idx := array_position(leagues, r.league);
    IF cur_idx IS NULL THEN cur_idx := 1; END IF;

    -- Promote: weekly XP meets next tier threshold
    IF cur_idx < array_length(leagues,1)
       AND r.weekly_xp >= thresholds[cur_idx + 1]
    THEN
      UPDATE profiles SET league = leagues[cur_idx + 1] WHERE id = r.id;

    -- Demote: weekly XP < current tier threshold and not at bottom
    ELSIF cur_idx > 1
       AND r.weekly_xp < thresholds[cur_idx]
    THEN
      UPDATE profiles SET league = leagues[cur_idx - 1] WHERE id = r.id;
    END IF;
  END LOOP;
END;
$$;

SELECT cron.schedule(
  'league-promote-demote',
  '10 0 * * MON',
  $$SELECT promote_demote_leagues()$$
);

-- -----------------------------------------------------------------------
-- 4. Shop items seed — cosmetics + consumables
-- -----------------------------------------------------------------------
INSERT INTO items (id, name, slot, rarity, cost_gems, effect) VALUES
  -- Consumables
  ('heart-refill',   'Heart Refill',       'consumable', 'common',    5,   '{"type":"hearts","amount":5}'),
  ('streak-freeze',  'Streak Shield',      'consumable', 'common',    10,  '{"type":"streak_freeze","amount":1}'),
  ('xp-boost-1h',   'XP Boost (1hr)',     'consumable', 'uncommon',  20,  '{"type":"xp_boost","multiplier":2,"durationHours":1}'),
  -- Cosmetic — Bo accessories
  ('bo-crown',       'Golden Crown',       'cosmetic',   'rare',      50,  '{"type":"bo_accessory","slot":"head","asset":"crown"}'),
  ('bo-glasses',     'Star Shades',        'cosmetic',   'uncommon',  30,  '{"type":"bo_accessory","slot":"eyes","asset":"glasses"}'),
  ('bo-scarf',       'Lotus Scarf',        'cosmetic',   'uncommon',  30,  '{"type":"bo_accessory","slot":"neck","asset":"scarf"}'),
  ('bo-hat-non',     'Nón Lá Hat',         'cosmetic',   'rare',      60,  '{"type":"bo_accessory","slot":"head","asset":"non-la"}'),
  ('bo-armor',       'Dragon Scale Armor', 'cosmetic',   'epic',     150,  '{"type":"bo_accessory","slot":"body","asset":"armor"}'),
  -- Background themes
  ('bg-mekong',      'Mekong Delta',       'background', 'uncommon',  25,  '{"type":"bg","asset":"mekong"}'),
  ('bg-halong',      'Hạ Long Bay',        'background', 'rare',      50,  '{"type":"bg","asset":"halong"}'),
  ('bg-sapa',        'Sa Pa Mountains',    'background', 'rare',      50,  '{"type":"bg","asset":"sapa"}'),
  ('bg-hoi-an',      'Hội An Lanterns',   'background', 'epic',     100,  '{"type":"bg","asset":"hoi-an"}')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- 5. RLS policies for duels table
-- -----------------------------------------------------------------------
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "duel participants can select"
  ON duels FOR SELECT
  USING (
    auth.uid() = host_id
    OR auth.uid() = guest_id
  );

CREATE POLICY "authenticated can insert duel"
  ON duels FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "participants can update duel"
  ON duels FOR UPDATE
  USING (auth.uid() = host_id OR auth.uid() = guest_id);
