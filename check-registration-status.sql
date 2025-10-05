-- ================================================================
-- CHECK REGISTRATION STATUS - Run All These Queries
-- ================================================================
-- Copy all queries below and run in Supabase SQL Editor
-- ================================================================

-- 1. Check if user was created in auth.users
SELECT 
  id, 
  email, 
  created_at, 
  email_confirmed_at,
  confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmed'
    ELSE '❌ Email NOT confirmed'
  END as email_status
FROM auth.users
WHERE email = 'bvqymz@witch.mik.pte.hu';

-- 2. Check if profile exists for this user
SELECT 
  id, 
  full_name, 
  role, 
  phone,
  location,
  created_at,
  '✅ Profile EXISTS' as status
FROM public.profiles
WHERE id = '429a045c-d16b-463b-b2a1-a72e8d32441c';

-- If above returns nothing, check ALL profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 3. Check if trigger exists and is ENABLED
SELECT 
  tgname as trigger_name, 
  tgenabled as enabled,
  CASE tgenabled
    WHEN 'O' THEN '✅ Enabled'
    ELSE '❌ Disabled or other status'
  END as status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 4. Check INSERT policy on profiles table
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles' AND cmd = 'INSERT';

-- 5. Check if there were any errors during user creation
-- (This checks Postgres logs - might not show anything)
SELECT 
  u.id,
  u.email,
  p.id as profile_id,
  CASE 
    WHEN p.id IS NULL THEN '❌ Profile NOT created'
    ELSE '✅ Profile created'
  END as profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'bvqymz@witch.mik.pte.hu';

-- ================================================================
-- SHARE ALL RESULTS WITH ME!
-- ================================================================
