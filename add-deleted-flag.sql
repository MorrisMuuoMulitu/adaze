-- Add is_deleted column to profiles table for soft deletes
-- This allows us to mark accounts as deleted without losing data
-- and prevents deleted accounts from logging in

-- Add the column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Add deleted_at timestamp to track when account was deleted
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create index for better performance on deleted accounts check
CREATE INDEX IF NOT EXISTS idx_profiles_deleted ON profiles(is_deleted);

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_deleted IS 'Whether the user account has been deleted (soft delete)';
COMMENT ON COLUMN profiles.deleted_at IS 'Timestamp when the account was marked as deleted';
