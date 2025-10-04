-- Fix order_items policies to allow admin deletes and proper joins

-- Drop existing policies
DROP POLICY IF EXISTS "admin_read_order_items" ON order_items;
DROP POLICY IF EXISTS "users_read_own_order_items" ON order_items;
DROP POLICY IF EXISTS "admin_delete_order_items" ON order_items;

-- Allow admins to read all order_items (needed for joins in product delete)
CREATE POLICY "admin_read_all_order_items"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow admins to delete order_items (needed when deleting orders)
CREATE POLICY "admin_delete_all_order_items"
ON order_items FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow users to read their own order items
CREATE POLICY "users_read_own_order_items"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.buyer_id = auth.uid()
  )
);

-- Allow system to insert order items (for checkout)
DROP POLICY IF EXISTS "system_insert_order_items" ON order_items;

CREATE POLICY "system_insert_order_items"
ON order_items FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

COMMENT ON POLICY "admin_read_all_order_items" ON order_items IS 'Allows admins to read all order items for joins and checks';
COMMENT ON POLICY "admin_delete_all_order_items" ON order_items IS 'Allows admins to delete order items when deleting orders';
