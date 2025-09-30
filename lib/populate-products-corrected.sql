-- IMPORTANT: YOU MUST USE AN ACTUAL USER ID FROM YOUR SUPABASE AUTH USERS TABLE
-- The profiles table has a foreign key constraint referencing auth.users
-- Using a dummy ID like '00000000-0000-0000-0000-000000000001' will fail

-- STEP 1: First, get an actual user ID from your auth.users table
-- Run this query to see your existing users:
SELECT id, email, created_at FROM auth.users LIMIT 10;

-- STEP 2: Copy one of the actual user IDs from the result above
-- Then replace 'YOUR_ACTUAL_USER_ID_HERE' in the queries below with that ID

-- STEP 3: Insert sample profile using the actual user ID
INSERT INTO public.profiles (
  id, 
  full_name, 
  phone, 
  location, 
  avatar_url, 
  role
) VALUES 
(
  'YOUR_ACTUAL_USER_ID_HERE',  -- <-- REPLACE THIS WITH AN ACTUAL USER ID
  'Sample Trader',
  '+254712345678',
  'Nairobi',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
  'trader'
)
ON CONFLICT (id) DO NOTHING;

-- STEP 4: Insert sample products using the same actual user ID
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
  'YOUR_ACTUAL_USER_ID_HERE',  -- <-- REPLACE THIS WITH THE SAME ACTUAL USER ID
  'Nike Air Max 270',
  'A premium running shoe with maximum air cushioning for comfort and style. Perfect for daily wear and running activities.',
  12000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  50,
  4.5
),
(
  'YOUR_ACTUAL_USER_ID_HERE',  -- <-- REPLACE THIS WITH THE SAME ACTUAL USER ID
  'Adidas Ultraboost 22',
  'Energy-returning BOOST midsole for maximum comfort and responsiveness. Ideal for running and everyday activities.',
  15000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  30,
  4.7
),
(
  'YOUR_ACTUAL_USER_ID_HERE',  -- <-- REPLACE THIS WITH THE SAME ACTUAL USER ID
  'Puma RS-X Reinvention',
  'Bold and chunky design with premium materials for a statement look. Perfect for casual wear.',
  8000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1543508282-6319a3e2621f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  25,
  4.3
),
(
  'YOUR_ACTUAL_USER_ID_HERE',  -- <-- REPLACE THIS WITH THE SAME ACTUAL USER ID
  'New Balance 574 Core',
  'Classic silhouette with modern comfort technology and all-day support. Timeless design.',
  7500.00,
  'Footwear',
  'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb89e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  40,
  4.2
),
(
  'YOUR_ACTUAL_USER_ID_HERE',  -- <-- REPLACE THIS WITH THE SAME ACTUAL USER ID
  'Converse Chuck Taylor All Star',
  'Iconic canvas sneakers with timeless design and versatile style. Perfect for any outfit.',
  5000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1605408499393-6360c7281b90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  60,
  4.4
),
(
  'YOUR_ACTUAL_USER_ID_HERE',  -- <-- REPLACE THIS WITH THE SAME ACTUAL USER ID
  'Vans Old Skool Classic',
  'The original Vans high-top with signature side stripes. A timeless classic for skateboarders and casual wear.',
  4500.00,
  'Footwear',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  35,
  4.6
),
(
  'YOUR_ACTUAL_USER_ID_HERE',  -- <-- REPLACE THIS WITH THE SAME ACTUAL USER ID
  'Jordan Retro 1',
  'The iconic basketball shoe that started it all. Premium materials and timeless design.',
  20000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  15,
  4.8
),
(
  'YOUR_ACTUAL_USER_ID_HERE',  -- <-- REPLACE THIS WITH THE SAME ACTUAL USER ID
  'Timberland Premium 6" Boots',
  'Durable and waterproof boots perfect for all seasons. Iconic style and excellent quality.',
  18000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  20,
  4.5
);

-- STEP 5: Verify the insertions worked
SELECT * FROM public.profiles WHERE id = 'YOUR_ACTUAL_USER_ID_HERE';
SELECT * FROM public.products WHERE trader_id = 'YOUR_ACTUAL_USER_ID_HERE' LIMIT 10;