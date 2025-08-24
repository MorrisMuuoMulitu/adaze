"use client"

import { motion } from 'framer-motion';
import { ShoppingBag, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const footerSections = [
  {
    title: 'For Buyers',
    links: [
      { name: 'Browse Products', href: '/marketplace' },
      { name: 'How to Buy', href: '/guide/buying' },
      { name: 'M-Pesa Payments', href: '/payments' },
      { name: 'Track Orders', href: '/orders' },
      { name: 'Return Policy', href: '/returns' }
    ]
  },
  {
    title: 'For Traders',
    links: [
      { name: 'Start Selling', href: '/sell' },
      { name: 'Seller Dashboard', href: '/dashboard/seller' },
      { name: 'Pricing Guide', href: '/guide/pricing' },
      { name: 'Best Practices', href: '/guide/selling' },
      { name: 'Success Stories', href: '/stories' }
    ]
  },
  {
    title: 'For Transporters',
    links: [
      { name: 'Join Network', href: '/transport/join' },
      { name: 'Driver Dashboard', href: '/dashboard/driver' },
      { name: 'Delivery Guide', href: '/guide/delivery' },
      { name: 'Earnings', href: '/transport/earnings' },
      { name: 'Requirements', href: '/transport/requirements' }
    ]
  },
  {
    title: 'Support & Legal',
    links: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Support', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Community Guidelines', href: '/guidelines' }
    ]
  }
];

const socialLinks = [
  { icon: Facebook, href: '#', name: 'Facebook' },
  { icon: Twitter, href: '#', name: 'Twitter' },
  { icon: Instagram, href: '#', name: 'Instagram' },
  { icon: Linkedin, href: '#', name: 'LinkedIn' }
];

const kenyanCities = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale',
  'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho', 'Embu', 'Migori'
];

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand section */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 sm:space-y-6"
              >
                {/* Logo */}
                <div className="flex items-center space-x-2">
                  <div className="african-gradient w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ADAZE
                  </span>
                </div>

                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Kenya&apos;s premier marketplace for quality second-hand fashion. 
                  Connecting traders, buyers, and transporters across all 47 counties 
                  for sustainable and affordable shopping.
                </p>

                {/* Contact info */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start space-x-3 text-xs sm:text-sm">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Serving all 47 counties in Kenya 🇰🇪</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs sm:text-sm">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    <span>+254 700 123 456</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs sm:text-sm">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    <span>hello@adaze.co.ke</span>
                  </div>
                </div>

                {/* Social links */}
                <div className="flex items-center space-x-3 sm:space-x-4">
                  {socialLinks.map((social) => (
                    <Button
                      key={social.name}
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 sm:w-9 sm:h-9 p-0 hover:bg-primary hover:text-primary-foreground transition-colors mobile-button"
                      asChild
                    >
                      <a href={social.href} aria-label={social.name}>
                        <social.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </a>
                    </Button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Links sections */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {footerSections.map((section, index) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-3 sm:space-y-4"
                  >
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">{section.title}</h3>
                    <ul className="space-y-2 sm:space-y-3">
                      {section.links.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors block py-1 mobile-button"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Kenya Coverage Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-6 sm:py-8 border-t border-border"
        >
          <div className="text-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold mb-2">We Deliver Across Kenya 🇰🇪</h3>
            <p className="text-muted-foreground text-sm">
              From Nairobi to Mombasa, Kisumu to Eldoret - we cover all 47 counties
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {kenyanCities.map((city) => (
              <span
                key={city}
                className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                {city}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Newsletter section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-6 sm:py-8 border-t border-border"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Get the latest deals, new arrivals, and marketplace updates from across Kenya delivered to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter your email address"
                className="flex-1 h-10 sm:h-12 focus-ring"
              />
              <Button className="african-gradient text-white hover:opacity-90 h-10 sm:h-12 mobile-button">
                Subscribe
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <div className="py-4 sm:py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">
              © 2025 ADAZE. All rights reserved. Made with ❤️ for Kenya 🇰🇪
            </p>
            <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-primary transition-colors py-1 mobile-button">Privacy</a>
              <a href="/terms" className="hover:text-primary transition-colors py-1 mobile-button">Terms</a>
              <a href="/cookies" className="hover:text-primary transition-colors py-1 mobile-button">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}