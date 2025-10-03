
"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-provider'
import { useRouter } from 'next/navigation'

interface CTAProps {
  onAuthClick?: () => void;
}

export function CTA({ onAuthClick }: CTAProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleStartJourney = () => {
    if (user) {
      router.push('/marketplace');
    } else {
      onAuthClick?.();
    }
  };

  const handleBecomeTrader = () => {
    if (user) {
      router.push('/products/add');
    } else {
      onAuthClick?.();
    }
  };

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 sm:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto text-center lg:py-32"
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ready to Transform Your Wardrobe?
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/90">
              Join Africa&apos;s premier mitumba marketplace. Discover unique fashion, connect with trusted traders, and enjoy seamless delivery.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                onClick={handleStartJourney}
                aria-label="Start your shopping journey"
              >
                Start Shopping Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-white border-white hover:bg-white/10 transition-colors"
                onClick={handleBecomeTrader}
                aria-label="Become a trader - sign up required"
              >
                Become a Trader &rarr;
              </Button>
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  )
}
