-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) NOT NULL,
  trader_id UUID REFERENCES public.profiles(id),
  transporter_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
  shipping_address TEXT NOT NULL,
  billing_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

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

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

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

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  related_order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

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