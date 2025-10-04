-- Create function to get user emails for admin
-- This uses SECURITY DEFINER to bypass RLS

CREATE OR REPLACE FUNCTION get_user_emails()
RETURNS TABLE (id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
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
