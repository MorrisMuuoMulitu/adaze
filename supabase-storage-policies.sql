-- Storage policies for avatars and uploads
-- Fixes 406 errors when uploading images

-- ============================================
-- STORAGE BUCKET: avatars
-- ============================================

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Allow public access to view avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- STORAGE BUCKET: products
-- ============================================

-- Create products bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Traders can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Traders can update their product images" ON storage.objects;
DROP POLICY IF EXISTS "Traders can delete their product images" ON storage.objects;

-- Allow public access to view product images
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow authenticated users to upload product images
CREATE POLICY "Traders can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Allow users to update product images
CREATE POLICY "Traders can update their product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

-- Allow users to delete product images
CREATE POLICY "Traders can delete their product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');

-- ============================================
-- PROFILE AVATAR_URL UPDATE
-- ============================================

-- Make sure profiles table allows avatar_url updates
-- Check if column exists, add if not
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Ensure users can update their own avatar_url in profiles
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;

CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================
-- VERIFICATION
-- ============================================

-- Show all storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;

-- Show buckets
SELECT id, name, public FROM storage.buckets;

COMMENT ON POLICY "Avatar images are publicly accessible" ON storage.objects IS 'Allows anyone to view avatar images';
COMMENT ON POLICY "Users can upload their own avatar" ON storage.objects IS 'Users can upload avatars to their own folder (user_id)';
COMMENT ON POLICY "Product images are publicly accessible" ON storage.objects IS 'Allows anyone to view product images';
