"use client";

import { useEffect, useState, useMemo } from 'react';
import { Product as DBProduct } from '@/lib/productService';
import { ProductCard } from '@/components/products/product-card';
import { ProductSkeleton } from '@/components/products/product-skeleton';
import { AdvancedFilters, FilterOptions } from '@/components/marketplace/advanced-filters';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function MarketplacePage() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get max price from products
  const maxPrice = useMemo(() => {
    return products.length > 0
      ? Math.max(...products.map(p => p.price))
      : 10000;
  }, [products]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats).sort();
  }, [products]);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 10000],
    sortBy: 'newest',
    availability: 'all',
  });

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

  // Update price range when products load
  useEffect(() => {
    if (products.length > 0 && filters.priceRange[1] === 10000) {
      setFilters(prev => ({
        ...prev,
        priceRange: [0, maxPrice],
      }));
    }
  }, [maxPrice, products.length, filters.priceRange]);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Price filter
    filtered = filtered.filter(
      p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter(p => p.rating >= filters.minRating!);
    }

    // Availability filter
    if (filters.availability === 'in_stock') {
      filtered = filtered.filter(p => p.stock_quantity > 0);
    } else if (filters.availability === 'low_stock') {
      filtered = filtered.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10);
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        // Sort by review count if available, otherwise by rating
        filtered.sort((a, b) => {
          const aPopularity = (a.review_count || 0) * a.rating;
          const bPopularity = (b.review_count || 0) * b.rating;
          return bPopularity - aPopularity;
        });
        break;
      case 'newest':
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return filtered;
  }, [products, filters]);

  console.log('MarketplacePage: Rendering component', {
    loading,
    error,
    productsCount: products.length,
    filteredCount: filteredProducts.length
  });

  if (loading) {
    console.log('MarketplacePage: Rendering loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('MarketplacePage: Rendering error state', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  console.log('MarketplacePage: Rendering with filters and products');
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} product{filteredProducts.length !== 1 && 's'} found
            </p>
          </div>
          <Link href="/" passHref>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
            maxPrice={maxPrice}
          />
        </div>

        {/* Products */}
        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div key={product.id}>
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
