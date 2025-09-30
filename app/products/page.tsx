"use client";

import { useEffect, useState } from 'react';
import { Product as DBProduct } from '@/lib/productService';
import { FeaturedProducts } from '@/components/sections/featured-products';
import Link from 'next/link'; // Import Link for navigation
import { Button } from '@/components/ui/button'; // Import styled Button
import { ArrowLeft } from 'lucide-react'; // Import arrow icon

export default function MarketplacePage() {
  const [products, setProducts] = useState<DBProduct[]>([]);
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
        
        const data: DBProduct[] = await response.json();
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
  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10">
        <Link href="/" passHref>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      <FeaturedProducts products={products} loading={loading} error={error} />
    </div>
  );
}
