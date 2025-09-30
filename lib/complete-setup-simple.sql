-- COMPLETE SETUP SCRIPT - SIMPLIFIED VERSION
-- This creates all tables and populates with sample data

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

-- Create simple policies for the products table
CREATE POLICY "Everyone can view products" ON public.products
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = trader_id);

CREATE POLICY "Traders can update own products" ON public.products
  FOR UPDATE TO authenticated
  USING (auth.uid() = trader_id);

CREATE POLICY "Traders can delete own products" ON public.products
  FOR DELETE TO authenticated
  USING (auth.uid() = trader_id);

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

-- Create simple policies for the cart table
CREATE POLICY "Users can view own cart items" ON public.cart
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON public.cart
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON public.cart
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON public.cart
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- NOW POPULATE WITH SAMPLE DATA
-- Use your actual user ID: eee0ebf6-34ed-4c47-ae54-0a146672858d

-- First, make sure your profile exists (it should already)
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

-- Verify the insertions worked
SELECT COUNT(*) as product_count FROM public.products WHERE trader_id = 'eee0ebf6-34ed-4c47-ae54-0a146672858d';
SELECT * FROM public.products WHERE trader_id = 'eee0ebf6-34ed-4c47-ae54-0a146672858d' LIMIT 3;