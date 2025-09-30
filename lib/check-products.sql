-- Check if there are any products in the database
SELECT COUNT(*) as product_count FROM public.products;

-- If there are products, show the first 5
SELECT * FROM public.products LIMIT 5;