-- Fix security warnings for database functions
-- Issue: Functions with "role mutable search_path" can have privilege escalation vulnerabilities

-- ============================================
-- FIX 1: handle_new_user function
-- ============================================

-- Drop existing function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate with secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- SECURE: Prevents search_path manipulation
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Secure function to create profile on user signup - fixed search_path vulnerability';

-- ============================================
-- FIX 2: get_user_emails function
-- ============================================

-- Drop existing function
DROP FUNCTION IF EXISTS public.get_user_emails() CASCADE;

-- Recreate with secure search_path
CREATE OR REPLACE FUNCTION public.get_user_emails()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- SECURE: Prevents search_path manipulation
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can access user emails';
  END IF;

  -- Return user emails
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.get_user_emails() IS 'Secure function for admins to get user emails - fixed search_path vulnerability';

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify functions are created correctly
DO $$
BEGIN
  -- Check handle_new_user
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'handle_new_user'
  ) THEN
    RAISE NOTICE '✅ handle_new_user function fixed';
  ELSE
    RAISE WARNING '❌ handle_new_user function not found';
  END IF;

  -- Check get_user_emails
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'get_user_emails'
  ) THEN
    RAISE NOTICE '✅ get_user_emails function fixed';
  ELSE
    RAISE WARNING '❌ get_user_emails function not found';
  END IF;
END $$;

-- Show function properties to verify security settings
SELECT 
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  CASE 
    WHEN p.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_type,
  p.proconfig AS config_settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('handle_new_user', 'get_user_emails');
