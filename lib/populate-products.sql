// This script would be used to populate the products table with mock data
// In a real app, this would be run in your Supabase dashboard or via a migration

-- Insert sample products for testing
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
  '00000000-0000-0000-0000-000000000001', -- Replace with a real profile ID
  'Nike Air Max 270',
  'A premium running shoe with maximum air cushioning for comfort and style.',
  12000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  50,
  4.5
),
(
  '00000000-0000-0000-0000-000000000001',
  'Adidas Ultraboost 22',
  'Energy-returning BOOST midsole for maximum comfort and responsiveness.',
  15000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  30,
  4.7
),
(
  '00000000-0000-0000-0000-000000000001',
  'Puma RS-X Reinvention',
  'Bold and chunky design with premium materials for a statement look.',
  8000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1543508282-6319a3e2621f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  25,
  4.3
),
(
  '00000000-0000-0000-0000-000000000001',
  'New Balance 574 Core',
  'Classic silhouette with modern comfort technology and all-day support.',
  7500.00,
  'Footwear',
  'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb89e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  40,
  4.2
),
(
  '00000000-0000-0000-0000-000000000001',
  'Converse Chuck Taylor All Star',
  'Iconic canvas sneakers with timeless design and versatile style.',
  5000.00,
  'Footwear',
  'https://images.unsplash.com/photo-1605408499393-6360c7281b90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
  60,
  4.4
);

-- Insert a sample profile for the trader_id if it doesn't exist
INSERT INTO public.profiles (
  id, 
  full_name, 
  phone, 
  location, 
  avatar_url, 
  role
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'Sample Trader',
  '+254712345678',
  'Nairobi',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
  'trader'
)
ON CONFLICT (id) DO NOTHING;