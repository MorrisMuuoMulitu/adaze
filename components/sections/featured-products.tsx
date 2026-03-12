"use client";

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProductCard } from '@/components/products/product-card';
import { ProductSkeleton } from '@/components/products/product-skeleton';
import { useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
    layoutEffect: false
  });

  const xOffset = useTransform(scrollYProgress, [0, 1], [0, -200]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products?featured=true&limit=6');
        if (!res.ok) throw new Error('Heritage Archive temporarily unavailable');
        const data = await res.json();
        setFeaturedProducts(data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-32 bg-background overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[...Array(3)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative py-40 bg-[#050505] overflow-hidden">
      {/* Editorial Decorative Background */}
      <motion.div 
        style={{ x: xOffset }}
        className="absolute top-20 left-0 whitespace-nowrap pointer-events-none select-none"
      >
        <span className="text-[20vw] font-black text-white/[0.02] tracking-tighter uppercase leading-none">
          Archive // Heritage // Legacy // Curated
        </span>
      </motion.div>

      <div className="container relative z-10 px-6 mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-32 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-8">
               <div className="w-10 h-[1px] bg-accent"></div>
               <span className="text-[10px] font-black tracking-[0.6em] uppercase text-accent">Curated Selection / 001</span>
            </div>
            <h2 className="text-6xl md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] mb-12">
              The <span className="text-muted-foreground/20 italic">Elite</span> <br /> 
              Archive<span className="text-accent">.</span>
            </h2>
          </motion.div>

          <Button
            asChild
            className="h-20 px-16 btn-luxury text-[11px] group"
          >
            <Link href="/marketplace">
              Explore All <ArrowRight className="ml-4 h-4 w-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Masonry-Style Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {Array.isArray(featuredProducts) && featuredProducts.slice(0, 4).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`${
                index === 0 ? 'md:col-span-8 md:aspect-[16/9]' :
                index === 1 ? 'md:col-span-4 md:aspect-[3/4]' :
                index === 2 ? 'md:col-span-4 translate-y-20' :
                'md:col-span-8'
              }`}
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Aesthetic Floating Elements */}
      <div className="absolute left-10 bottom-40 z-20 pointer-events-none opacity-20">
         <Sparkles className="h-6 w-6 text-accent animate-pulse" />
      </div>
    </section>
  );
}
