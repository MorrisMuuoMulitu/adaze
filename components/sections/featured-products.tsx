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
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-left mb-16">
            <div className="h-4 w-32 bg-muted animate-pulse mb-4" />
            <div className="h-12 w-96 bg-muted animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-32 bg-background border-t border-border/50 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-4">
              EDITORIAL CHOICE
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
              The <span className="text-muted-foreground/30">Edit.</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground font-medium uppercase tracking-widest">
              A curated selection of the season&apos;s most defining pieces.
            </p>
          </motion.div>

          <Button
            asChild
            className="btn-premium h-14 px-10 rounded-none text-[10px] font-black tracking-widest uppercase hidden md:flex"
          >
            <Link href="/marketplace">VIEW ALL PIECES</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </div>

        <div className="mt-16 md:hidden">
          <Button
            asChild
            className="btn-premium w-full h-14 rounded-none text-[10px] font-black tracking-widest uppercase"
          >
            <Link href="/marketplace">VIEW ALL PIECES</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}