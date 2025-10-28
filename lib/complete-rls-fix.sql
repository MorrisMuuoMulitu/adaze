-- Additional fixes for RLS policies to ensure proper access

-- PROFILES TABLE POLICIES - Ensure proper policies are in place
-- Drop any duplicate policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can update any profile" ON public.profiles;

-- Re-create policies with proper names
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_service_role_all" ON public.profiles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- PRODUCTS TABLE POLICIES
-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view all products" ON public.products;
DROP POLICY IF EXISTS "Traders can manage own products" ON public.products;

-- Re-create policies
CREATE POLICY "products_select_all" ON public.products
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "products_manage_own" ON public.products
  FOR ALL TO authenticated
  USING (auth.uid() = trader_id)
  WITH CHECK (auth.uid() = trader_id);

-- ORDER_ITEMS TABLE POLICIES
-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view order items for orders they are involved in" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can insert order items" ON public.order_items;

-- Re-create policies
CREATE POLICY "order_items_select_involved" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.trader_id = auth.uid() OR orders.transporter_id = auth.uid())
    )
  );

CREATE POLICY "order_items_insert_auth" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW_LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;