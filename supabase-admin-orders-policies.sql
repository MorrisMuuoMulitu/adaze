-- Admin Orders Management Policies

-- Drop existing policies if any
DROP POLICY IF EXISTS "admin_read_all_orders" ON orders;
DROP POLICY IF EXISTS "admin_update_all_orders" ON orders;
DROP POLICY IF EXISTS "users_read_own_orders" ON orders;

-- Allow admins to read all orders
CREATE POLICY "admin_read_all_orders"
ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow admins to update all orders (change status, etc.)
CREATE POLICY "admin_update_all_orders"
ON orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow users to read their own orders (as buyer)
CREATE POLICY "users_read_own_orders"
ON orders FOR SELECT
TO authenticated
USING (buyer_id = auth.uid());

-- Allow users to insert their own orders
DROP POLICY IF EXISTS "users_insert_own_orders" ON orders;

CREATE POLICY "users_insert_own_orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (buyer_id = auth.uid());

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

COMMENT ON POLICY "admin_update_all_orders" ON orders IS 'Allows admins to update any order status';
