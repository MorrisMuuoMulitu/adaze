-- Verify Profile Visibility for Anon
-- Run this in Supabase SQL Editor

-- 1. Get the trader_id from one of the products
SELECT trader_id FROM products LIMIT 1;

-- 2. Check if this profile exists in the table (as admin/postgres)
SELECT * FROM profiles WHERE id = (SELECT trader_id FROM products LIMIT 1);

-- 3. Check if this profile is visible to 'anon' role
SET ROLE anon;
SELECT * FROM profiles WHERE id = (SELECT trader_id FROM products LIMIT 1);
RESET ROLE;

-- 4. Check policies on profiles again
SELECT * FROM pg_policies WHERE tablename = 'profiles';
