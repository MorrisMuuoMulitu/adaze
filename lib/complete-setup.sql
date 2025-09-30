-- COMPLETE SETUP SCRIPT
-- Run this first to create all tables, then the population script

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trader_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for the products table
CREATE POLICY "Users can view all products" ON public.products
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Traders can manage own products" ON public.products
  FOR ALL TO authenticated
  USING (auth.uid() = trader_id)
  WITH CHECK (auth.uid() = trader_id);

-- Create cart table
CREATE TABLE IF NOT EXISTS public.cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)  -- Prevent duplicate items in cart for same user
);

-- Enable Row Level Security (RLS) on cart table
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Create policies for the cart table
CREATE POLICY "Users can view own cart items" ON public.cart
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart items" ON public.cart
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create orders table to establish relationship with users
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) NOT NULL,
  trader_id UUID REFERENCES public.profiles(id),
  transporter_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,  -- Order title/identifier
  description TEXT,     -- Order description
  amount DECIMAL(10,2) NOT NULL,  -- Total order amount
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
  shipping_address TEXT NOT NULL,  -- Changed from pickup_location
  billing_address TEXT,  -- Optional billing address
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for the orders table
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

-- Allow traders to update their assigned orders (e.g., change status)
CREATE POLICY "Traders can update assigned orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = trader_id
    AND (
      SELECT role = 'trader' 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = trader_id
    AND (
      -- Prevent changing the core order details, only allow status updates
      (SELECT status FROM public.orders WHERE id = old.id) = new.status 
      OR (old.id = new.id AND old.buyer_id = new.buyer_id AND old.trader_id = new.trader_id 
          AND old.transporter_id = new.transporter_id AND old.title = new.title 
          AND old.description = new.description AND old.amount = new.amount 
          AND old.shipping_address = new.shipping_address AND old.billing_address = new.billing_address)
    )
  );

-- Allow transporters to update their assigned orders (e.g., update status/location)
CREATE POLICY "Transporters can update assigned orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = transporter_id
    AND (
      SELECT role = 'transporter' 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = transporter_id
    AND (
      -- Prevent changing the core order details, only allow status/location updates
      (old.id = new.id AND old.buyer_id = new.buyer_id AND old.trader_id = new.trader_id 
       AND old.title = new.title AND old.description = new.description 
       AND old.amount = new.amount AND old.shipping_address = new.shipping_address)
    )
  );

-- Allow users to insert as buyers only if their profile role is 'buyer'
CREATE POLICY "Users can insert orders only in allowed roles" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (
    (
      auth.uid() = buyer_id
      AND (SELECT COALESCE(role, '') = 'buyer' FROM public.profiles WHERE id = auth.uid())
    )
    OR (
      auth.uid() = trader_id
      AND (SELECT COALESCE(role, '') = 'trader' FROM public.profiles WHERE id = auth.uid())
    )
    OR (
      auth.uid() = transporter_id
      AND (SELECT COALESCE(role, '') = 'transporter' FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Create order_items table to track individual items in an order
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10,2) NOT NULL,  -- Price when order was placed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for the order_items table
CREATE POLICY "Users can view order items for orders they are involved in" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.trader_id = auth.uid() OR orders.transporter_id = auth.uid())
    )
  );

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

-- Create policies for the notifications table
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  product_id UUID REFERENCES public.products(id),
  reviewer_id UUID REFERENCES public.profiles(id) NOT NULL,
  reviewed_id UUID REFERENCES public.profiles(id) NOT NULL, -- Trader or Transporter
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for the reviews table
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can view all reviews" ON public.reviews
  FOR SELECT TO authenticated, anon
  USING (true);

-- Allow reviewed users to view reviews about them (optional, for profile pages)
CREATE POLICY "Reviewed users can view reviews about them" ON public.reviews
  FOR SELECT TO authenticated
  USING (auth.uid() = reviewed_id);

-- NOW POPULATE WITH SAMPLE DATA
-- Use your actual user ID: eee0ebf6-34ed-4c47-ae54-0a146672858d

-- Insert sample profile (will work even if it's a buyer - we're just using it for testing)
INSERT INTO public.profiles (
  id, 
  full_name, 
  phone, 
  location, 
  avatar_url, 
  role
) VALUES 
(
  'eee0ebf6-34ed-4c47-ae54-0a146672858d',  -- Your actual user ID
  'Test User',
  '+254712345678',
  'Nairobi',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
  'buyer'  -- It's okay to use buyer for testing
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample products 
INSERT INTO public.products (
  trader_id, 
  name, 
  description, 
  price, 
  category, 
  image_url, 
  stock_quantity, 
  rating
) VALUES 
(
  'eee0ebf6-34ed-4c47-ae54-0a146672858d',  -- Using your actual user ID
  'Nike Air Max 270',
  'A premium running shoe with maximum air cushioning for comfort and style. Perfect for daily wear and running activities.',
  12000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  50,
  4.5
),
(
  'eee0ebf6-34ed-4c47-ae54-0a146672858d',
  'Adidas Ultraboost 22',
  'Energy-returning BOOST midsole for maximum comfort and responsiveness. Ideal for running and everyday activities.',
  15000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  30,
  4.7
),
(
  'eee0ebf6-34ed-4c47-ae54-0a146672858d',
  'Puma RS-X Reinvention',
  'Bold and chunky design with premium materials for a statement look. Perfect for casual wear.',
  8000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1543508282-6319a3e2621f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  25,
  4.3
),
(
  'eee0ebf6-34ed-4c47-ae54-0a146672858d',
  'New Balance 574 Core',
  'Classic silhouette with modern comfort technology and all-day support. Timeless design.',
  7500.00,
  'Footwear',
  'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb89e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  40,
  4.2
),
(
  'eee0ebf6-34ed-4c47-ae54-0a146672858d',
  'Converse Chuck Taylor All Star',
  'Iconic canvas sneakers with timeless design and versatile style. Perfect for any outfit.',
  5000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1605408499393-6360c7281b90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  60,
  4.4
),
(
  'eee0ebf6-34ed-4c47-ae54-0a146672858d',
  'Vans Old Skool Classic',
  'The original Vans high-top with signature side stripes. A timeless classic for skateboarders and casual wear.',
  4500.00,
  'Footwear',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  35,
  4.6
),
(
  'eee0ebf6-34ed-4c47-ae54-0a146672858d',
  'Jordan Retro 1',
  'The iconic basketball shoe that started it all. Premium materials and timeless design.',
  20000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  15,
  4.8
),
(
  'eee0ebf6-34ed-4c47-ae54-0a146672858d',
  'Timberland Premium 6" Boots',
  'Durable and waterproof boots perfect for all seasons. Iconic style and excellent quality.',
  18000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  20,
  4.5
);

-- Verify the insertions
SELECT * FROM public.profiles WHERE id = 'eee0ebf6-34ed-4c47-ae54-0a146672858d';
SELECT * FROM public.products WHERE trader_id = 'eee0ebf6-34ed-4c47-ae54-0a146672858d' LIMIT 10;