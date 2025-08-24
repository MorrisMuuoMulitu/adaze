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
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 min-h-screen flex items-center">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 sm:space-y-8"
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
                <span className="block">Discover Quality</span>
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse-glow">
                  Mitumba Fashion
                </span>
                <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-muted-foreground mt-2">
                  Across Kenya
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl"
              >
                Connect with trusted traders, find unique pieces, and enjoy seamless delivery across all 47 counties in Kenya. Your sustainable fashion journey starts here.
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

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mt-8 lg:mt-0"
          >
            <div className="relative z-10">
              {/* Main showcase card */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-card/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-border/50 hover-lift"
              >
                <div className="aspect-square bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/90 dark:bg-black/90 rounded-full p-2 sm:p-3">
                    <ShoppingBag className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 space-y-2">
                    <Badge className="bg-green-500 text-white text-xs">
                      Quality Verified ✓
                    </Badge>
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      Kenya Delivery 🇰🇪
                    </Badge>
                  </div>
                  
                  {/* Floating elements */}
                  <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-primary to-accent rounded-full opacity-20"></div>
                  </motion.div>
                </div>
                
                <h3 className="font-bold text-lg sm:text-xl mb-2">Premium Denim Collection</h3>
                <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                  Authentic vintage jeans from Europe
                </p>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xl sm:text-2xl font-bold text-primary">KSh 1,200</span>
                    <div className="text-xs sm:text-sm text-muted-foreground line-through">KSh 2,400</div>
                  </div>
                  <Button className="african-gradient text-white mobile-button">
                    Add to Cart
                  </Button>
                </div>
              </motion.div>

              {/* Floating elements */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 bg-accent rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl glass-effect"
              >
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                <div className="text-white text-xs sm:text-sm font-medium mt-1">15K+ Kenyans</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-primary rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl glass-effect"
              >
                <Truck className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                <div className="text-white text-xs sm:text-sm font-medium mt-1">Kenya-Wide</div>
              </motion.div>

              {/* Notification popup */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg text-xs sm:text-sm font-medium"
              >
                🎉 Order from Nairobi!
              </motion.div>
            </div>

            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl sm:rounded-3xl blur-3xl -z-10 scale-110"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}