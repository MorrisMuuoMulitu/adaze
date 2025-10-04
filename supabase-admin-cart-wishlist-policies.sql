-- Allow admins to manage cart and wishlist (needed for product deletion)

-- ========================================
-- CART POLICIES
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "admin_delete_all_cart" ON cart;
DROP POLICY IF EXISTS "admin_read_all_cart" ON cart;

-- Allow admins to delete any cart items (needed when deleting products)
CREATE POLICY "admin_delete_all_cart"
ON cart FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow admins to read all cart items
CREATE POLICY "admin_read_all_cart"
ON cart FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow users to manage their own cart (existing functionality)
DROP POLICY IF EXISTS "users_manage_own_cart" ON cart;

CREATE POLICY "users_manage_own_cart"
ON cart FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Enable RLS
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- ========================================
-- WISHLIST POLICIES
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "admin_delete_all_wishlist" ON wishlist;
DROP POLICY IF EXISTS "admin_read_all_wishlist" ON wishlist;

-- Allow admins to delete any wishlist items (needed when deleting products)
CREATE POLICY "admin_delete_all_wishlist"
ON wishlist FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow admins to read all wishlist items
CREATE POLICY "admin_read_all_wishlist"
ON wishlist FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow users to manage their own wishlist (existing functionality)
DROP POLICY IF EXISTS "users_manage_own_wishlist" ON wishlist;

CREATE POLICY "users_manage_own_wishlist"
ON wishlist FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Enable RLS
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

COMMENT ON POLICY "admin_delete_all_cart" ON cart IS 'Allows admins to delete any cart items when removing products';
COMMENT ON POLICY "admin_delete_all_wishlist" ON wishlist IS 'Allows admins to delete any wishlist items when removing products';
