"use client"

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Cinematic Background */}
      <motion.div style={{ y, opacity, scale }} className="absolute inset-0 z-0">
        <Image
          src="/hero-luxury.png"
          alt="Adaze Luxury"
          fill
          className="object-cover opacity-60 brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#0A0A0A]"></div>
      </motion.div>

      {/* Content Overlay */}
      <div className="container relative z-10 px-6 pt-32">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <span className="text-[10px] font-bold tracking-[0.8em] uppercase text-accent/80">
              The Sovereign Collection // 2025
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.4 }}
            className="display-mega text-white mb-12 mix-blend-exclusion"
          >
            ADAZE.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="max-w-2xl mb-16"
          >
            <p className="text-sm md:text-base uppercase tracking-[0.4em] leading-relaxed text-white/50">
              Redefining the archive. <br />
              Africa&apos;s premier destination for curated luxury heritage.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col sm:flex-row gap-8 items-center"
          >
            <Button
              className="h-16 px-16 bg-white text-black hover:bg-accent hover:text-white border-none gold-glow"
              asChild
            >
              <Link href="/marketplace">
                EXPLORE ARCHIVE
              </Link>
            </Button>
            <button
              onClick={onGetStarted}
              className="text-[11px] font-bold tracking-[0.4em] uppercase text-white hover:text-accent transition-colors border-b border-white/20 pb-2"
            >
              OUR MISSION
            </button>
          </motion.div>
        </div>
      </div>

      {/* Editorial Decorative Elements */}
      <div className="absolute left-10 bottom-10 z-20 hidden md:block">
        <div className="flex flex-col gap-4 text-[9px] font-bold tracking-[0.5em] text-white/20 uppercase vertical-text">
          <span>Obsidian</span>
          <span>Heritage</span>
          <span>Curated</span>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30"
      >
        <div className="w-[1px] h-12 bg-white"></div>
      </motion.div>
    </section>
  );
}