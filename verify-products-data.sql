-- Verify Product Data and RLS
-- Run this in the Supabase SQL Editor

-- 1. Check total count of products
SELECT count(*) as total_products FROM products;

-- 2. Check count of active products
SELECT count(*) as active_products FROM products WHERE status = 'active';

-- 3. Check a sample product to see its structure
SELECT id, name, status, trader_id, price FROM products LIMIT 5;

-- 4. Check if the trader for the sample product exists and is not suspended
SELECT p.id as product_id, p.name, pr.id as trader_id, pr.is_suspended, pr.role
FROM products p
LEFT JOIN profiles pr ON p.trader_id = pr.id
LIMIT 5;

-- 5. Check RLS policies on products table
SELECT * FROM pg_policies WHERE tablename = 'products';
