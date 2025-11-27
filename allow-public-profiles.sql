-- Allow public read access to trader profiles
-- This is necessary for the products API to fetch trader details (name, location, etc.)

-- 1. Check existing policies on profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 2. Create policy to allow anyone to view profiles (or at least trader profiles)
-- Drop if exists to avoid conflict
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true); -- Or limit to role = 'trader' if you want to be stricter

-- 3. Grant access
GRANT SELECT ON profiles TO anon, authenticated;
