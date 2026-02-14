
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
    router.push('/become-trader');
  };

  return (
    <div className="bg-background pt-24 pb-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative isolate overflow-hidden bg-background border border-border/50 py-24 px-12 lg:px-24">
          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-scanline opacity-[0.03] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative z-10 text-center space-y-12"
          >
            <div className="space-y-6">
              <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent">
                JOIN THE COLLECTIVE
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground uppercase leading-[0.9]">
                Ready to <span className="text-muted-foreground/30 italic">Ascend?</span>
              </h2>
              <p className="mt-8 text-xl text-muted-foreground/60 max-w-2xl mx-auto font-medium tracking-tight">
                Join Africa&apos;s premier curated fashion ecosystem. Discover the unique, manage your empire, and redefine your style.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Button
                size="lg"
                className="btn-premium h-16 px-12 text-[11px] font-black tracking-[0.3em] uppercase rounded-none w-full sm:w-auto"
                onClick={handleStartJourney}
              >
                Start Exploring
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-16 px-12 rounded-none border-border font-black text-[11px] tracking-[0.3em] uppercase hover:bg-muted/50 transition-all w-full sm:w-auto"
                onClick={handleBecomeTrader}
              >
                Become a Trader
              </Button>
            </div>
          </motion.div>

          {/* Background Text Decor */}
          <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 text-[25vw] font-black text-muted-foreground/5 leading-none select-none pointer-events-none uppercase tracking-tighter whitespace-nowrap">
            JOIN ADZE
          </div>

          {/* Geometric Accent */}
          <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-accent/20" />
          <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-accent/20" />
        </div>
      </div>
    </div>
  )
}
