-- =====================================================================
-- Mirai Core Database Schema Migration
-- Idempotent, Production-Ready, Universal Soft-Delete & Updated-At Triggers
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('founder', 'builder', 'student');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commitment_level') THEN
    CREATE TYPE commitment_level AS ENUM ('exploring', 'part_time', 'full_time');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'startup_stage') THEN
    CREATE TYPE startup_stage AS ENUM ('idea', 'prototype', 'mvp');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'swipe_direction') THEN
    CREATE TYPE swipe_direction AS ENUM ('connect', 'pass');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
    CREATE TYPE match_status AS ENUM ('pending', 'matched', 'blocked');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_type') THEN
    CREATE TYPE post_type AS ENUM ('post', 'ama', 'startup_of_the_week');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hackathon_mode') THEN
    CREATE TYPE hackathon_mode AS ENUM ('online', 'offline', 'hybrid');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hackathon_status') THEN
    CREATE TYPE hackathon_status AS ENUM ('upcoming', 'live', 'completed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_request_status') THEN
    CREATE TYPE team_request_status AS ENUM ('pending', 'accepted', 'rejected');
  END IF;
END $$;

-- 3. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. ADMIN HELPER FUNCTION (Private schema / admin lookup)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_user_id = auth.uid()
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 5. CORE TABLES
-- =====================================================================

-- 5.1 USERS
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'builder',
  full_name text NOT NULL,
  username citext UNIQUE NOT NULL,
  headline text,
  bio text,
  avatar_url text,
  skills text[] NOT NULL DEFAULT '{}',
  interests text[] NOT NULL DEFAULT '{}',
  commitment_level commitment_level NOT NULL DEFAULT 'exploring',
  location text,
  open_to_remote boolean NOT NULL DEFAULT true,
  links jsonb NOT NULL DEFAULT '{}'::jsonb,
  onboarding_completed boolean NOT NULL DEFAULT false,
  accepted_terms_at timestamptz NOT NULL DEFAULT now(),
  accepted_privacy_at timestamptz NOT NULL DEFAULT now(),
  terms_version text NOT NULL DEFAULT 'v1.0.0-2026',
  privacy_version text NOT NULL DEFAULT 'v1.0.0-2026',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_skills ON public.users USING gin(skills) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_interests ON public.users USING gin(interests) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Prevent role escalation via client update trigger
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Role changes must be performed by an administrator';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_role_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION prevent_role_escalation();

