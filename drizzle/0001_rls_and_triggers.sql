-- Apply this AFTER `drizzle-kit push` has created the base tables.
-- Adds RLS policies and the auth.users -> profiles trigger.

-- ===== Profiles auto-create trigger =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  candidate TEXT;
  i INT := 0;
BEGIN
  base_username := lower(regexp_replace(coalesce(split_part(new.email, '@', 1), 'bo'), '[^a-z0-9]', '', 'g'));
  IF base_username = '' THEN base_username := 'bo'; END IF;
  candidate := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) LOOP
    i := i + 1;
    candidate := base_username || i::text;
  END LOOP;

  INSERT INTO public.profiles (id, display_name, username)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'name', candidate), candidate);

  INSERT INTO public.stats (user_id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== Row Level Security =====
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duels            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items            ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone authenticated can read; only self can update.
DROP POLICY IF EXISTS "profiles_read" ON public.profiles;
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Stats: anyone authenticated can read; only self can update.
DROP POLICY IF EXISTS "stats_read" ON public.stats;
CREATE POLICY "stats_read" ON public.stats FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "stats_update_self" ON public.stats;
CREATE POLICY "stats_update_self" ON public.stats FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "stats_insert_self" ON public.stats;
CREATE POLICY "stats_insert_self" ON public.stats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Progress: only self.
DROP POLICY IF EXISTS "progress_self" ON public.progress;
CREATE POLICY "progress_self" ON public.progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- XP events: insert/read self; aggregated reads via materialized view (open).
DROP POLICY IF EXISTS "xp_self" ON public.xp_events;
CREATE POLICY "xp_self" ON public.xp_events FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Friendships: read either side; write only your own row.
DROP POLICY IF EXISTS "friendships_read" ON public.friendships;
CREATE POLICY "friendships_read" ON public.friendships FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);
DROP POLICY IF EXISTS "friendships_write" ON public.friendships;
CREATE POLICY "friendships_write" ON public.friendships FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Duels: visible to host or guest.
DROP POLICY IF EXISTS "duels_read" ON public.duels;
CREATE POLICY "duels_read" ON public.duels FOR SELECT TO authenticated
  USING (auth.uid() = host_id OR auth.uid() = guest_id);
DROP POLICY IF EXISTS "duels_write_host" ON public.duels;
CREATE POLICY "duels_write_host" ON public.duels FOR ALL TO authenticated
  USING (auth.uid() = host_id OR auth.uid() = guest_id) WITH CHECK (auth.uid() = host_id OR auth.uid() = guest_id);

-- User achievements: only self.
DROP POLICY IF EXISTS "ua_self" ON public.user_achievements;
CREATE POLICY "ua_self" ON public.user_achievements FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Inventory: only self.
DROP POLICY IF EXISTS "inv_self" ON public.inventory;
CREATE POLICY "inv_self" ON public.inventory FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Achievements & items catalogs: readable by anyone authenticated.
DROP POLICY IF EXISTS "achievements_read" ON public.achievements;
CREATE POLICY "achievements_read" ON public.achievements FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "items_read" ON public.items;
CREATE POLICY "items_read" ON public.items FOR SELECT TO authenticated USING (true);

-- ===== Leaderboard materialized view =====
CREATE MATERIALIZED VIEW IF NOT EXISTS public.leaderboard_weekly AS
SELECT
  p.id AS user_id,
  p.display_name,
  p.username,
  p.avatar_variant,
  p.league,
  COALESCE(SUM(x.amount), 0) AS weekly_xp,
  p.streak_days
FROM public.profiles p
LEFT JOIN public.xp_events x
  ON x.user_id = p.id AND x.created_at >= now() - interval '7 days'
GROUP BY p.id, p.display_name, p.username, p.avatar_variant, p.league, p.streak_days;

CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_weekly_user_idx ON public.leaderboard_weekly (user_id);

-- Refresh schedule (call from Supabase cron every 5 min):
-- SELECT cron.schedule('refresh-leaderboard-weekly', '*/5 * * * *',
--   $$REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard_weekly$$);
