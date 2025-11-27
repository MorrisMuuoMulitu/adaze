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
      <section className="py-20 bg-gradient-to-b from-muted/30 via-background to-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb10_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb10_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4"
            >
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Curated Collection</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Featured Products
            </h2>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Hand-picked selections just for you
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
    <section className="py-20 bg-gradient-to-b from-muted/30 via-background to-muted/20 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb10_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb10_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Subtle gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-4 shadow-lg backdrop-blur-sm"
          >
            <Package className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Curated Collection
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6"
          >
            Featured Products
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium"
          >
            Hand-picked selections just for you
          </motion.p>
        </div>

        {/* Enhanced Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </div>

        {/* Enhanced CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              asChild
              className="h-14 px-10 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
            >
              <Link href="/marketplace">
                <Package className="h-5 w-5 mr-2" />
                Browse All Products
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}