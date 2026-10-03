-- =====================================================================
-- Mirai Seed Data (Idempotent, matching current UI mocks exactly)
-- =====================================================================

-- 1. SEED AUTH USERS (Placeholders for local/dev environments)
DO $$
DECLARE
  v_uid_sana uuid := '11111111-1111-4111-8111-111111111111';
  v_uid_alex uuid := '22222222-2222-4222-8222-222222222222';
  v_uid_kiran uuid := '33333333-3333-4333-8333-333333333333';
  v_uid_rohit uuid := '44444444-4444-4444-8444-444444444444';
  v_user_sana_id uuid;
  v_user_alex_id uuid;
  v_user_kiran_id uuid;
  v_group_id uuid;
  v_startup_id uuid;
  v_hackathon_id uuid;
  v_team_id uuid;
BEGIN
  -- Insert Auth Users if table exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
    VALUES
      (v_uid_sana, 'sana@example.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Sana Mehta","role":"builder"}'::jsonb),
      (v_uid_alex, 'alex@example.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Alex Chen","role":"founder"}'::jsonb),
      (v_uid_kiran, 'kiran@example.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Kiran Patel","role":"builder"}'::jsonb),
      (v_uid_rohit, 'rohit@example.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Rohit Verma","role":"student"}'::jsonb)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 2. SEED PUBLIC USERS
  INSERT INTO public.users (
    id, auth_user_id, role, full_name, username, headline, bio, skills, interests, commitment_level, location, open_to_remote
  )
  VALUES
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      v_uid_sana,
      'builder',
      'Sana Mehta',
      'sanamehta',
      'Product + community',
      'Designing products with soul. Excited about climate tech, regenerative agriculture, and community-first tools.',
      ARRAY['Product thinking', 'Design systems', 'Community building'],
      ARRAY['Climate', 'Web3', 'Regenerative Economy'],
      'full_time',
      'Jaipur, India',
      true
    )
  ON CONFLICT (username) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    headline = EXCLUDED.headline,
    skills = EXCLUDED.skills
  RETURNING id INTO v_user_sana_id;

  INSERT INTO public.users (
    id, auth_user_id, role, full_name, username, headline, bio, skills, interests, commitment_level, location, open_to_remote
  )
  VALUES
    (
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      v_uid_alex,
      'founder',
      'Alex Chen',
      'alexchen',
      'AI Systems & Distributed Computing',
      'Building next-generation agent networks. 2x founder passionate about zero-latency workflows.',
      ARRAY['Distributed Systems', 'TypeScript', 'Next.js', 'PostgreSQL'],
      ARRAY['AI Agents', 'Developer Tools', 'Open Source'],
      'full_time',
      'Bengaluru, India',
      true
    )
  ON CONFLICT (username) DO UPDATE SET
    full_name = EXCLUDED.full_name
  RETURNING id INTO v_user_alex_id;

  INSERT INTO public.users (
    id, auth_user_id, role, full_name, username, headline, bio, skills, interests, commitment_level, location, open_to_remote
  )
  VALUES
    (
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      v_uid_kiran,
      'builder',
      'Kiran Patel',
      'kiranpatel',
      'Full Stack Architect',
      'Writing elegant software and scaling high-throughput applications.',
      ARRAY['React', 'Node.js', 'Go', 'Supabase'],
      ARRAY['Fintech', 'Robotics'],
      'part_time',
      'Mumbai, India',
      true
    )
  ON CONFLICT (username) DO UPDATE SET
    full_name = EXCLUDED.full_name
  RETURNING id INTO v_user_kiran_id;

  -- 3. SEED STARTUPS
  INSERT INTO public.startups (
    id, owner_id, name, slug, tagline, problem, solution, stage, industry, location, tags, looking_for, website_url, is_featured, featured_week
  )
  VALUES
    (
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      'Komorebi AI',
      'komorebi-ai',
      'Ambient workspace intelligence for engineering teams.',
      'Engineering teams lose 30% of their day to context switching across Slack, GitHub, and Jira.',
      'A zero-latency neural assistant that synthesizes team context and automates daily status loops.',
      'prototype',
      'Developer Tools',
      'Bengaluru, India',
      ARRAY['AI', 'DevTools', 'Productivity'],
      ARRAY['Co-Founder', 'Lead Designer'],
      'https://komorebi.dev',
      true,
      CURRENT_DATE
    )
  ON CONFLICT (slug) DO UPDATE SET
    tagline = EXCLUDED.tagline,
    is_featured = EXCLUDED.is_featured
  RETURNING id INTO v_startup_id;

  -- 4. SEED COMMUNITY GROUPS & POSTS
  INSERT INTO public.community_groups (id, name, slug, location, description)
  VALUES
    (
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'Jaipur Builders Hub',
      'jaipur-builders',
      'Jaipur, India',
      'Plug into the local ecosystem moving ideas forward from Jaipur to everywhere.'
    )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name
  RETURNING id INTO v_group_id;

  INSERT INTO public.community_posts (
    id, author_id, group_id, type, title, body, like_count, comment_count
  )
  VALUES
    (
      'ffffffff-ffff-4fff-8fff-ffffffffffff',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'post',
      'Building in public: from Jaipur to everywhere',
      'Starting our journey to build decentralized collaboration tooling. Signal over noise always.',
      18,
      4
    )
  ON CONFLICT (id) DO NOTHING;

  -- 5. SEED HACKATHONS
  INSERT INTO public.hackathons (
    id, title, slug, description, mode, location, starts_at, ends_at, registration_deadline, prize_pool_text, status
  )
  VALUES
    (
      '12121212-1212-4212-8212-121212121212',
      'Mirai Genesis 2026',
      'mirai-genesis-2026',
      'Find your next challenge, form a sharp team, and make a weekend count. Ship something unexpected.',
      'hybrid',
      'Jaipur & Global Online',
      now() + interval '14 days',
      now() + interval '16 days',
      now() + interval '10 days',
      '$25,000 in Grants & Bounties',
      'upcoming'
    )
  ON CONFLICT (slug) DO UPDATE SET
    prize_pool_text = EXCLUDED.prize_pool_text
  RETURNING id INTO v_hackathon_id;

  -- 6. SEED INITIAL WAITLIST COUNTER BASELINE
  INSERT INTO public.waitlist (
    id, email, role_interest, source, accepted_terms_at, accepted_privacy_at, terms_version, privacy_version
  )
  VALUES
    (gen_random_uuid(), 'builder1@example.com', 'founder', 'landing_hero', now(), now(), 'v1.0.0-2026', 'v1.0.0-2026'),
    (gen_random_uuid(), 'builder2@example.com', 'builder', 'landing_hero', now(), now(), 'v1.0.0-2026', 'v1.0.0-2026'),
    (gen_random_uuid(), 'student1@example.com', 'student', 'landing_bottom', now(), now(), 'v1.0.0-2026', 'v1.0.0-2026')
  ON CONFLICT DO NOTHING;

END $$;
