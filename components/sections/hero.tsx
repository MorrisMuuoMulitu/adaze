"use client"

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-[100vh] flex items-center overflow-hidden bg-black">
      {/* Immersive Background */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <Image
          src="/hero-luxury.png"
          alt="Adaze Luxury"
          fill
          className="object-cover opacity-60 brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </motion.div>

      {/* Main Narrative */}
      <div className="container relative z-10 px-6">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-[10px] font-black tracking-[0.8em] uppercase text-accent mb-8">
              The Obsidian Archive
            </div>
            
            <h1 className="text-7xl md:text-[10vw] font-black tracking-tighter uppercase leading-[0.85] text-white mb-12">
              Heritage <br />
              <span className="text-muted-foreground/20 italic">Redefined.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/40 font-medium tracking-tight max-w-xl mb-16 leading-relaxed uppercase">
              Kenya&apos;s most exclusive collective of authenticated premium fashion. 
              Curated for the few.
            </p>
          </motion.div>

          {/* Minimalist Search Bridge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-8 items-start md:items-center"
          >
            <div className="relative group w-full max-w-md">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-accent transition-colors" />
              <Input 
                placeholder="DISCOVER THE ARCHIVE..."
                className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 pl-8 text-[11px] font-black tracking-[0.2em] uppercase text-white placeholder:text-white/10 focus-visible:ring-0 focus-visible:border-accent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/marketplace?search=${searchQuery}`)}
              />
            </div>

            <Button
              className="h-14 px-10 bg-accent text-accent-foreground hover:bg-white hover:text-black rounded-none text-[10px] font-black tracking-[0.4em] uppercase group"
              asChild
            >
              <Link href="/marketplace">
                ENTER <ArrowRight className="ml-3 h-3 w-3 transition-transform group-hover:translate-x-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Aesthetic Accents */}
      <div className="absolute right-10 bottom-10 z-20 flex flex-col items-end gap-4 opacity-20 hidden lg:flex">
          <div className="text-[9px] font-black tracking-[0.5em] uppercase text-white vertical-text">
            Nairobi // Node 001
          </div>
          <div className="h-32 w-[1px] bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Decorative Navigation Labels */}
      <div className="absolute left-10 bottom-10 z-20 hidden md:block">
        <div className="flex flex-col gap-6 text-[9px] font-black tracking-[0.5em] text-white/10 uppercase vertical-text">
          <span>Obsidian</span>
          <span className="text-accent/40 text-reveal">Heritage</span>
          <span>Curated</span>
        </div>
      </div>
    </section>
  );
}