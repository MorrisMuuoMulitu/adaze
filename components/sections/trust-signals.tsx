"use client"

import { motion } from 'framer-motion';
import { ShieldCheck, Truck, CreditCard, Sparkles } from 'lucide-react';

const signals = [
  {
    icon: ShieldCheck,
    title: 'AUTHENTICATED ASSETS',
    desc: 'Each item is verified against the Obsidian quality protocol.'
  },
  {
    icon: CreditCard,
    title: 'SECURE SETTLEMENT',
    desc: 'Integrated M-Pesa & encrypted Global Payment nodes.'
  },
  {
    icon: Truck,
    title: 'GLOBAL LOGISTICS',
    desc: 'Real-time synchronization with our autonomous fleet.'
  },
  {
    icon: Sparkles,
    title: 'CURATED SELECTION',
    desc: 'Only the most exceptional pre-loved heritage pieces.'
  }
];

export function TrustSignals() {
  return (
    <section className="py-24 border-y border-white/5 bg-[#050505]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          {signals.map((s, i) => (
            <motion.div 
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center group"
            >
              <div className="h-16 w-16 mb-8 flex items-center justify-center border border-white/10 group-hover:border-accent transition-colors duration-500">
                <s.icon className="h-6 w-6 text-accent/50 group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-white mb-4">
                {s.title}
              </h3>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/30 leading-relaxed max-w-[200px]">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
