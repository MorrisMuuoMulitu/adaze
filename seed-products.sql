-- Seed Data for Adaze Marketplace
-- Run this in the Supabase SQL Editor

-- 1. Create a sample trader profile (if not exists)
-- We'll use a fixed UUID for the trader so we can link products to it
-- Note: In a real scenario, you'd link to an existing auth.users id, but for public data display, 
-- we just need a profile entry. If you want to log in as this user, you'd need to create an auth user first.
-- For now, we'll insert a profile that acts as a placeholder for the "seller".

INSERT INTO profiles (id, full_name, role, is_suspended, location, phone_number)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fashion Hub Nairobi', 'trader', false, 'Nairobi, Kenya', '+254700000001'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Mombasa Vintage', 'trader', false, 'Mombasa, Kenya', '+254700000002')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Sample Products
INSERT INTO products (trader_id, name, description, price, category, image_url, stock_quantity, rating, status, created_at)
VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Vintage Denim Jacket',
    'Classic 90s denim jacket in excellent condition. Perfect for casual wear.',
    2500,
    'Men',
    'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80',
    5,
    4.8,
    'active',
    NOW()
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Floral Summer Dress',
    'Lightweight floral dress, size M. Great for sunny days.',
    1800,
    'Women',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    10,
    4.5,
    'active',
    NOW() - INTERVAL '1 day'
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Leather Boots',
    'Genuine leather boots, size 42. Slightly worn but very durable.',
    4500,
    'Men',
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80',
    2,
    4.9,
    'active',
    NOW() - INTERVAL '2 days'
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Kids Winter Jacket',
    'Warm padded jacket for children aged 5-7. Blue color.',
    1200,
    'Kids',
    'https://images.unsplash.com/photo-1519238263496-6343d7f501b0?auto=format&fit=crop&w=800&q=80',
    8,
    4.7,
    'active',
    NOW() - INTERVAL '3 days'
  ),
   (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Silk Scarf',
    'Elegant silk scarf with paisley pattern.',
    800,
    'Accessories',
    'https://images.unsplash.com/photo-1584030373081-f37b7bb4faae?auto=format&fit=crop&w=800&q=80',
    15,
    4.6,
    'active',
    NOW() - INTERVAL '4 days'
  );
