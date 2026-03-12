"use client"

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { Search, ArrowRight, ShieldCheck, Globe, Cpu } from 'lucide-react';
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

  const y = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={containerRef} className="relative min-h-[115vh] flex items-center overflow-hidden bg-black selection:bg-accent selection:text-black">
      {/* 10000x Better Cinematic Background */}
      <motion.div style={{ y, opacity, scale }} className="absolute inset-0 z-0">
        <Image
          src="/hero-luxury.png"
          alt="Adaze Elite Architecture"
          fill
          className="object-cover opacity-50 brightness-[0.5] grayscale-[0.2]"
          priority
        />
        {/* Advanced Light Leak Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </motion.div>

      {/* Grid Pulse Overlay */}
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      {/* Strategic Content Layout */}
      <div className="container relative z-10 px-6 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-10">
            {/* HUD Status Line */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-6"
            >
              <div className="flex items-center gap-3 glass-morphism px-5 py-2 rounded-full border-white/10 group">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/50 group-hover:text-accent transition-colors">Establishing Link... Node.KE</span>
              </div>
              <div className="h-[1px] w-20 bg-white/10" />
            </motion.div>

            {/* Monolithic Typography */}
            <div className="relative group">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                <h1 className="text-8xl md:text-[12vw] font-black tracking-tighter uppercase leading-[0.8] text-white">
                  Elite <br />
                  <span className="text-muted-foreground/10 italic text-fill-transparent text-stroke-white">Culture.</span>
                </h1>
              </motion.div>
              {/* Background Glow */}
              <div className="absolute -inset-20 bg-accent/5 blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="max-w-2xl text-xl md:text-2xl text-white/30 font-black tracking-tight leading-none uppercase italic"
            >
              The most sophisticated archive of authenticated <br /> premium heritage assets in East Africa.
            </motion.p>

            {/* Neural Search Bridge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex flex-col md:flex-row gap-12 items-start md:items-end mt-12"
            >
               <div className="relative group w-full max-w-2xl">
                 <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-white/10 group-focus-within:bg-accent transition-colors" />
                 <div className="flex items-center gap-6 py-6">
                   <Search className="h-5 w-5 text-white/20 group-focus-within:text-accent transition-colors" />
                   <Input 
                      placeholder="INITIATE DISCOVERY SCAN..."
                      className="bg-transparent border-0 h-12 text-sm font-black tracking-[0.3em] uppercase text-white placeholder:text-white/10 focus-visible:ring-0"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/marketplace?search=${searchQuery}`)}
                   />
                 </div>
               </div>

               <Button
                 className="h-20 px-16 btn-luxury rounded-none text-[11px] group"
                 asChild
               >
                 <Link href="/marketplace">
                   Enter Archive <ArrowRight className="ml-4 h-4 w-4 transition-transform group-hover:translate-x-3" />
                 </Link>
               </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sidebar Command Bar */}
      <div className="absolute left-10 bottom-10 z-20 flex items-center gap-10 vertical-text opacity-20">
          <div className="flex gap-4">
              <ShieldCheck className="h-5 w-5 text-accent rotate-90" />
              <Globe className="h-5 w-5 text-white rotate-90" />
              <Cpu className="h-5 w-5 text-white rotate-90" />
          </div>
          <div className="h-20 w-[1px] bg-white/10" />
          <span className="text-[10px] font-black tracking-[0.5em] uppercase text-white">Autonomous Sync Active</span>
      </div>

      {/* Right Scroll Indicator */}
      <div className="absolute right-10 bottom-10 z-20 flex flex-col items-center gap-10 opacity-20">
         <div className="text-[10px] font-black tracking-[0.5em] uppercase text-white vertical-text">Scroll to Curate</div>
         <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-[1px] h-20 bg-gradient-to-t from-accent to-transparent" 
         />
      </div>
    </section>
  );
}