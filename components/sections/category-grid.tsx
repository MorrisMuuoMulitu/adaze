"use client"

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Diamond } from 'lucide-react';

const categories = [
  {
    name: 'WOMEN',
    href: '/marketplace?category=WOMEN',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&h=800&auto=format&fit=crop',
    tag: 'RTW // ELITE'
  },
  {
    name: 'MEN',
    href: '/marketplace?category=MEN',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600&h=800&auto=format&fit=crop',
    tag: 'SARTORIAL // NODE'
  },
  {
    name: 'HERITAGE',
    href: '/marketplace?category=HERITAGE',
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800&h=600&auto=format&fit=crop',
    tag: 'ARCHIVE // 001'
  }
];

export function CategoryGrid() {
  return (
    <section className="py-40 bg-black">
      <div className="container mx-auto px-6">
        <div className="flex flex-col gap-10 mb-32">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex items-center gap-6"
            >
                <Diamond className="h-6 w-6 text-accent animate-spin-slow" />
                <span className="text-[11px] font-black tracking-[0.8em] uppercase text-accent">Global Departments</span>
            </motion.div>
            
            <h2 className="text-7xl md:text-[10vw] font-black uppercase tracking-tighter leading-[0.8]">
              Portal <br /> 
              <span className="text-muted-foreground/10 italic">Discovery.</span>
            </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
          {categories.map((cat, i) => (
            <Link 
                key={cat.name} 
                href={cat.href}
                className="group relative overflow-hidden aspect-[3/4] bg-[#050505]"
            >
              <Image 
                src={cat.image} 
                alt={cat.name} 
                fill 
                className="object-cover transition-all duration-1000 group-hover:scale-105 group-hover:rotate-1 grayscale group-hover:grayscale-0 brightness-[0.5] group-hover:brightness-100"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              
              {/* Overlay Matrix */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700" />
              <div className="absolute inset-0 border border-white/5 group-hover:border-accent/50 transition-colors duration-700" />

              <div className="absolute inset-0 p-12 flex flex-col justify-between">
                <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <span className="text-[9px] font-black tracking-[0.4em] uppercase text-accent">{cat.tag}</span>
                    <span className="text-[9px] font-mono text-white/40">NODE-LV-{i+1}</span>
                </div>

                <div>
                    <div className="overflow-hidden mb-4">
                        <motion.h3 className="text-6xl font-black uppercase text-white tracking-tighter group-hover:text-accent transition-colors duration-500">
                            {cat.name}
                        </motion.h3>
                    </div>
                    <div className="flex items-center gap-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
                        <div className="h-[1px] flex-1 bg-accent/30" />
                        <ArrowUpRight className="h-5 w-5 text-accent" />
                    </div>
                </div>
              </div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 pointer-events-none" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
