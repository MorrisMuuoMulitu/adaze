-- Verify deleted_by column values for deleted accounts
-- Run this in Supabase SQL Editor to check what's stored

SELECT 
  id,
  full_name,
  email,
  is_deleted,
  deleted_by,
  deleted_at,
  suspended_by,
  is_suspended
FROM profiles
WHERE is_deleted = true
ORDER BY deleted_at DESC
LIMIT 10;

-- Also check if the column exists and its type
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('deleted_by', 'suspended_by', 'is_deleted', 'deleted_at');
