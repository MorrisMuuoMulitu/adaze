-- Complete RLS policy reset and setup to resolve duplicate policy errors

-- First, drop ALL existing policies on the tables to reset them completely
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.profiles';
    END LOOP;

    -- Drop all policies on products table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.products';
    END LOOP;

    -- Drop all policies on order_items table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.order_items';
    END LOOP;
END $$;

-- PROFILES TABLE POLICIES
-- Allow users to view their own profile
CREATE POLICY "profiles_select_own_policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Allow all authenticated users to view all profiles (needed for order details, marketplace, etc.)
CREATE POLICY "profiles_select_all_policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Allow users to update their own profile (role changes handled by admin API)
CREATE POLICY "profiles_update_own_policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role to perform all operations
CREATE POLICY "profiles_service_role_all_policy" ON public.profiles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow admin users to update any profile
CREATE POLICY "profiles_admin_update_any_policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (true);

-- PRODUCTS TABLE POLICIES
-- Allow all authenticated users to view products
CREATE POLICY "products_select_all_policy" ON public.products
  FOR SELECT TO authenticated
  USING (true);

-- Allow traders to manage their own products
CREATE POLICY "products_manage_own_policy" ON public.products
  FOR ALL TO authenticated
  USING (auth.uid() = trader_id)
  WITH CHECK (auth.uid() = trader_id);

-- ORDER_ITEMS TABLE POLICIES
-- Allow users to view order items for orders they are involved in (buyer, trader, or transporter)
CREATE POLICY "order_items_select_involved_policy" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.trader_id = auth.uid() OR orders.transporter_id = auth.uid())
    )
  );

-- Allow authenticated users to insert order items (needed for order creation)
CREATE POLICY "order_items_insert_auth_policy" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

-- Allow service role to manage order items
CREATE POLICY "order_items_service_role_all_policy" ON public.order_items
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;