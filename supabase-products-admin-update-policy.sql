-- Allow admins to update products (for featuring, status changes, etc.)

-- Drop existing policies
DROP POLICY IF EXISTS "allow_admin_update_all_products" ON products;

-- Allow admins to update ANY product
CREATE POLICY "allow_admin_update_all_products"
ON products FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Ensure traders can still update their own products
DROP POLICY IF EXISTS "allow_trader_update_own_products" ON products;

CREATE POLICY "allow_trader_update_own_products"
ON products FOR UPDATE
TO authenticated
USING (trader_id = auth.uid())
WITH CHECK (trader_id = auth.uid());

COMMENT ON POLICY "allow_admin_update_all_products" ON products IS 'Allows admins to update any product (feature, approve, reject, etc.)';
