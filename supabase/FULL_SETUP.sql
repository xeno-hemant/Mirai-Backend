-- =====================================================================
-- MIRAI ALL-IN-ONE SUPABASE SETUP SCRIPT
-- Run this once in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wptofmegrgrjglazkpox/sql/new
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

-- 4. ADMIN TABLE & FUNCTION
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

-- 5. USERS
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

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6. WAITLIST
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

CREATE OR REPLACE TRIGGER trg_waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. STARTUPS
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

CREATE INDEX IF NOT EXISTS idx_startups_slug ON public.startups(slug) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER trg_startups_updated_at
  BEFORE UPDATE ON public.startups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

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

CREATE OR REPLACE TRIGGER trg_startup_members_updated_at
  BEFORE UPDATE ON public.startup_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 8. SWIPES & MATCHES
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

CREATE OR REPLACE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Transactional RPC function
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
  INSERT INTO public.swipes (swiper_id, target_id, direction, deleted_at)
  VALUES (p_swiper_id, p_target_id, p_direction, NULL)
  ON CONFLICT (swiper_id, target_id)
  DO UPDATE SET direction = EXCLUDED.direction, updated_at = now(), deleted_at = NULL;

  IF p_direction = 'connect' THEN
    SELECT * INTO v_reciprocal_swipe
    FROM public.swipes
    WHERE swiper_id = p_target_id
      AND target_id = p_swiper_id
      AND direction = 'connect'
      AND deleted_at IS NULL;

    IF FOUND THEN
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
    END IF;
  END IF;

  RETURN jsonb_build_object('is_match', v_is_match, 'match_id', v_match_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. COMMUNITY GROUPS & POSTS
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

CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT uq_post_like UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

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

-- 10. HACKATHONS
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

-- 11. ENABLE RLS EVERYWHERE
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ama_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Basic Public Reads
CREATE POLICY users_select_all ON public.users FOR SELECT TO authenticated, anon USING (deleted_at IS NULL);
CREATE POLICY startups_select_all ON public.startups FOR SELECT TO authenticated, anon USING (deleted_at IS NULL);
CREATE POLICY community_select_all ON public.community_posts FOR SELECT TO authenticated, anon USING (deleted_at IS NULL);
CREATE POLICY hackathons_select_all ON public.hackathons FOR SELECT TO authenticated, anon USING (deleted_at IS NULL);

-- Seed Initial Test Waitlist Entry
INSERT INTO public.waitlist (
  email, role_interest, source, accepted_terms_at, accepted_privacy_at, terms_version, privacy_version
)
VALUES
  ('welcome@mirai.in', 'builder', 'seed', now(), now(), 'v1.0.0-2026', 'v1.0.0-2026')
ON CONFLICT DO NOTHING;
