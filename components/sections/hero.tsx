"use client"

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/language-provider';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  MapPin,
  Star,
  Shield,
  Zap,
  Sparkles,
  Truck,
  CheckCircle,
  Crown,
  Rocket,
  Heart,
  Globe
} from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const stats = [
    { icon: Users, value: "10K+", label: "Active Users" },
    { icon: ShoppingBag, value: "50K+", label: "Products Listed" },
    { icon: Star, value: "4.9", label: "Average Rating" },
    { icon: Truck, value: "24/7", label: "Fast Delivery" }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/20 min-h-screen flex items-center pt-20 pb-16">
      {/* Epic Animated background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-10 -left-20 w-96 h-96 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-40 -right-20 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/30 via-cyan-500/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 left-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-green-500/20 via-emerald-500/15 to-transparent rounded-full blur-3xl"
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 relative z-10">
        <div className="flex flex-col items-center text-center"> {/* New wrapper for centering */}
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} // Changed x to y for vertical animation
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 sm:space-y-8 max-w-3xl mx-auto" // Added max-width and mx-auto for centering
          >
            <div className="space-y-4 sm:space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2"
              >
                <Badge className="african-gradient text-white border-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium w-fit">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  🇰🇪 Kenya&apos;s Premier Mitumba Marketplace
                </Badge>
                <div className="flex items-center space-x-1">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Live Now</span>
                </div>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight"
              >
                <span className="block">Your Style, Your Impact:</span>
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse-glow">
                  Discover Quality Mitumba Fashion
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl"
              >
                Find unique pre-loved fashion from trusted traders across all 47 counties in Kenya. Start your sustainable journey today.
              </motion.p>

              {/* Feature highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
              >
                {[
                  { icon: Zap, text: "Same-Day Delivery", color: "text-yellow-500" },
                  { icon: ShoppingBag, text: "Quality Verified", color: "text-green-500" },
                  { icon: Truck, text: "Kenya-Wide", color: "text-blue-500" },
                  { text: "👦 Boys Fashion", color: "boys-enhanced", isGender: true },
                  { text: "👧 Girls Fashion", color: "girls-enhanced", isGender: true }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`flex items-center space-x-2 p-2 sm:p-3 rounded-lg backdrop-blur-sm ${
                      feature.isGender 
                        ? `col-span-1 ${feature.color} gender-text-enhanced` 
                        : 'bg-muted/50'
                    }`}
                  >
                    {feature.icon && <feature.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${feature.color}`} />}
                    <span className={`text-xs sm:text-sm font-medium ${feature.isGender ? 'gender-text-enhanced' : ''}`}>
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="african-gradient text-white hover:opacity-90 transition-all duration-300 group text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-auto mobile-button"
                aria-label="Start shopping - Sign up or login"
              >
                Start Shopping in Kenya
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="group text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-auto border-2 hover:bg-muted/50 mobile-button"
                onClick={onGetStarted}
                aria-label="Browse products - Sign up or login required"
              >
                Browse Products
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 sm:pt-8 border-t border-border/50"
            >
              {[
                { value: "15K+", label: "Active Traders in Kenya" },
                { value: "80K+", label: "Products Available" },
                { value: "47", label: "Counties Covered" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          
        </div>
      </div>
    </section>
  );
}