-- Check if there are any products in the database
SELECT COUNT(*) as product_count FROM public.products;

-- If there are products, show the first 5
SELECT * FROM public.products LIMIT 5;

-- Check if there are any profiles in the database
SELECT COUNT(*) as profile_count FROM public.profiles;

-- If there are profiles, show the first 5
SELECT * FROM public.profiles LIMIT 5;