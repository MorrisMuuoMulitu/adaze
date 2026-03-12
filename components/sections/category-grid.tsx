"use client"

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const categories = [
  {
    name: 'WOMEN',
    href: '/marketplace?category=WOMEN',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&h=800&auto=format&fit=crop',
    span: 'col-span-1 md:col-span-1'
  },
  {
    name: 'MEN',
    href: '/marketplace?category=MEN',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600&h=800&auto=format&fit=crop',
    span: 'col-span-1 md:col-span-1'
  },
  {
    name: 'HERITAGE',
    href: '/marketplace?category=HERITAGE',
    image: 'https://images.unsplash.com/photo-1523461777212-f8d380abc403?q=80&w=800&h=600&auto=format&fit=crop',
    span: 'col-span-1 md:col-span-2'
  },
  {
    name: 'ACCESSORIES',
    href: '/marketplace?category=ACCESSORIES',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&h=600&auto=format&fit=crop',
    span: 'col-span-1 md:col-span-2'
  }
];

export function CategoryGrid() {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="max-w-xl"
            >
                <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-4">Discovery</div>
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                    Browse the <span className="text-muted-foreground/30 italic">Archive.</span>
                </h2>
            </motion.div>
            <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/40 max-w-[200px] text-right"
            >
                SYCHRONIZED CATEGORIES FOR GLOBAL CURATION
            </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <Link 
                key={cat.name} 
                href={cat.href}
                className={`group relative overflow-hidden bg-muted aspect-[4/5] ${cat.span === 'col-span-1 md:col-span-2' ? 'lg:aspect-[16/9]' : ''}`}
            >
              <Image 
                src={cat.image} 
                alt={cat.name} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0 brightness-[0.7]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
              
              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-[10px] font-black tracking-[0.3em] uppercase text-accent mb-2">Category</div>
                        <h3 className="text-4xl font-black uppercase text-white tracking-tighter">{cat.name}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-500">
                        <ArrowUpRight className="h-5 w-5 text-white group-hover:text-black transition-colors" />
                    </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
