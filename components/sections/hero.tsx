"use client"

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/language-provider';
import { ArrowRight, Play, ShoppingBag, Users, Truck, Sparkles, Zap, MapPin } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-background min-h-screen flex items-center">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            y: ["-15%", "15%", "-15%"], // More vertical movement
            x: ["-10%", "10%", "-10%"], // More horizontal movement
            rotate: [0, 360],
            scale: [1, 1.2, 1], // Add subtle scaling
          }}
          transition={{
            duration: 15, // Slower animation
            repeat: Infinity,
            ease: "easeInOut", // Smoother easing
          }}
          className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/15 rounded-full blur-3xl" // Slightly more opaque primary color
        ></motion.div>
        <motion.div
          animate={{
            y: ["15%", "-15%", "15%"], // More vertical movement
            x: ["10%", "-10%", "10%"], // More horizontal movement
            rotate: [360, 0],
            scale: [1, 0.8, 1], // Add subtle scaling
          }}
          transition={{
            duration: 18, // Slower animation
            repeat: Infinity,
            ease: "easeInOut", // Smoother easing
            delay: 3, // Slightly increased delay
          }}
          className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-accent/15 rounded-full blur-3xl" // Slightly more opaque accent color
        ></motion.div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10"> {/* Reduced opacity for subtlety */}
        {/* Consider adding a subtle pattern image here, e.g., bg-[url('/patterns/subtle-pattern.png')] bg-repeat */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-background/50 via-transparent to-transparent"></div> {/* Subtle radial gradient overlay */}
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
              >
                Start Shopping in Kenya
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="group text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-auto border-2 hover:bg-muted/50 mobile-button"
              >
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
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