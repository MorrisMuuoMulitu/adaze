-- Setup Products Bucket and Policies
-- Run this AFTER fix-avatars-policies.sql works
-- Run this in Supabase Dashboard → SQL Editor

-- ============================================
-- Step 1: Create products bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================
-- Step 2: Drop existing policies if any
-- ============================================
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Traders can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Traders can update their product images" ON storage.objects;
DROP POLICY IF EXISTS "Traders can delete their product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;

-- ============================================
-- Step 3: Create policies for products bucket
-- ============================================

-- Policy 1: Public READ access
CREATE POLICY "Product images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');

-- Policy 2: Authenticated users can INSERT (upload)
CREATE POLICY "Traders can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Policy 3: Authenticated users can UPDATE
CREATE POLICY "Traders can update their product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Policy 4: Authenticated users can DELETE
CREATE POLICY "Traders can delete their product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'products');

-- ============================================
-- Verification: Show all policies
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%product%'
ORDER BY policyname;

-- Show bucket configuration
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'products';
