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

  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-background pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Cinematic Background Image with Overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-fashion-bg.jpg"
          alt="Premium Fashion Background"
          fill
          className="object-cover opacity-20 dark:opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10"></div>

        {/* Animated Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-[120px] opacity-50"
        ></motion.div>
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-accent/25 to-primary/25 rounded-full blur-[120px] opacity-50"
        ></motion.div>
      </div>

      <motion.div
        style={{ y, opacity }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Enhanced Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 200
            }}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-gradient-to-r from-primary/15 to-accent/15 backdrop-blur-sm border border-primary/30 rounded-full shadow-lg"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <TrendingUp className="h-4 w-4 text-primary" />
            </motion.div>
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Kenya&apos;s Premier Mitumba Marketplace
            </span>
          </motion.div>

          {/* Enhanced Headline with Gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]"
          >
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              Buy & Sell
            </span>
            <span className="block mt-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Quality Preloved Fashion
            </span>
          </motion.h1>

          {/* Enhanced Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-xl md:text-2xl text-muted-foreground/90 mb-10 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Trusted by <span className="text-primary font-bold">thousands</span> across Kenya.
            Authentic items, verified sellers, secure payments.
          </motion.p>

          {/* Enhanced CTA Buttons with Micro-interactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                asChild
                className="h-14 px-10 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold shadow-2xl hover:shadow-primary/50 transition-all duration-300 text-base group"
              >
                <Link href="/marketplace">
                  Browse Products
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="ml-2"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={onGetStarted}
                className="h-14 px-10 border-2 border-primary/40 font-bold text-base hover:bg-primary/10 hover:border-primary transition-all duration-300"
              >
                Get Started
              </Button>
            </motion.div>
          </motion.div>

          {/* Dynamic Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-6 md:gap-12 mb-10 max-w-3xl mx-auto"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/10 shadow-lg"
            >
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-primary mr-2" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                <AnimatedCounter end={15000} suffix="+" />
              </div>
              <div className="text-xs md:text-sm text-muted-foreground font-medium">Active Users</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-accent/10 shadow-lg"
            >
              <div className="flex items-center justify-center mb-2">
                <Package className="h-5 w-5 text-accent mr-2" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-accent mb-1">
                <AnimatedCounter end={50000} suffix="+" />
              </div>
              <div className="text-xs md:text-sm text-muted-foreground font-medium">Products Listed</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/10 shadow-lg"
            >
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-primary mr-2 fill-primary" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                4.8
                <span className="text-base text-muted-foreground">/5</span>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground font-medium">User Rating</div>
            </motion.div>
          </motion.div>

          {/* Enhanced Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/60 backdrop-blur-sm border border-primary/20"
            >
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Verified Sellers</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/60 backdrop-blur-sm border border-accent/20"
            >
              <Zap className="h-5 w-5 text-accent" />
              <span className="font-semibold text-foreground">Fast Delivery</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/60 backdrop-blur-sm border border-primary/20"
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Secure Payments</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}