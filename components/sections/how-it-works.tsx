"use client"

import { motion } from 'framer-motion';
import { Search, ShoppingCart, Truck, Star, UserPlus, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up & Choose Role',
    description: 'Register as a Buyer, Trader, or Transporter. Set up your profile and start your journey.',
    color: 'from-blue-500 to-purple-500'
  },
  {
    icon: Search,
    title: 'Browse & Discover',
    description: 'Search through thousands of quality second-hand items. Filter by size, condition, location, and price.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: ShoppingCart,
    title: 'Secure Purchase',
    description: 'Add items to cart and checkout with multiple payment options including M-Pesa, Stripe, and PayPal.',
    color: 'from-pink-500 to-red-500'
  },
  {
    icon: Package,
    title: 'Order Processing',
    description: 'Sellers prepare and package your items. Get real-time updates on order status.',
    color: 'from-red-500 to-orange-500'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Our verified transporters ensure safe and timely delivery to your doorstep with tracking.',
    color: 'from-orange-500 to-yellow-500'
  },
  {
    icon: Star,
    title: 'Rate & Review',
    description: 'Share your experience and help build trust in our community. Rate products and service.',
    color: 'from-yellow-500 to-green-500'
  }
];

export function HowItWorks() {
  const router = useRouter();

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-background border-y border-border/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20"
        >
          <div className="max-w-2xl">
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-6">
              THE EXPERIENCE
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
              How it <span className="text-muted-foreground/30 italic">Works.</span>
            </h2>
          </div>
          <p className="text-lg text-muted-foreground/60 max-w-md font-medium tracking-tight">
            From discovery to worldwide delivery, we have refined every touchpoint of your fashion journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50 border border-border/50">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background p-12 space-y-8 hover:bg-muted/5 transition-colors group relative overflow-hidden"
            >
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-scanline opacity-[0.02] pointer-events-none" />

              <div className="relative z-10 space-y-12">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 border border-border flex items-center justify-center transition-colors group-hover:border-accent group-hover:bg-accent/5">
                    <step.icon className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-4xl font-black font-mono opacity-5 text-foreground group-hover:opacity-10 transition-opacity">
                    0{index + 1}
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-black tracking-tighter uppercase group-hover:text-accent transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground/60 leading-relaxed font-medium tracking-tight">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Hover highlight line */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-accent/0 group-hover:bg-accent/50 transition-all duration-700 transform translate-y-2 group-hover:translate-y-0" />
            </motion.div>
          ))}
        </div>

        {/* Brand Statement CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 border border-border/50 p-12 lg:p-24 text-center relative overflow-hidden"
        >
          <div className="relative z-10 space-y-12">
            <div className="max-w-3xl mx-auto space-y-6">
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.9]">
                The Future of <span className="text-accent italic">Sustainable</span> Luxury.
              </h3>
              <p className="text-muted-foreground/60 text-lg font-medium tracking-tight">
                Join the thousands of curators and seekers who have transformed their wardrobe with ADAZE.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                onClick={() => router.push('/marketplace')}
                className="btn-premium h-14 px-12 text-[10px] font-black tracking-[0.3em] uppercase rounded-none"
              >
                Start Exploring
              </Button>
              <Button
                variant="outline"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="h-14 px-12 rounded-none border-border font-black text-[10px] tracking-[0.3em] uppercase hover:bg-muted/50 transition-all"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Background Text Decor */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[18vw] font-black text-muted-foreground/5 leading-none select-none pointer-events-none uppercase tracking-tighter whitespace-nowrap">
            ADAZE ELITE
          </div>
        </motion.div>
      </div>
    </section>
  );
}