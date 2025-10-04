"use client"

import { motion } from 'framer-motion';
import { Shield, Zap, Heart, Award, Lock, TrendingUp, Users, CheckCircle } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Bank-level security with M-Pesa, Stripe & PayPal integration',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Browse thousands of products with instant search & filters',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Heart,
    title: 'Community Driven',
    description: 'Verified sellers and authentic reviews from real buyers',
    color: 'from-pink-500 to-red-500'
  },
  {
    icon: Award,
    title: 'Quality Guaranteed',
    description: 'Curated second-hand items in excellent condition',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Lock,
    title: 'Data Protection',
    description: 'Your privacy matters - encrypted & secure platform',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: TrendingUp,
    title: 'Best Prices',
    description: 'Competitive pricing with direct trader connections',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: Users,
    title: '10K+ Users',
    description: 'Join thousands of satisfied buyers and sellers',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: CheckCircle,
    title: 'Verified Traders',
    description: 'All sellers are vetted and approved by ADAZE',
    color: 'from-teal-500 to-cyan-500'
  }
];

export function TrustBadges() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Why Choose ADAZE?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            More than just a marketplace - we&apos;re building trust in Kenya&apos;s mitumba industry
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative bg-card/50 backdrop-blur-sm rounded-xl p-6 border hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 h-full">
                {/* Icon with gradient background */}
                <div className="mb-4">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${badge.color} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-background rounded-xl flex items-center justify-center">
                      <badge.icon className="h-7 w-7 text-foreground" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {badge.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                {/* Hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300 -z-10`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                10K+
              </div>
              <div className="text-sm text-muted-foreground mt-1">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                50K+
              </div>
              <div className="text-sm text-muted-foreground mt-1">Products Listed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                4.9⭐
              </div>
              <div className="text-sm text-muted-foreground mt-1">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                24/7
              </div>
              <div className="text-sm text-muted-foreground mt-1">Support Available</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
