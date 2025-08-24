
"use client"

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

const features = [
  {
    name: 'Vast Selection',
    description: 'Explore thousands of unique items from traders across the continent, updated daily.',
  },
  {
    name: 'Secure Payments',
    description: 'Our escrow system ensures your money is safe until you confirm receipt of your order.',
  },
  {
    name: 'Real-Time Tracking',
    description: 'Follow your package from the trader to your doorstep with our integrated logistics.',
  },
  {
    name: 'Community Trust',
    description: 'Buy and sell with confidence using our transparent seller and transporter rating system.',
  },
]

export function WhyChooseUs() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Why ADAZE?</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to trade mitumba with confidence
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We have built a comprehensive ecosystem for second-hand fashion in Africa. Whether you are a buyer, trader, or transporter, ADAZE has you covered.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative pl-16"
              >
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">{feature.description}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
