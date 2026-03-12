"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Eye } from 'lucide-react';

export interface ProductCardProps {
    product: {
        id: string;
        name: string;
        description?: string | null;
        price: number;
        category?: string | null;
        imageUrl?: string | null;
        rating: number;
        location?: string;
        condition?: string;
    };
    index?: number;
    isWishlisted?: boolean;
    onToggleWishlist?: (e: React.MouseEvent, productId: string) => Promise<void>;
    onQuickView?: (e: any) => void;
}

export function ProductCard({
    product,
    index = 0,
    isWishlisted = false,
    onToggleWishlist,
    onQuickView,
}: ProductCardProps) {
    const price = Number(product.price);
    const image = product.imageUrl || `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="group block relative"
        >
            <Link href={`/products/${product.id}`} className="block relative z-10 group/card">
                {/* Large Visual Section */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#111] mb-8 border border-white/5 group-hover:border-accent/40 transition-colors duration-1000">
                    <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110 group-hover:brightness-110"
                        style={{ transitionDuration: '2000ms' }}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    
                    {/* Shadow & Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40" />

                    {/* Quick Actions Overlay */}
                    <div className="absolute top-4 right-4 flex flex-col gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700">
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                onToggleWishlist?.(e, product.id);
                            }}
                            className={`p-3 rounded-none border ${isWishlisted ? 'bg-accent border-accent text-white' : 'bg-black/40 border-white/10 text-white'} backdrop-blur-md hover:bg-accent transition-colors`}
                        >
                            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                onQuickView?.(e);
                            }}
                            className="p-3 rounded-none border bg-black/40 border-white/10 text-white backdrop-blur-md hover:bg-white hover:text-black transition-colors"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Reveal Info on Hover */}
                    <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-accent mb-2 block">
                            Quick Registry
                        </span>
                        <div className="flex items-center gap-2 text-white">
                            <span className="text-[9px] uppercase tracking-widest font-bold">Secure Archive Entry</span>
                            <ArrowRight className="h-3 w-3" />
                        </div>
                    </div>
                </div>

                {/* Metadata Area */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold tracking-[0.5em] text-accent uppercase">
                                {product.category || 'Luxury Archive'}
                            </span>
                            <h3 className="text-lg font-normal tracking-tight text-white group-hover/card:text-accent transition-colors">
                                {product.name}
                            </h3>
                        </div>
                        <div className="text-right">
                            <span className="text-xs uppercase tracking-widest text-[#666] mb-1 block">Value</span>
                            <span className="text-xl font-normal tracking-tighter text-white">
                                KES {price.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
            
            {/* Soft Ambient Background Glow */}
            <div className="absolute -inset-10 bg-accent/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-0 pointer-events-none" />
        </motion.div>
    );
}
