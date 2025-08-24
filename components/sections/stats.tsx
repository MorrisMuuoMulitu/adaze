"use client"

import { motion } from 'framer-motion';
import { TrendingUp, Users, Package, Truck } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '50,000+',
    label: 'Active Users',
    description: 'Traders, buyers, and transporters',
    color: 'text-primary'
  },
  {
    icon: Package,
    value: '200K+',
    label: 'Products Listed',
    description: 'Fresh inventory daily',
    color: 'text-accent'
  },
  {
    icon: Truck,
    value: '1,500+',
    label: 'Daily Deliveries',
    description: 'Across major African cities',
    color: 'text-orange-500'
  },
  {
    icon: TrendingUp,
    value: '98%',
    label: 'Customer Satisfaction',
    description: 'Based on verified reviews',
    color: 'text-green-500'
  }
];

export function Stats() {
  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Trusted by Thousands Across Africa
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Join a thriving community that's revolutionizing the second-hand fashion market
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="relative mb-3 sm:mb-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-background to-muted border-2 group-hover:scale-110 transition-transform duration-300 card-shadow`}>
                  <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              
              <motion.div
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2"
              >
                {stat.value}
              </motion.div>
              
              <h3 className="text-base sm:text-lg font-semibold mb-1">{stat.label}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}