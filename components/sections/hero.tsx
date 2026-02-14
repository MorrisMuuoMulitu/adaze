"use client"

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, TrendingUp, Shield, Zap, Users, Package, Star } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface HeroProps {
  onGetStarted: () => void;
}

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export function Hero({ onGetStarted }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-fashion-bg.jpg"
          alt="Premium Fashion"
          fill
          className="object-cover opacity-10 grayscale hover:grayscale-0 transition-all duration-1000"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>

        {/* Animated Scanline for Tech Feel */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
          <div className="w-full h-[2px] bg-primary animate-[scanline_4s_linear_infinite]"></div>
        </div>
      </div>

      <motion.div
        style={{ y, opacity }}
        className="container relative z-10 px-4 pt-20"
      >
        <div className="flex flex-col items-center text-center">
          {/* Release Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Badge variant="outline" className="px-4 py-1.5 border-accent/30 text-accent font-bold tracking-widest uppercase text-[10px] bg-accent/5 backdrop-blur-md">
              New Era of Marketplace • V 2.0
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="display-large mb-8"
          >
            <span className="block text-foreground">REDEFINE</span>
            <span className="text-gradient">THRIFT.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl text-xl md:text-2xl text-muted-foreground font-medium mb-12 leading-relaxed"
          >
            Africa&apos;s most curated destination for <span className="text-foreground">premium pre-loved</span> fashion.
            Verified authenticity, seamless logistics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Button
              size="lg"
              className="h-16 px-12 text-lg btn-premium rounded-none"
              asChild
            >
              <Link href="/marketplace">
                EXPLORE COLLECTION
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onGetStarted}
              className="h-16 px-12 text-lg font-bold border-2 hover:bg-foreground hover:text-background rounded-none transition-colors"
            >
              MEMBERSHIP
            </Button>
          </motion.div>

          {/* Stat Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-border/50 pt-12 w-full max-w-5xl"
          >
            {[
              { label: 'Active Sellers', value: 15.2, suffix: 'K+' },
              { label: 'Total Volume', value: 850, suffix: 'M+' },
              { label: 'Authenticated', value: 100, suffix: '%' },
              { label: 'Global Reach', value: 12, suffix: 'CTY' },
            ].map((stat, i) => (
              <div key={i} className="text-left group">
                <div className="text-2xl font-black mb-1 flex items-baseline">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold group-hover:text-accent transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Corporate Trust Scroll */}
      <div className="absolute bottom-10 left-0 w-full overflow-hidden whitespace-nowrap opacity-10 pointer-events-none">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="text-4xl font-black tracking-tighter"
        >
          {Array(10).fill('ADAZE CONNECT • QUALITY ASSURED • SECURE LOGISTICS • VERIFIED SELLERS • ').join('')}
        </motion.div>
      </div>

      {/* Geometric Decorative Elements */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 hidden lg:block opacity-20">
        <div className="w-[1px] h-64 bg-gradient-to-b from-transparent via-accent to-transparent"></div>
      </div>
      <div className="absolute top-1/2 right-10 -translate-y-1/2 hidden lg:block opacity-20">
        <div className="w-[1px] h-64 bg-gradient-to-b from-transparent via-accent to-transparent"></div>
      </div>
    </section>
  );
}