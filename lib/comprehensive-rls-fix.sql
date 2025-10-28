-- Comprehensive fix for RLS policies to resolve 400 errors

-- PROFILES TABLE POLICIES
-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_authenticated_read_all" ON public.profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_admin_update_all" ON public.profiles;
DROP POLICY IF EXISTS "allow_admin_delete_all" ON public.profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Allow all authenticated users to view all profiles (needed for order details, marketplace, etc.)
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Allow users to update their own profile (role changes handled by admin API)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role to perform all operations
CREATE POLICY "Service role can manage all profiles" ON public.profiles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow admin users to update any profile
CREATE POLICY "Admin users can update any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (true);

-- PRODUCTS TABLE POLICIES (for joins with profiles)
-- First, ensure products table has appropriate policies
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all products" ON public.products;
DROP POLICY IF EXISTS "Traders can manage own products" ON public.products;

-- Allow all authenticated users to view products
CREATE POLICY "Users can view all products" ON public.products
  FOR SELECT TO authenticated
  USING (true);

-- Allow traders to manage their own products
CREATE POLICY "Traders can manage own products" ON public.products
  FOR ALL TO authenticated
  USING (auth.uid() = trader_id)
  WITH CHECK (auth.uid() = trader_id);

-- ORDER_ITEMS TABLE POLICIES
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view order items for orders they are involved in" ON public.order_items;
DROP POLICY IF EXISTS "users_read_own_order_items" ON public.order_items;
DROP POLICY IF EXISTS "admin_read_order_items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can insert order items" ON public.order_items;

-- Allow users to view order items for orders they are involved in (buyer, trader, or transporter)
CREATE POLICY "Users can view order items for orders they are involved in" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.trader_id = auth.uid() OR orders.transporter_id = auth.uid())
    )
  );

-- Allow authenticated users to insert order items (needed for order creation)
CREATE POLICY "Authenticated users can insert order items" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

-- Allow service role to manage order items
CREATE POLICY "Service role can manage all order items" ON public.order_items
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;