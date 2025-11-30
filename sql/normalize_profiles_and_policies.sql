-- normalize_profiles_and_policies.sql
-- Run these blocks one-by-one in the Supabase SQL editor.
-- BACKUP your data / review results before running destructive commands.

-- 1) Inspect table structure for `profiles`
-- Run and check output
-- ---------------------------------------------------------
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles';


-- 2) Optional: add `user_id` column if your schema doesn't have it
-- This is non-destructive and will only add the column if missing
-- ---------------------------------------------------------
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_id uuid;


-- 3) Create missing profiles for users that have no profile row yet
-- This will create one profile per auth.user that isn't matched by
-- profiles.id, profiles.user_id, or profiles.metadata->>'email'.
-- ---------------------------------------------------------
INSERT INTO public.profiles (id, username, full_name, user_id, metadata)
SELECT
  u.id AS id,
  u.email AS username,
  NULL::text AS full_name,
  u.id AS user_id,
  jsonb_build_object('email', u.email) AS metadata
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1
  FROM public.profiles p
  WHERE p.id = u.id
     OR (p.user_id IS NOT NULL AND p.user_id = u.id)
     OR (p.metadata ->> 'email') = u.email
);


-- 4) Populate `user_id` when metadata.email matches auth.users.email
-- ---------------------------------------------------------
UPDATE public.profiles p
SET user_id = u.id
FROM auth.users u
WHERE p.user_id IS NULL
  AND (p.metadata->>'email') = u.email;


-- 5) Populate metadata.email when profile.id matches auth.users.id
-- This ensures future email lookups work via metadata->>'email'
-- ---------------------------------------------------------
UPDATE public.profiles p
SET metadata = jsonb_set(coalesce(p.metadata, '{}'::jsonb), '{email}', to_jsonb(u.email::text), true)
FROM auth.users u
WHERE (p.metadata->>'email') IS NULL
  AND p.id = u.id;


-- 6) Verify the user in question (replace the id/email below)
-- ---------------------------------------------------------
-- Replace values with the ones from your console if different
SELECT id, user_id, username, full_name, role, is_admin, metadata
FROM public.profiles
WHERE id = 'c569ee08-3b90-4ce4-a3ae-3b4a0c06a8e7'
   OR (metadata ->> 'email') = 'brunogomesdsilva8@gmail.com';


-- 7) Count total profiles (quick sanity check)
-- ---------------------------------------------------------
SELECT count(*) FROM public.profiles;


-- 8) Enable RLS and create safe policies (only allow users to read/modify their own profile)
-- IMPORTANT: If you have existing custom policies that reference `profiles` in subqueries,
-- review and drop them first. These policies below are standard and minimal.
-- ---------------------------------------------------------
-- Enable RLS (safe even if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- DROP conflicting policies (optional): uncomment and run if you know old policies exist
-- DROP POLICY IF EXISTS "Profiles: select own" ON public.profiles;
-- DROP POLICY IF EXISTS "Profiles: insert own" ON public.profiles;
-- DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles;
-- DROP POLICY IF EXISTS "Profiles: delete own" ON public.profiles;

-- Create policies using auth.uid() = id
-- Some Postgres versions do not support CREATE POLICY IF NOT EXISTS.
-- Use DROP IF EXISTS followed by CREATE to be compatible.
DROP POLICY IF EXISTS "Profiles: select own" ON public.profiles;
CREATE POLICY "Profiles: select own" ON public.profiles
  FOR SELECT
  USING ( auth.uid() = id );

DROP POLICY IF EXISTS "Profiles: insert own" ON public.profiles;
CREATE POLICY "Profiles: insert own" ON public.profiles
  FOR INSERT
  WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles;
CREATE POLICY "Profiles: update own" ON public.profiles
  FOR UPDATE
  USING ( auth.uid() = id )
  WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Profiles: delete own" ON public.profiles;
CREATE POLICY "Profiles: delete own" ON public.profiles
  FOR DELETE
  USING ( auth.uid() = id );


-- 9) Test RLS from the SQL editor (simulate by selecting as supabase service role or via client)
-- Example: select your profile by id
SELECT id, user_id, username, full_name, metadata
FROM public.profiles
WHERE id = 'c569ee08-3b90-4ce4-a3ae-3b4a0c06a8e7';

-- End of script
