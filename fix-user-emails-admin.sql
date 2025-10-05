-- Fix user emails showing as N/A in admin dashboard
-- Run this in Supabase SQL Editor

-- Drop existing function first
DROP FUNCTION IF EXISTS get_user_emails() CASCADE;

-- Create function to get user emails for admin
CREATE OR REPLACE FUNCTION get_user_emails()
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
