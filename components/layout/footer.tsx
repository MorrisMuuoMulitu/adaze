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
      { name: 'Start Selling', href: '/marketplace' },
      { name: 'Trader Dashboard', href: '/dashboard/trader' },
      { name: 'Manage Products', href: '/products/manage' },
      { name: 'Add Product', href: '/products/add' },
      { name: 'Help Center', href: '/help' }
    ]
  },
  {
    title: 'For Transporters',
    links: [
      { name: 'Join Network', href: '/transporter-registration' },
      { name: 'Transporter Dashboard', href: '/dashboard/transporter' },
      { name: 'Find Delivery', href: '/transporter-connection' },
      { name: 'My Deliveries', href: '/dashboard/transporter' },
      { name: 'Help Center', href: '/help' }
    ]
  },
  {
    title: 'For Wholesalers',
    links: [
      { name: 'Wholesaler Dashboard', href: '/dashboard/wholesaler' },
      { name: 'Manage Inventory', href: '/products' },
      { name: 'View Orders', href: '/orders' },
      { name: 'Analytics', href: '/dashboard/wholesaler/analytics' },
      { name: 'Help Center', href: '/help' }
    ]
  },
  {
    title: 'Support & Legal',
    links: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Support', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Guidelines', href: '/guidelines' }
    ]
  }
];

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/adaze', name: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com/adaze', name: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com/adaze', name: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com/company/adaze', name: 'LinkedIn' }
];

const kenyanCities = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale',
  'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho', 'Embu', 'Migori'
];

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/50 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter uppercase relative">
                ADAZE
                <span className="absolute -right-1 -top-1 w-1.5 h-1.5 bg-accent rounded-full"></span>
              </span>
            </div>

            <p className="text-muted-foreground text-sm uppercase tracking-widest leading-relaxed">
              Kenya&apos;s premier marketplace for quality second-hand fashion.
              Elevating the thrift experience through authenticity and precision.
            </p>

            <div className="space-y-4 pt-4 border-t border-border/20">
              <div className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">Contact.</div>
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-widest text-foreground">+254 700 123 456</div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-foreground">hello@adaze.co.ke</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-6">
                <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-accent">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage & Newsletter */}
        <div className="grid lg:grid-cols-2 gap-16 py-16 border-y border-border/20">
          <div>
            <h3 className="text-[10px] font-black tracking-[0.3em] uppercase mb-6">Regional Access.</h3>
            <div className="flex flex-wrap gap-2 text-[9px] font-black tracking-widest uppercase text-muted-foreground/60">
              {kenyanCities.map((city, idx) => (
                <span key={city} className="hover:text-foreground cursor-default transition-colors">
                  {city}{idx !== kenyanCities.length - 1 && " •"}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">Newsletter.</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="YOUR EMAIL ADDRESS"
                className="rounded-none border-border bg-transparent h-12 text-[10px] font-black tracking-widest uppercase focus:border-accent"
              />
              <Button className="btn-premium rounded-none h-12 px-8 text-[10px] font-black tracking-widest uppercase shrink-0">
                Join Us
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
          <p className="text-[9px] font-black tracking-widest uppercase">
            © 2025 ADAZE COLLECTIVE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8 text-[9px] font-black tracking-widest uppercase">
            <a href="/privacy" className="hover:text-accent">Privacy Policy</a>
            <a href="/terms" className="hover:text-accent">Terms of Service</a>
            <a href="/guidelines" className="hover:text-accent">Guidelines</a>
          </div>
        </div>
      </div>
    </footer>
  );
}