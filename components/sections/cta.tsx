
"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export function CTA() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative isolate overflow-hidden bg-primary-foreground px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left"
          >
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to Transform Your Wardrobe?
            </h2>
            <p className="mt-6 text-lg leading-8 text-primary-foreground/80">
              Join Africa&apos;s premier mitumba marketplace. Discover unique fashion, connect with trusted traders, and enjoy seamless delivery.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <Button size="lg" className="african-gradient text-white hover:opacity-90 transition-all duration-300">Start Your Journey</Button>
              <Button variant="outline" size="lg" className="hover:bg-muted/50 transition-colors">Explore Features &rarr;</Button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative mt-16 h-80 lg:mt-8"
          >
            <Image
              className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
              src="/placeholder-app-screenshot.png"
              alt="App screenshot"
              width={1824}
              height={1080}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
