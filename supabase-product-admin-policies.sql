-- Product Admin Management Policies

-- 1. Add columns if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Add check constraint for status
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check 
  CHECK (status IN ('active', 'pending', 'rejected'));

-- 3. Drop existing policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Traders can insert products" ON products;
DROP POLICY IF EXISTS "Traders can update own products" ON products;
DROP POLICY IF EXISTS "Traders can delete own products" ON products;

-- 4. Create new comprehensive policies

-- Allow everyone to read active products
CREATE POLICY "allow_read_active_products"
ON products FOR SELECT
TO authenticated
USING (status = 'active' OR trader_id = auth.uid());

-- Allow traders to insert their own products (pending by default)
CREATE POLICY "allow_trader_insert_products"
ON products FOR INSERT
TO authenticated
WITH CHECK (
  trader_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'trader'
  )
);

-- Allow traders to update their own products
CREATE POLICY "allow_trader_update_own_products"
ON products FOR UPDATE
TO authenticated
USING (trader_id = auth.uid());

-- Allow traders to delete their own products
CREATE POLICY "allow_trader_delete_own_products"
ON products FOR DELETE
TO authenticated
USING (trader_id = auth.uid());

-- 🔑 Allow admins to read ALL products (including pending/rejected)
CREATE POLICY "allow_admin_read_all_products"
ON products FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- 🔑 Allow admins to update ANY product (approve, reject, feature, etc.)
CREATE POLICY "allow_admin_update_all_products"
ON products FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- 🔑 Allow admins to delete ANY product
CREATE POLICY "allow_admin_delete_all_products"
ON products FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- 5. Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 6. Add comments for documentation
COMMENT ON COLUMN products.status IS 'Product approval status: active, pending, or rejected';
COMMENT ON COLUMN products.is_featured IS 'Whether product is featured on homepage';
COMMENT ON COLUMN products.rejection_reason IS 'Admin reason for rejecting the product';

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_trader_id ON products(trader_id);

-- 8. Update existing products to have status if NULL
UPDATE products SET status = 'active' WHERE status IS NULL;
