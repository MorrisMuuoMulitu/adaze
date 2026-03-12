"use client"

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const footerSections = [
  {
    title: 'Experience',
    links: [
      { name: 'Marketplace', href: '/marketplace' },
      { name: 'How it Works', href: '/guide/buying' },
      { name: 'Authentication', href: '/payments' },
      { name: 'Logistics', href: '/orders' }
    ]
  },
  {
    title: 'Partnerships',
    links: [
      { name: 'Trader Hub', href: '/dashboard/trader' },
      { name: 'Supply Network', href: '/dashboard/wholesaler' },
      { name: 'Transporter Join', href: '/transporter-registration' }
    ]
  },
  {
    title: 'Identity',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Guidelines', href: '/guidelines' }
    ]
  }
];

export function Footer() {
  return (
    <footer className="bg-background py-32 border-t border-foreground/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-20">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            <Link href="/" className="brand-logo">
              ADAZE
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] leading-relaxed text-foreground/40 max-w-sm">
              Kenya&apos;s most curated destination for premium pre-loved fashion.
              A commitment to heritage, quality, and conscious luxury.
            </p>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Contact</span>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-widest text-foreground/60">hello@adaze.co</span>
                <span className="text-[10px] uppercase tracking-widest text-foreground/60">+254 700 000 000</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-10">
            {footerSections.map((section) => (
              <div key={section.title} className="flex flex-col gap-10">
                <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-6">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[10px] uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter / Identity */}
          <div className="lg:col-span-3 flex flex-col gap-10">
            <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase">Newsletter</h3>
            <div className="flex flex-col gap-6">
              <p className="text-[10px] uppercase tracking-widest text-foreground/40">
                Receive curated updates and exclusive releases.
              </p>
              <div className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  className="bg-transparent border-0 border-b border-foreground/10 py-4 text-[10px] tracking-widest uppercase focus:border-foreground/40 focus:outline-none transition-colors"
                />
                <button className="text-[10px] font-bold tracking-[0.3em] uppercase text-left hover:opacity-60 transition-opacity">
                  SUBSCRIBE →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-32 pt-12 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-foreground/20">
            © 2025 ADAZE COLLECTIVE
          </span>
          <div className="flex gap-12 text-[9px] font-bold tracking-[0.3em] uppercase text-foreground/20">
            <span>Nairobi</span>
            <span>Mombasa</span>
            <span>London</span>
          </div>
        </div>
      </div>
    </footer>
  );
}