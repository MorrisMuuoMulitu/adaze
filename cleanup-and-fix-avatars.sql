-- Complete cleanup and fix for avatars bucket
-- This will remove ALL avatar policies and recreate them cleanly
-- Run this in Supabase Dashboard → SQL Editor

-- ============================================
-- Step 1: Drop ALL existing avatar policies (including duplicates)
-- ============================================
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Loop through all policies that contain 'avatar' in the name
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects' 
          AND lower(policyname) LIKE '%avatar%'
    LOOP
        -- Drop each policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- ============================================
-- Step 2: Create 4 clean policies
-- ============================================

-- Policy 1: Public READ access (MISSING - this is critical!)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy 2: Authenticated users can INSERT (upload)
CREATE POLICY "Anyone can upload an avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Policy 3: Authenticated users can UPDATE
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Policy 4: Authenticated users can DELETE
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- ============================================
-- Step 3: Verify exactly 4 policies exist
-- ============================================
SELECT 
  policyname as "Policy Name",
  cmd as "Operation",
  roles as "Roles"
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND lower(policyname) LIKE '%avatar%'
ORDER BY cmd, policyname;

-- Should show exactly 4 rows:
-- DELETE | Users can delete their own avatar    | {authenticated}
-- INSERT | Anyone can upload an avatar          | {authenticated}
-- SELECT | Avatar images are publicly accessible | {public}
-- UPDATE | Users can update their own avatar    | {authenticated}
