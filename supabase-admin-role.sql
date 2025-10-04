-- Add admin role support

-- 1. Update role check constraint to include admin
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('buyer', 'trader', 'transporter', 'admin'));

-- 2. Create your admin user (replace with your actual user ID)
-- To find your user ID, run: SELECT id, email FROM auth.users WHERE email = 'your@email.com';

-- Example: UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id-here';
-- UPDATE profiles SET role = 'admin' WHERE id = 'eee0ebf6-34ed-4c47-ae54-0a146672858d';

COMMENT ON COLUMN profiles.role IS 'User role: buyer, trader, transporter, or admin';
