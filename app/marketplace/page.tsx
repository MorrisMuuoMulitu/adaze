"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { ProductGrid } from '@/components/sections/product-grid';
import { AuthModal } from '@/components/auth/auth-modal';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { ShoppingBag, Search } from 'lucide-react';

export default function MarketplacePage() {
    const { user, loading } = useAuth();
    const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);

    const handleAuthSuccess = () => {
        setAuthModal(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar onAuthClick={setAuthModal} />

            <main className="pt-32 pb-24">
                {/* Editorial Header */}
                <div className="container mx-auto px-6 mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-border/50 pb-16"
                    >
                        <div className="max-w-3xl">
                            <div className="text-[10px] font-black tracking-[0.5em] uppercase text-accent mb-6">
                                The Global Archive
                            </div>
                            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8]">
                                The <span className="text-muted-foreground/20 italic">Collective.</span>
                            </h1>
                            <p className="mt-10 text-lg text-muted-foreground/60 max-w-xl font-medium tracking-tight">
                                Access Kenya&apos;s most exclusive collection of authenticated premium fashion. 
                                Curated for the few who value heritage over hype.
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                            <div className="flex items-center gap-4 text-[9px] font-black tracking-[0.3em] uppercase text-muted-foreground/30">
                                <Search className="h-4 w-4" /> Global Intelligence Search Active
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Main Discovery Interface */}
                <ProductGrid />
            </main>

            <AuthModal
                type={authModal}
                isOpen={!!authModal}
                onClose={() => setAuthModal(null)}
                onSuccess={handleAuthSuccess}
            />
        </div>
    );
}
