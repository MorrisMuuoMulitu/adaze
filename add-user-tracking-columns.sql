-- Add comprehensive tracking columns to profiles table
-- This allows admins to see complete user activity history

-- Track who deleted/suspended the account
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_by VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- Track account activity
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN profiles.deleted_by IS 'Who deleted the account: "self" for user deletion, user_id for admin deletion';
COMMENT ON COLUMN profiles.suspended_by IS 'Who suspended the account: "self" for user suspension, user_id for admin suspension';
COMMENT ON COLUMN profiles.suspended_at IS 'Timestamp when the account was suspended';
COMMENT ON COLUMN profiles.last_login_at IS 'Timestamp of the last successful login';
COMMENT ON COLUMN profiles.login_count IS 'Total number of successful logins';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_by ON profiles(deleted_by);
CREATE INDEX IF NOT EXISTS idx_profiles_suspended_by ON profiles(suspended_by);
