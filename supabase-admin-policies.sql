-- Admin Management Policies
-- Allows admins to manage all users

-- 1. Add is_suspended column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "authenticated_select_all" ON profiles;
DROP POLICY IF EXISTS "authenticated_insert_own" ON profiles;
DROP POLICY IF EXISTS "authenticated_update_own" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 3. Create new permissive policies

-- Allow all authenticated users to read all profiles
CREATE POLICY "allow_authenticated_read_all"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Allow users to insert their own profile
CREATE POLICY "allow_insert_own_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "allow_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 🔑 KEY POLICY: Allow admins to update ANY profile
CREATE POLICY "allow_admin_update_all"
ON profiles FOR UPDATE
TO authenticated
USING (
  -- Check if the current user is an admin
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow admins to delete any profile
CREATE POLICY "allow_admin_delete_all"
ON profiles FOR DELETE
TO authenticated
USING (
  -- Check if the current user is an admin
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- 4. Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Add comment for documentation
COMMENT ON COLUMN profiles.is_suspended IS 'Whether the user account is suspended by admin';

-- 6. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_suspended ON profiles(is_suspended);
