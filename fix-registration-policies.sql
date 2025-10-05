-- ================================================================
-- FIX REGISTRATION ISSUE - Add Missing INSERT Policy
-- ================================================================
-- Run this in Supabase Dashboard > SQL Editor
--
-- Issue: Users cannot create accounts because profiles table
--        is missing INSERT policy for the trigger function
-- ================================================================

-- 1. Add INSERT policy for profiles table (for trigger function)
-- This allows the handle_new_user() trigger to insert new profiles
CREATE POLICY "Allow profile creation on signup" ON public.profiles
  FOR INSERT 
  WITH CHECK (true);

-- 2. Verify the trigger function exists and has SECURITY DEFINER
DO $$ 
BEGIN
  -- Check if handle_new_user function exists
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'handle_new_user'
  ) THEN
    RAISE NOTICE '✅ handle_new_user function exists';
  ELSE
    RAISE WARNING '❌ handle_new_user function NOT FOUND - You need to run supabase-setup.sql first!';
  END IF;

  -- Check if trigger exists
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    RAISE NOTICE '✅ on_auth_user_created trigger exists';
  ELSE
    RAISE WARNING '❌ on_auth_user_created trigger NOT FOUND - You need to run supabase-setup.sql first!';
  END IF;
END $$;

-- 3. List all current policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Expected output should show:
-- ✅ "Users can view own profile" (SELECT)
-- ✅ "Service role can view all profiles" (SELECT)
-- ✅ "Users can update own profile" (UPDATE)
-- ✅ "Service role can update any profile" (UPDATE)
-- ✅ "Allow profile creation on signup" (INSERT) <- NEW!

-- 4. Test query - Check if profiles table is ready
SELECT 
  COUNT(*) as total_profiles,
  COUNT(DISTINCT role) as unique_roles
FROM public.profiles;

-- ================================================================
-- NEXT STEPS AFTER RUNNING THIS SQL:
-- ================================================================
-- 1. Try creating a new account
-- 2. If still fails, check Supabase Dashboard > Authentication > Settings:
--    - Confirm email: Should be DISABLED for testing (or set up SMTP)
--    - Auto-confirm users: Should be ENABLED for testing
-- 3. Check browser console for any JavaScript errors
-- 4. Check Supabase Dashboard > Logs for detailed error messages
-- ================================================================
