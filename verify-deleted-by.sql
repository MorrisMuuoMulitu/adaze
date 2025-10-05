-- Verify deleted_by column values for deleted accounts
-- Run this in Supabase SQL Editor to check what's stored

SELECT 
  p.id,
  p.full_name,
  p.is_deleted,
  p.deleted_by,
  p.deleted_at,
  p.suspended_by,
  p.is_suspended,
  p.created_at
FROM profiles p
WHERE p.is_deleted = true
ORDER BY p.deleted_at DESC
LIMIT 10;

-- Also check if the tracking columns exist and their type
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('deleted_by', 'suspended_by', 'is_deleted', 'deleted_at', 'suspended_at', 'last_login_at', 'login_count')
ORDER BY column_name;
