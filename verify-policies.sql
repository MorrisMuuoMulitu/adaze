-- Verify all storage policies were created
-- Run this in Supabase SQL Editor to check

SELECT 
  policyname as "Policy Name",
  cmd as "Operation",
  roles as "Roles"
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%avatar%'
ORDER BY policyname;
