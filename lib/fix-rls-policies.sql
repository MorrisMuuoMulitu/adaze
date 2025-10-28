-- Fix RLS policies for profiles table

-- First, drop any conflicting policies on profiles table
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_admin_update_all" ON public.profiles;

-- Create proper policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to view all profiles (for order items, marketplace, etc.)
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Allow users to update their own profile (without changing role)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Prevent changing the role field directly for security (unless service role)
      (SELECT role FROM public.profiles WHERE id = old.id) = new.role
      OR auth.role() = 'service_role'  -- Allow service role to change roles
    )
  );

-- Allow service role to update any profile (admin functions)
CREATE POLICY "Service role can update any profile" ON public.profiles
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow admin users to update any profile
CREATE POLICY "Admin users can update any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Fix RLS policies for order_items table

-- Drop any existing order_items policies that might conflict
DROP POLICY IF EXISTS "Users can view order items for orders they are involved in" ON public.order_items;
DROP POLICY IF EXISTS "users_read_own_order_items" ON public.order_items;
DROP POLICY IF EXISTS "admin_read_order_items" ON public.order_items;

-- Create comprehensive policies for order_items table
CREATE POLICY "Users can view order items for orders they are involved in" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.trader_id = auth.uid() OR orders.transporter_id = auth.uid())
    )
  );

-- Allow authenticated users to insert order items (for system operations)
CREATE POLICY "Authenticated users can insert order items" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;