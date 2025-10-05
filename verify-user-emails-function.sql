-- Verify the function was created correctly and check the data

-- 1. Check if function exists
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'get_user_emails';

-- 2. Check auth.users table has emails (bypassing RLS since we're superuser in SQL Editor)
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check profiles table
SELECT id, full_name, role, created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verify admin users exist
SELECT id, full_name, role
FROM public.profiles
WHERE role = 'admin';
