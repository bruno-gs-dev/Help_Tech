-- Fix for "Database error saving new user" during Supabase registration.
-- This script performs 3 actions:
-- 1. Creates a robust function to handle new user creation, robust against missing metadata.
-- 2. Drops the existing trigger (if any) to avoid conflicts.
-- 3. Recreates the trigger on auth.users.

-- 1. Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_username text;
  new_full_name text;
BEGIN
  -- Try to get username from metadata, fallback to email prefix
  new_username := new.raw_user_meta_data->>'username';
  IF new_username IS NULL OR new_username = '' THEN
    new_username := split_part(new.email, '@', 1);
  END IF;

  -- Try to get full_name from metadata, fallback to first_name + last_name
  new_full_name := new.raw_user_meta_data->>'full_name';
  IF new_full_name IS NULL OR new_full_name = '' THEN
    IF (new.raw_user_meta_data->>'first_name') IS NOT NULL THEN
      new_full_name := (new.raw_user_meta_data->>'first_name') || ' ' || COALESCE(new.raw_user_meta_data->>'last_name', '');
    END IF;
  END IF;

  -- Insert into public.profiles
  -- Using ON CONFLICT to prevent errors if profile already exists
  INSERT INTO public.profiles (id, username, full_name, user_id, metadata)
  VALUES (
    new.id,
    new_username,
    trim(both from new_full_name),
    new.id,
    jsonb_build_object(
      'email', new.email,
      'phone', new.raw_user_meta_data->>'phone',
      'birthday', new.raw_user_meta_data->>'birthday',
      'signup_source', 'auth_trigger'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    metadata = profiles.metadata || EXCLUDED.metadata;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
