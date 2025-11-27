-- Comprehensive Diagnostic for Products Visibility
-- Run this in Supabase SQL Editor

-- 1. Check if RLS is enabled on products
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'products';

-- 2. List ALL policies on products table
SELECT * FROM pg_policies WHERE tablename = 'products';

-- 3. Check if 'anon' role has usage on public schema
SELECT has_schema_privilege('anon', 'public', 'usage');

-- 4. Check if 'anon' role has select privilege on products table
SELECT has_table_privilege('anon', 'products', 'select');

-- 5. Check if the specific trader exists in profiles
SELECT * FROM profiles WHERE id = 'eee0ebf6-34ed-4c47-ae54-0a146672858d';

-- 6. Check RLS policies on profiles (since we join on it)
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 7. Test visibility as 'anon' user (simulated)
-- Note: This simulation might not perfectly match the API client but gives a hint
SET ROLE anon;
SELECT count(*) as anon_visible_products FROM products;
SELECT count(*) as anon_visible_active_products FROM products WHERE status = 'active';
RESET ROLE;
