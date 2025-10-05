-- Fix user emails showing as N/A in admin dashboard
-- ERROR: "column p.email does not exist" means old broken function exists
-- Run this in Supabase SQL Editor

-- Drop ALL versions of the function (with different signatures)
DO $$ 
BEGIN
    -- Drop any function with the name get_user_emails regardless of parameters
    EXECUTE (
        SELECT string_agg('DROP FUNCTION IF EXISTS ' || oid::regprocedure || ' CASCADE;', ' ')
        FROM pg_proc 
        WHERE proname = 'get_user_emails'
    );
END $$;

-- Create the correct function to get user emails for admin
CREATE FUNCTION get_user_emails()
RETURNS TABLE (id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can access user emails';
  END IF;

  -- Return user IDs and emails from auth.users
  RETURN QUERY
  SELECT au.id, au.email::TEXT
  FROM auth.users au;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_emails() TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_user_emails() IS 'Returns user emails for admin dashboard. Only accessible by admin users.';

-- Verify the function was created correctly
SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'get_user_emails';
