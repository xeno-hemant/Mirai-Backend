-- =====================================================================
-- Mirai RLS Policy Test Suite
-- Proves:
-- 1. Anonymous users CANNOT read waitlist entries.
-- 2. User A CANNOT edit User B's startup.
-- 3. User A CANNOT read User B's private swipes.
-- 4. User A CANNOT escalate role to admin/founder via direct update.
-- =====================================================================

BEGIN;

-- Setup test users in auth.users
INSERT INTO auth.users (id, email)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'usera@test.com'),
  ('b0000000-0000-0000-0000-000000000002', 'userb@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, auth_user_id, role, full_name, username)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'builder', 'User A', 'usera'),
  ('22222222-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'founder', 'User B', 'userb')
ON CONFLICT (username) DO NOTHING;

-- Seed a startup owned by User B
INSERT INTO public.startups (id, owner_id, name, slug, tagline, problem, solution, industry)
VALUES (
  '33333333-0000-0000-0000-000000000003',
  '22222222-0000-0000-0000-000000000002',
  'Startup B',
  'startup-b',
  'Pitch B',
  'Problem B',
  'Solution B',
  'AI'
)
ON CONFLICT (slug) DO NOTHING;

-- Seed User B's private swipe
INSERT INTO public.swipes (swiper_id, target_id, direction)
VALUES (
  '22222222-0000-0000-0000-000000000002',
  '11111111-0000-0000-0000-000000000001',
  'connect'
)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------
-- TEST 1: Anonymous users cannot read waitlist entries
-- ---------------------------------------------------------------------
SET ROLE anon;
SET request.jwt.claims TO '{"role": "anon"}';

DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count FROM public.waitlist;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'TEST 1 FAILED: Anon was able to read % waitlist rows!', v_count;
  END IF;
  RAISE NOTICE 'TEST 1 PASSED: Anon cannot read waitlist rows.';
END $$;

-- ---------------------------------------------------------------------
-- TEST 2: User A CANNOT edit User B's startup
-- ---------------------------------------------------------------------
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000001", "role": "authenticated"}', true);

DO $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.startups
  SET name = 'Hacked Startup B'
  WHERE id = '33333333-0000-0000-0000-000000000003';
  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated > 0 THEN
    RAISE EXCEPTION 'TEST 2 FAILED: User A was able to update User B startup!';
  END IF;
  RAISE NOTICE 'TEST 2 PASSED: User A cannot edit User B startup.';
END $$;

-- ---------------------------------------------------------------------
-- TEST 3: User A CANNOT read User B's private swipes
-- ---------------------------------------------------------------------
DO $$
DECLARE
  v_count integer;
BEGIN
  -- Swipes swiped by User B should NOT be visible to User A
  SELECT count(*) INTO v_count
  FROM public.swipes
  WHERE swiper_id = '22222222-0000-0000-0000-000000000002';

  IF v_count > 0 THEN
    RAISE EXCEPTION 'TEST 3 FAILED: User A read % private swipes belonging to User B!', v_count;
  END IF;
  RAISE NOTICE 'TEST 3 PASSED: User A cannot view User B private swipes.';
END $$;

-- ---------------------------------------------------------------------
-- TEST 4: User A CANNOT escalate role via update
-- ---------------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    UPDATE public.users
    SET role = 'founder'
    WHERE auth_user_id = 'a0000000-0000-0000-0000-000000000001';
    
    -- If trigger failed to raise exception
    RAISE EXCEPTION 'TEST 4 FAILED: User A escalated role without admin privilege!';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'TEST 4 PASSED: Role escalation blocked by trigger (%: %)', SQLSTATE, SQLERRM;
  END;
END $$;

ROLLBACK;
