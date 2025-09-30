-- COMPREHENSIVE POLICY UPDATE SCRIPT
-- This script will properly update all RLS policies

-- First, disable RLS temporarily to avoid conflicts
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Wait a moment for changes to take effect
SELECT pg_sleep(1);

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view orders they are involved in" ON public.orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view order items for orders they are involved in" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

-- Recreate all policies from scratch
-- Orders table policies
CREATE POLICY "Users can view orders they are involved in" ON public.orders
  FOR SELECT TO authenticated
  USING (
    auth.uid() = buyer_id OR 
    auth.uid() = trader_id OR 
    auth.uid() = transporter_id
  );

CREATE POLICY "Buyers can create orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can insert orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Order items table policies
CREATE POLICY "Users can view order items for orders they are involved in" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.trader_id = auth.uid() OR orders.transporter_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can insert order items" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Notifications table policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Verify policies were created
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('orders', 'order_items', 'notifications')
ORDER BY tablename, policyname;