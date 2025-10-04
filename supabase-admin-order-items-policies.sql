-- Allow admins to read order_items (needed to check if product is in orders before deleting)

-- Drop existing policies if any
DROP POLICY IF EXISTS "admin_read_order_items" ON order_items;

-- Allow admins to read all order_items
CREATE POLICY "admin_read_order_items"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Also allow users to read their own order items
DROP POLICY IF EXISTS "users_read_own_order_items" ON order_items;

CREATE POLICY "users_read_own_order_items"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

COMMENT ON POLICY "admin_read_order_items" ON order_items IS 'Allows admins to read all order items to check product references';
