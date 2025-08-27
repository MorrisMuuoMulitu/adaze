"use client";

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { FeaturedProducts } from '@/components/sections/featured-products';

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('MarketplacePage: useEffect triggered');
    const fetchProducts = async () => {
      console.log('MarketplacePage: Starting fetch products');
      try {
        const response = await fetch('/api/products');
        console.log('MarketplacePage: API response received', response.status, response.statusText);
        
        if (!response.ok) {
          const errorMsg = `Failed to fetch products: ${response.status} ${response.statusText}`;
          console.error('MarketplacePage: API error', errorMsg);
          throw new Error(errorMsg);
        }
        
        const data: Product[] = await response.json();
        console.log('MarketplacePage: Products data received', data.length, 'products');
        setProducts(data);
      } catch (err: unknown) {
        console.error('MarketplacePage: Error fetching products', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        console.log('MarketplacePage: Fetch completed, setting loading to false');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  console.log('MarketplacePage: Rendering component', { loading, error, productsCount: products.length });

  if (loading) {
    console.log('MarketplacePage: Rendering loading state');
    return <div>Loading...</div>;
  }

  if (error) {
    console.log('MarketplacePage: Rendering error state', error);
    return <div>Error: {error}</div>;
  }

  console.log('MarketplacePage: Rendering FeaturedProducts with', products.length, 'products');
  return <FeaturedProducts products={products} loading={loading} error={error} />;
}
