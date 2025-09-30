-- Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  avatar_url TEXT DEFAULT '',
  role TEXT DEFAULT 'buyer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for the profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Allow service roles to view all profiles (for admin functions)
CREATE POLICY "Service role can view all profiles" ON public.profiles
  FOR SELECT TO service_role
  USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Prevent changing the role field directly for security
      (SELECT role FROM public.profiles WHERE id = old.id) = new.role
      OR auth.role() = 'service_role'  -- Allow service role to change roles
    )
  );

-- Allow service role to update any profile (admin functions)
CREATE POLICY "Service role can update any profile" ON public.profiles
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, false, 5242880, '{image/png,image/jpeg,image/jpg,image/webp}')
ON CONFLICT (id) DO NOTHING;

-- Create policies for avatar storage
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT TO authenticated, anon
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (SELECT auth.uid()) = OWNER 
    AND (SELECT lower((storage.foldername(name))[1])) = lower(auth.uid()::text)
  );

CREATE POLICY "Users can update own avatar images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (SELECT auth.uid()) = OWNER 
    AND (SELECT lower((storage.foldername(name))[1])) = lower(auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (SELECT auth.uid()) = OWNER 
    AND (SELECT lower((storage.foldername(name))[1])) = lower(auth.uid()::text)
  );

CREATE POLICY "Users can delete own avatar images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (SELECT auth.uid()) = OWNER 
    AND (SELECT lower((storage.foldername(name))[1])) = lower(auth.uid()::text)
  );

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

-- Create wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id) -- Ensure a user can only add a product to their wishlist once
);

-- Enable Row Level Security (RLS) on wishlist table
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Create policies for the wishlist table
CREATE POLICY "Users can view their own wishlist" ON public.wishlist
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist" ON public.wishlist
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist" ON public.wishlist
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Drop the old trigger and function to safely recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a new function that copies metadata to the profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, location, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_app_meta_data->>'full_name', 
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'phone', 
      NEW.raw_app_meta_data->>'phone', 
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'location', 
      NEW.raw_app_meta_data->>'location', 
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'role', 
      NEW.raw_app_meta_data->>'role', 
      'buyer'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to use the new function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();