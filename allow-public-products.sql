-- Allow public read access to active products
-- This policy allows both authenticated and anonymous users to view products with status 'active'

-- First, drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view active products" ON products;

-- Create the new policy
CREATE POLICY "Anyone can view active products"
ON products FOR SELECT
USING (status = 'active');

-- Ensure RLS is enabled on the table (it likely is, but good practice)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Grant usage on schema public to anon and authenticated (usually default, but ensures access)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on products to anon and authenticated
GRANT SELECT ON products TO anon, authenticated;
