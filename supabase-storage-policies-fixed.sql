-- Fixed Storage policies for Supabase
-- This version uses the storage schema properly

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create products bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================
-- Enable RLS on storage.objects
-- ============================================

-- First, ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AVATAR POLICIES
-- ============================================

-- Drop existing avatar policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Public read access for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Authenticated users can upload avatars to their folder
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Authenticated users can update their own avatars
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

-- Authenticated users can delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- PRODUCT POLICIES
-- ============================================

-- Drop existing product policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Traders can upload product images" ON storage.objects;
    DROP POLICY IF EXISTS "Traders can update their product images" ON storage.objects;
    DROP POLICY IF EXISTS "Traders can delete their product images" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Public read access for product images
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Authenticated users can upload product images
CREATE POLICY "Traders can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Authenticated users can update product images
CREATE POLICY "Traders can update their product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

-- Authenticated users can delete product images
CREATE POLICY "Traders can delete their product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');

-- ============================================
-- PROFILE AVATAR_URL UPDATE
-- ============================================

-- Make sure profiles table allows avatar_url updates
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
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

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
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Show buckets
SELECT id, name, public FROM storage.buckets;
