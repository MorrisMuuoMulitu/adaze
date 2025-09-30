-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view orders they are involved in" ON public.orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert orders" ON public.orders;

-- Create simple policies for the orders table
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

-- Drop existing policies for order_items
DROP POLICY IF EXISTS "Users can view order items for orders they are involved in" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can insert order items" ON public.order_items;

-- Create simple policies for the order_items table
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

-- Drop existing policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

-- Create simple policies for the notifications table
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