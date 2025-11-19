"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ProductCard } from '@/components/products/product-card';
import { ProductSkeleton } from '@/components/products/product-skeleton';

interface DBProduct {
  id: string;
  trader_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  stock_quantity: number;
  rating: number;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
}

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // Fetch only FEATURED products that are ACTIVE
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            trader:profiles!trader_id (
              is_suspended
            )
          `)
          .eq('status', 'active')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(4); // Limit to 4 as requested

        if (error) throw error;

        // Filter out products from suspended traders
        const activeProducts = (data || []).filter(
          (product: any) => !product.trader?.is_suspended
        );

        setFeaturedProducts(activeProducts);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Featured Products
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hand-picked selections just for you
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || featuredProducts.length === 0) {
    return null; // Don't show section if error or no products
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Featured Products
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hand-picked selections just for you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link href="/marketplace">
              <Package className="h-5 w-5 mr-2" />
              Browse All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}