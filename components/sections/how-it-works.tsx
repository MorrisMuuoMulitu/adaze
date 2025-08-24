"use client"

import { motion } from 'framer-motion';
import { Search, ShoppingCart, Truck, Star, UserPlus, Package } from 'lucide-react';

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
  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            How ADAZE Works
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            From discovery to delivery, we&apos;ve made buying and selling second-hand fashion simple and secure
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Connection line for desktop */}
              {index < steps.length - 1 && index % 3 !== 2 && (
                <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0" />
              )}
              
              <div className="relative bg-card/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 card-shadow hover:card-shadow-lg">
                {/* Step number */}
                <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs sm:text-sm font-bold">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="mb-4 sm:mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${step.color} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-background rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <step.icon className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-lg sm:text-xl font-semibold group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {step.description}
                  </p>
                </div>

                {/* Hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 rounded-xl sm:rounded-2xl transition-opacity duration-300 -z-10`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 sm:mt-16"
        >
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have transformed their shopping experience with ADAZE
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity h-12 mobile-button"
              >
                Start Shopping Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity h-12 mobile-button"
              >
                Become a Trader
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}