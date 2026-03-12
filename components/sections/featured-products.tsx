"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProductCard } from '@/components/products/product-card';
import { ProductSkeleton } from '@/components/products/product-skeleton';

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products?featured=true&limit=4');
        if (!res.ok) throw new Error('Failed to fetch featured products');
        const data = await res.json();
        setFeaturedProducts(data);
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
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
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
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col mb-24 items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-foreground/40 mb-6 block">
              Selection / 01
            </span>
            <h2 className="text-4xl md:text-6xl mb-8">
              THE CURATED <br /> EDIT.
            </h2>
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">
              A selection of premium pre-loved pieces, verified for quality and heritage.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </div>

        <div className="mt-24 flex justify-center">
          <Button
            asChild
            variant="outline"
            className="h-14 px-12 group"
          >
            <Link href="/marketplace">
              VIEW THE FULL COLLECTION
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
