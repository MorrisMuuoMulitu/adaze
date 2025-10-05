-- ================================================================
-- VERIFY REGISTRATION SETUP - Diagnostic Queries
-- ================================================================
-- Run this in Supabase Dashboard > SQL Editor to diagnose the issue
-- ================================================================

-- 1. Check if all policies exist on profiles table
SELECT 
  policyname,
  cmd as command,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Expected output should include:
-- ✅ INSERT policy: "Allow profile creation on signup"
-- ✅ SELECT policies for viewing profiles
-- ✅ UPDATE policies for editing profiles

RAISE NOTICE '=== Policies Check Complete ===';

-- 2. Check if handle_new_user function exists
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  CASE p.prosecdef 
    WHEN true THEN '✅ SECURITY DEFINER' 
    ELSE '❌ NOT SECURITY DEFINER'
  END as security
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'handle_new_user';

-- Expected: Should show function with SECURITY DEFINER

-- 3. Check if trigger exists
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Expected: Should show trigger that fires AFTER INSERT on auth.users

-- 4. Check profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Expected: Should show id, full_name, phone, location, avatar_url, role, created_at, updated_at

-- 5. Count existing profiles
SELECT 
  COUNT(*) as total_profiles,
  COUNT(DISTINCT role) as distinct_roles,
  string_agg(DISTINCT role, ', ') as roles_in_use
FROM public.profiles;

-- 6. Check recent auth.users (if any exist)
SELECT 
  id,
  email,
  created_at,
  confirmed_at,
  email_confirmed_at,
  raw_user_meta_data->>'role' as user_role
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 7. Test if we can manually insert into profiles (simulating what trigger does)
-- This is a DRY RUN - it will rollback
DO $$
DECLARE
  test_id uuid := gen_random_uuid();
BEGIN
  -- Try to insert
  INSERT INTO public.profiles (id, full_name, phone, location, role)
  VALUES (test_id, 'Test User', '+254700000000', 'Nairobi', 'buyer');
  
  RAISE NOTICE '✅ Manual INSERT into profiles works!';
  
  -- Check if it was inserted
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = test_id) THEN
    RAISE NOTICE '✅ Row was successfully inserted and is readable';
  ELSE
    RAISE WARNING '❌ Row was inserted but is not readable (RLS issue?)';
  END IF;
  
  -- Rollback the test insert
  RAISE EXCEPTION 'Rolling back test insert (this is expected)';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Test completed - insert was rolled back';
END $$;

-- ================================================================
-- SUMMARY OF WHAT TO LOOK FOR:
-- ================================================================
-- ✅ INSERT policy exists on profiles
-- ✅ handle_new_user function exists with SECURITY DEFINER
-- ✅ on_auth_user_created trigger exists and is enabled
-- ✅ profiles table has all required columns
-- ✅ Manual insert test succeeds
--
-- If all checks pass, the database is configured correctly.
-- If registration still fails, the issue is likely:
-- 1. Email confirmation settings in Supabase Auth
-- 2. Frontend error
-- 3. API route error
-- 4. Environment variables
-- ================================================================
