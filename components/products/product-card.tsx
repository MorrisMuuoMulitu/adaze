"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Eye, ShoppingCart } from 'lucide-react';

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
            transition={{ delay: index * 0.05, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="group block relative perspective-1000"
        >
            <Link href={`/products/${product.id}`} className="block relative z-10">
                {/* Image Vessel */}
                <div className="relative aspect-[3/4] overflow-hidden bg-black card-luxury group/image">
                    <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-cover grayscale-[0.3] group-hover/image:grayscale-0 group-hover/image:scale-110 transition-all duration-[1500ms] ease-out"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    
                    {/* Shadow Layer */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                    {/* Floating HUD Elements */}
                    <div className="absolute top-6 left-6 flex items-center gap-3">
                        <div className="p-2 glass-morphism rounded-full">
                            <span className="text-[8px] font-black tracking-widest uppercase text-accent">0{index + 1}</span>
                        </div>
                    </div>

                    {/* Interactive Controls Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                        <div className="flex gap-4">
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    onToggleWishlist?.(e, product.id);
                                }}
                                className={`flex-1 h-12 flex items-center justify-center glass-morphism border-white/10 text-white hover:bg-accent hover:text-black hover:border-accent transition-all duration-500`}
                            >
                                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    onQuickView?.(e);
                                }}
                                className="flex-1 h-12 flex items-center justify-center glass-morphism border-white/10 text-white hover:bg-white hover:text-black transition-all duration-500"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Information Cluster */}
                <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                <span className="text-[10px] font-black tracking-[0.4em] text-accent uppercase">{product.category || 'Asset'}</span>
                            </div>
                            <h3 className="text-xl font-black uppercase text-white tracking-tighter leading-none group-hover:text-accent transition-colors duration-500">
                                {product.name}
                            </h3>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] mb-1">Settlement</span>
                            <span className="text-2xl font-black font-mono tracking-tighter text-white">
                                K {price.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-700">
                         <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Verified Logistics Ready</span>
                         <ArrowRight className="h-4 w-4 text-accent" />
                    </div>
                </div>
            </Link>

            {/* Radiant Ambient Background */}
            <div className="absolute -inset-20 bg-accent/5 blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10 pointer-events-none" />
        </motion.div>
    );
}
