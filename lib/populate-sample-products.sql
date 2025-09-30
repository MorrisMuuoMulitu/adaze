-- Populate database with sample products for testing
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from auth.users table

-- First, check if your user exists
SELECT id, email, created_at FROM auth.users LIMIT 10;

-- Then insert sample products
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
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID
  'Premium Leather Jacket',
  'Genuine leather jacket with premium stitching and modern design. Perfect for daily wear and special occasions.',
  8999.00,
  'Fashion',
  'https://images.unsplash.com/photo-1521334884684-d80222895326?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  15,
  4.8
),
(
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID
  'Wireless Headphones',
  'Noise-cancelling headphones with 30-hour battery life. Perfect for travel and work.',
  12999.00,
  'Electronics',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  25,
  4.6
),
(
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID
  'Smart Fitness Watch',
  'Track your health and fitness with advanced sensors. Monitor heart rate, sleep, and activity.',
  15999.00,
  'Wearables',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  10,
  4.7
),
(
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID
  'Designer Sunglasses',
  'UV protection sunglasses with polarized lenses. Stylish and functional for any occasion.',
  3999.00,
  'Accessories',
  'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  30,
  4.5
),
(
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID
  'Running Shoes',
  'Lightweight running shoes with maximum cushioning. Perfect for daily runs and workouts.',
  7999.00,
  'Footwear',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  20,
  4.4
);

-- Verify the insertions
SELECT COUNT(*) as total_products FROM public.products;
SELECT * FROM public.products LIMIT 10;