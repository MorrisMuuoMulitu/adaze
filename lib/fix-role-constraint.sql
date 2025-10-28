-- Fix for role check constraint to include all possible roles

-- Drop existing role check constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS role_check;

-- Add the proper check constraint with all possible roles
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('buyer', 'trader', 'transporter', 'admin', 'wholesaler'));

-- Also update the column comment to reflect all possible roles
COMMENT ON COLUMN profiles.role IS 'User role: buyer, trader, transporter, admin, or wholesaler';