-- 5.2 WAITLIST
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL,
  role_interest user_role NULL,
  source text,
  confirmed_at timestamptz,
  accepted_terms_at timestamptz NOT NULL DEFAULT now(),
  accepted_privacy_at timestamptz NOT NULL DEFAULT now(),
  terms_version text NOT NULL DEFAULT 'v1.0.0-2026',
  privacy_version text NOT NULL DEFAULT 'v1.0.0-2026',
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email_active ON public.waitlist(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

CREATE OR REPLACE TRIGGER trg_waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5.3 STARTUPS
CREATE TABLE IF NOT EXISTS public.startups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug citext UNIQUE NOT NULL,
  tagline text NOT NULL,
  problem text NOT NULL,
  solution text NOT NULL,
  stage startup_stage NOT NULL DEFAULT 'idea',
  industry text NOT NULL,
  location text,
  tags text[] NOT NULL DEFAULT '{}',
  looking_for text[] NOT NULL DEFAULT '{}',
  website_url text,
  pitch_deck_path text,
  logo_url text,
  is_featured boolean NOT NULL DEFAULT false,
  featured_week date NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_startups_owner_id ON public.startups(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_startups_slug ON public.startups(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_startups_stage ON public.startups(stage) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_startups_industry ON public.startups(industry) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_startups_featured ON public.startups(is_featured, featured_week) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_startups_updated_at
  BEFORE UPDATE ON public.startups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Supporting: STARTUP MEMBERS
CREATE TABLE IF NOT EXISTS public.startup_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT uq_startup_member UNIQUE(startup_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_startup_members_lookup ON public.startup_members(startup_id, user_id) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_startup_members_updated_at
  BEFORE UPDATE ON public.startup_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Active startups view
CREATE OR REPLACE VIEW public.active_startups AS
SELECT * FROM public.startups WHERE deleted_at IS NULL;

-- 5.4 MATCHES & SWIPES
CREATE TABLE IF NOT EXISTS public.swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  direction swipe_direction NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT uq_swiper_target UNIQUE(swiper_id, target_id),
  CONSTRAINT chk_no_self_swipe CHECK (swiper_id <> target_id)
);

CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON public.swipes(swiper_id, target_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_swipes_target ON public.swipes(target_id, swiper_id) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_swipes_updated_at
  BEFORE UPDATE ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_b_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status match_status NOT NULL DEFAULT 'matched',
  matched_at timestamptz DEFAULT now(),
  compatibility_score integer NOT NULL DEFAULT 85,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT chk_ordered_pair CHECK (user_a_id < user_b_id),
  CONSTRAINT uq_match_pair UNIQUE (user_a_id, user_b_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_participants ON public.matches(user_a_id, user_b_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Transactional RPC function: record swipe & create match if mutual
CREATE OR REPLACE FUNCTION record_swipe_and_match(
  p_swiper_id uuid,
  p_target_id uuid,
  p_direction swipe_direction,
  p_score integer DEFAULT 85
)
RETURNS jsonb AS $$
DECLARE
  v_reciprocal_swipe record;
  v_match_id uuid := NULL;
  v_user_a uuid;
  v_user_b uuid;
  v_is_match boolean := false;
BEGIN
  -- Insert or update current swipe
  INSERT INTO public.swipes (swiper_id, target_id, direction, deleted_at)
  VALUES (p_swiper_id, p_target_id, p_direction, NULL)
  ON CONFLICT (swiper_id, target_id)
  DO UPDATE SET direction = EXCLUDED.direction, updated_at = now(), deleted_at = NULL;

  -- If direction is connect, check if target also swiped connect
  IF p_direction = 'connect' THEN
    SELECT * INTO v_reciprocal_swipe
    FROM public.swipes
    WHERE swiper_id = p_target_id
      AND target_id = p_swiper_id
      AND direction = 'connect'
      AND deleted_at IS NULL;

    IF FOUND THEN
      -- Determine ordered a < b
      IF p_swiper_id < p_target_id THEN
        v_user_a := p_swiper_id;
        v_user_b := p_target_id;
      ELSE
        v_user_a := p_target_id;
        v_user_b := p_swiper_id;
      END IF;

      INSERT INTO public.matches (user_a_id, user_b_id, status, matched_at, compatibility_score)
      VALUES (v_user_a, v_user_b, 'matched', now(), p_score)
      ON CONFLICT (user_a_id, user_b_id)
      DO UPDATE SET status = 'matched', matched_at = now(), updated_at = now(), deleted_at = NULL
      RETURNING id INTO v_match_id;

      v_is_match := true;

      -- Create notifications for both users
      INSERT INTO public.notifications (user_id, type, payload)
      VALUES
        (p_swiper_id, 'match_created', jsonb_build_object('match_id', v_match_id, 'matched_with_id', p_target_id)),
        (p_target_id, 'match_created', jsonb_build_object('match_id', v_match_id, 'matched_with_id', p_swiper_id));
    END IF;
  END IF;

  RETURN jsonb_build_object('is_match', v_is_match, 'match_id', v_match_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.5 COMMUNITY GROUPS & POSTS
CREATE TABLE IF NOT EXISTS public.community_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug citext UNIQUE NOT NULL,
  location text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_community_groups_slug ON public.community_groups(slug) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_community_groups_updated_at
  BEFORE UPDATE ON public.community_groups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.community_groups(id) ON DELETE SET NULL,
  type post_type NOT NULL DEFAULT 'post',
  title text NOT NULL,
  body text NOT NULL,
  media_url text,
  like_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON public.community_posts(author_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_group ON public.community_posts(group_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.community_posts(created_at DESC) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Supporting: POST LIKES
CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT uq_post_like UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_user ON public.post_likes(post_id, user_id) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_post_likes_updated_at
  BEFORE UPDATE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Like count trigger
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET like_count = like_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET like_count = GREATEST(0, like_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_post_like_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- Supporting: POST COMMENTS
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Comment count trigger
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET comment_count = comment_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET comment_count = GREATEST(0, comment_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_post_comment_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Supporting: AMA EVENTS
CREATE TABLE IF NOT EXISTS public.ama_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  banner_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_ama_events_schedule ON public.ama_events(scheduled_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_ama_events_updated_at
  BEFORE UPDATE ON public.ama_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5.6 HACKATHONS
CREATE TABLE IF NOT EXISTS public.hackathons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug citext UNIQUE NOT NULL,
  description text NOT NULL,
  mode hackathon_mode NOT NULL DEFAULT 'online',
  location text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  registration_deadline timestamptz NOT NULL,
  prize_pool_text text,
  banner_url text,
  tracks jsonb NOT NULL DEFAULT '[]'::jsonb,
  rules text,
  status hackathon_status NOT NULL DEFAULT 'upcoming',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_hackathons_slug ON public.hackathons(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON public.hackathons(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hackathons_dates ON public.hackathons(starts_at, ends_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_hackathons_updated_at
  BEFORE UPDATE ON public.hackathons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Supporting: HACKATHON TEAMS
CREATE TABLE IF NOT EXISTS public.hackathon_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  name text NOT NULL,
  project_title text,
  project_description text,
  points integer NOT NULL DEFAULT 0,
  submission_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT uq_hackathon_team_name UNIQUE(hackathon_id, name)
);

CREATE INDEX IF NOT EXISTS idx_hackathon_teams_points ON public.hackathon_teams(hackathon_id, points DESC) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_hackathon_teams_updated_at
  BEFORE UPDATE ON public.hackathon_teams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Supporting: TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_lead boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT uq_team_user UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_lookup ON public.team_members(team_id, user_id) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Supporting: HACKATHON REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.hackathon_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.hackathon_teams(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT uq_hackathon_registration UNIQUE(hackathon_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_hackathon_reg_lookup ON public.hackathon_registrations(hackathon_id, user_id) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_hackathon_reg_updated_at
  BEFORE UPDATE ON public.hackathon_registrations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Supporting: TEAM REQUESTS
CREATE TABLE IF NOT EXISTS public.team_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status team_request_status NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT uq_team_request UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_requests_lookup ON public.team_requests(team_id, user_id) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_team_requests_updated_at
  BEFORE UPDATE ON public.team_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5.7 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Default Deny Everywhere. Explicit SELECT, INSERT, UPDATE, DELETE.
-- =====================================================================

-- Helper to get public.users.id from auth.uid()
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid AS $$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid() AND deleted_at IS NULL LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 6.1 USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_active ON public.users
  FOR SELECT TO authenticated, anon
  USING (deleted_at IS NULL);

CREATE POLICY users_insert_self ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY users_update_self ON public.users
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY users_delete_self ON public.users
  FOR DELETE TO authenticated
  USING (auth_user_id = auth.uid());

-- 6.2 WAITLIST (No public read. Inserts via service-role / server action only)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- No SELECT policy for anon or authenticated (Default Deny).
-- Writes by service role only.

-- 6.3 STARTUPS
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;

CREATE POLICY startups_select_active ON public.startups
  FOR SELECT TO authenticated, anon
  USING (deleted_at IS NULL);

CREATE POLICY startups_insert_owner ON public.startups
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = public.current_user_id());

CREATE POLICY startups_update_owner ON public.startups
  FOR UPDATE TO authenticated
  USING (owner_id = public.current_user_id() AND deleted_at IS NULL)
  WITH CHECK (owner_id = public.current_user_id());

CREATE POLICY startups_delete_owner ON public.startups
  FOR DELETE TO authenticated
  USING (owner_id = public.current_user_id());

-- STARTUP MEMBERS
ALTER TABLE public.startup_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY startup_members_select_active ON public.startup_members
  FOR SELECT TO authenticated, anon
  USING (deleted_at IS NULL);

CREATE POLICY startup_members_manage_owner ON public.startup_members
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = startup_members.startup_id
        AND s.owner_id = public.current_user_id()
        AND s.deleted_at IS NULL
    )
  );

-- 6.4 SWIPES & MATCHES
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY swipes_select_self ON public.swipes
  FOR SELECT TO authenticated
  USING (swiper_id = public.current_user_id() AND deleted_at IS NULL);

CREATE POLICY swipes_insert_self ON public.swipes
  FOR INSERT TO authenticated
  WITH CHECK (swiper_id = public.current_user_id());

CREATE POLICY swipes_update_self ON public.swipes
  FOR UPDATE TO authenticated
  USING (swiper_id = public.current_user_id() AND deleted_at IS NULL)
  WITH CHECK (swiper_id = public.current_user_id());

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY matches_select_participant ON public.matches
  FOR SELECT TO authenticated
  USING (
    (user_a_id = public.current_user_id() OR user_b_id = public.current_user_id())
    AND deleted_at IS NULL
  );

-- 6.5 COMMUNITY GROUPS & POSTS
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY groups_select_active ON public.community_groups
  FOR SELECT TO authenticated, anon
  USING (deleted_at IS NULL);

CREATE POLICY groups_admin_manage ON public.community_groups
  FOR ALL TO authenticated
  USING (public.is_admin());

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY posts_select_active ON public.community_posts
  FOR SELECT TO authenticated, anon
  USING (deleted_at IS NULL);

CREATE POLICY posts_insert_author ON public.community_posts
  FOR INSERT TO authenticated
  WITH CHECK (author_id = public.current_user_id());

CREATE POLICY posts_update_author ON public.community_posts
  FOR UPDATE TO authenticated
  USING (author_id = public.current_user_id() AND deleted_at IS NULL)
  WITH CHECK (author_id = public.current_user_id());

CREATE POLICY posts_delete_author ON public.community_posts
  FOR DELETE TO authenticated
  USING (author_id = public.current_user_id());

-- POST LIKES & COMMENTS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY post_likes_select_active ON public.post_likes
  FOR SELECT TO authenticated, anon
  USING (deleted_at IS NULL);

CREATE POLICY post_likes_insert_self ON public.post_likes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY post_likes_delete_self ON public.post_likes
  FOR DELETE TO authenticated
  USING (user_id = public.current_user_id());

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY post_comments_select_active ON public.post_comments
  FOR SELECT TO authenticated, anon
  USING (deleted_at IS NULL);

CREATE POLICY post_comments_insert_self ON public.post_comments
  FOR INSERT TO authenticated
  WITH CHECK (author_id = public.current_user_id());

CREATE POLICY post_comments_update_self ON public.post_comments
  FOR UPDATE TO authenticated
  USING (author_id = public.current_user_id() AND deleted_at IS NULL)
  WITH CHECK (author_id = public.current_user_id());

CREATE POLICY post_comments_delete_self ON public.post_comments
  FOR DELETE TO authenticated
  USING (author_id = public.current_user_id());

-- AMA EVENTS
ALTER TABLE public.ama_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY ama_events_select_active ON public.ama_events
  FOR SELECT TO authenticated, anon
  USING (deleted_at IS NULL);

CREATE POLICY ama_events_host_manage ON public.ama_events
  FOR ALL TO authenticated
  USING (host_id = public.current_user_id() OR public.is_admin());

-- 6.6 HACKATHONS
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;

CREATE POLICY hackathons_select_active ON public.hackathons
  FOR SELECT TO authenticated, anon
  USING (deleted_at IS NULL);

CREATE POLICY hackathons_admin_manage ON public.hackathons
  FOR ALL TO authenticated
  USING (public.is_admin());

-- HACKATHON TEAMS & MEMBERS
ALTER TABLE public.hackathon_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY hackathon_teams_select_active ON public.hackathon_teams
  FOR SELECT TO authenticated, anon
  USING (deleted_at IS NULL);

CREATE POLICY hackathon_teams_insert_auth ON public.hackathon_teams
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY hackathon_teams_update_lead ON public.hackathon_teams
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = hackathon_teams.id
        AND tm.user_id = public.current_user_id()
        AND tm.is_lead = true
        AND tm.deleted_at IS NULL
    )
  );

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY team_members_select_active ON public.team_members
  FOR SELECT TO authenticated, anon
  USING (deleted_at IS NULL);

CREATE POLICY team_members_manage_lead ON public.team_members
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = public.current_user_id()
        AND tm.is_lead = true
        AND tm.deleted_at IS NULL
    )
  );

ALTER TABLE public.hackathon_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY hackathon_registrations_select_self ON public.hackathon_registrations
  FOR SELECT TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL);

CREATE POLICY hackathon_registrations_insert_self ON public.hackathon_registrations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY hackathon_registrations_delete_self ON public.hackathon_registrations
  FOR DELETE TO authenticated
  USING (user_id = public.current_user_id());

ALTER TABLE public.team_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY team_requests_select_party ON public.team_requests
  FOR SELECT TO authenticated
  USING (
    (user_id = public.current_user_id() OR
      EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = team_requests.team_id
          AND tm.user_id = public.current_user_id()
          AND tm.is_lead = true
      )
    ) AND deleted_at IS NULL
  );

CREATE POLICY team_requests_insert_self ON public.team_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = public.current_user_id());

-- 6.7 NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select_self ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL);

CREATE POLICY notifications_update_self ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL)
  WITH CHECK (user_id = public.current_user_id());

-- =====================================================================
-- 7. AUTH TRIGGER: Automatically provision users profile on sign-up
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role := 'builder';
  v_username text;
  v_fullname text;
BEGIN
  -- Extract metadata or defaults
  v_fullname := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_username := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')) || '_' || substr(NEW.id::text, 1, 6);

  IF (NEW.raw_user_meta_data->>'role') IN ('founder', 'builder', 'student') THEN
    v_role := (NEW.raw_user_meta_data->>'role')::user_role;
  END IF;

  INSERT INTO public.users (
    auth_user_id,
    role,
    full_name,
    username,
    avatar_url,
    accepted_terms_at,
    accepted_privacy_at,
    terms_version,
    privacy_version
  )
  VALUES (
    NEW.id,
    v_role,
    v_fullname,
    v_username,
    NEW.raw_user_meta_data->>'avatar_url',
    now(),
    now(),
    'v1.0.0-2026',
    'v1.0.0-2026'
  )
  ON CONFLICT (auth_user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users if permissions allow (standard Supabase pattern)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignore in environments where auth schema modification is restricted
END $$;
