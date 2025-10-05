-- Test: Manually update the deleted_by value for the deleted account
-- This will help us verify if RLS is blocking the update

-- First, let's see the current value
SELECT id, full_name, deleted_by, deleted_at
FROM profiles
WHERE id = '1ee4d456-3fda-480c-a65d-177544c3b755';

-- Now try to update it (as superuser/postgres role in Supabase SQL Editor)
UPDATE profiles
SET deleted_by = 'self'
WHERE id = '1ee4d456-3fda-480c-a65d-177544c3b755';

-- Verify the update worked
SELECT id, full_name, deleted_by, deleted_at
FROM profiles
WHERE id = '1ee4d456-3fda-480c-a65d-177544c3b755';
