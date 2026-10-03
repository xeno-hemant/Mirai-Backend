-- =====================================================================
-- Storage Buckets & Storage RLS Migration
-- Buckets: avatars (public read, 2MB max), pitch-decks (private, 15MB max)
-- =====================================================================

-- 1. INSERT BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('pitch-decks', 'pitch-decks', false, 15728640, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. STORAGE OBJECTS RLS POLICIES

-- Avatars: Public read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'avatars_public_select' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY avatars_public_select ON storage.objects
      FOR SELECT TO authenticated, anon
      USING (bucket_id = 'avatars');
  END IF;
END $$;

-- Avatars: Upload/Update/Delete only inside own user folder {auth.uid()}/*
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'avatars_user_insert' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY avatars_user_insert ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'avatars_user_update' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY avatars_user_update ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
      WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'avatars_user_delete' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY avatars_user_delete ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- Pitch Decks: PRIVATE. Upload/Update/Delete only inside {auth.uid()}/*
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'pitch_decks_user_select' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY pitch_decks_user_select ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'pitch-decks'
        AND (
          (storage.foldername(name))[1] = auth.uid()::text
          OR public.is_admin()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'pitch_decks_user_insert' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY pitch_decks_user_insert ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'pitch-decks'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'pitch_decks_user_update' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY pitch_decks_user_update ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'pitch-decks'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
      WITH CHECK (
        bucket_id = 'pitch-decks'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'pitch_decks_user_delete' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY pitch_decks_user_delete ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'pitch-decks'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;
