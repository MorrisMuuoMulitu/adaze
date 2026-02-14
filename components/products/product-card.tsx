"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star, MapPin, Eye, ArrowRight } from 'lucide-react';
import { Product } from '@/types';

// Define a type that matches what we get from the DB/API
export interface ProductCardProps {
    product: {
        id: string;
        name: string;
        description?: string;
        price: number;
        category: string;
        image_url: string | null;
        rating: number;
        location?: string;
        is_featured?: boolean;
        condition?: string;
        size?: string | null;
        brand?: string | null;
        trader?: {
            full_name: string;
        };
    };
    index?: number;
    isWishlisted?: boolean;
    onToggleWishlist?: (e: React.MouseEvent, productId: string) => void;
    onQuickView?: (e: React.MouseEvent, product: any) => void;
}

export function ProductCard({
    product,
    index = 0,
    isWishlisted = false,
    onToggleWishlist,
    onQuickView
}: ProductCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-background border border-border/50 hover:border-accent/40 transition-all duration-500 overflow-hidden"
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <Image
                    src={product.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random`}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.is_featured && (
                        <Badge className="rounded-none bg-accent text-accent-foreground font-black text-[9px] tracking-widest uppercase py-1 px-3">
                            FEATURED
                        </Badge>
                    )}
                    {product.condition && (
                        <Badge className="rounded-none bg-background/90 backdrop-blur-md text-foreground border-none font-black text-[9px] tracking-widest uppercase py-1 px-3">
                            {product.condition}
                        </Badge>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    {onToggleWishlist && (
                        <Button
                            size="icon"
                            variant="secondary"
                            className="w-10 h-10 rounded-none bg-background/90 hover:bg-accent hover:text-white transition-colors border-none"
                            onClick={(e) => onToggleWishlist(e, product.id)}
                        >
                            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                        </Button>
                    )}
                    {onQuickView && (
                        <Button
                            size="icon"
                            variant="secondary"
                            className="w-10 h-10 rounded-none bg-background/90 hover:bg-accent hover:text-white transition-colors border-none"
                            onClick={(e) => onQuickView(e, product)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                    <div className="uppercase text-[10px] font-black tracking-widest text-accent mb-1">
                        {product.category}
                    </div>
                </div>

                <Link href={`/products/${product.id}`} className="block group/title">
                    <h3 className="font-bold text-sm uppercase tracking-tight line-clamp-1 mb-2 group-hover/title:text-accent transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                    <div className="text-lg font-black tracking-tighter">
                        KSH {product.price.toLocaleString()}
                    </div>
                    <Button variant="link" className="p-0 h-auto text-[10px] font-black tracking-widest uppercase hover:text-accent" asChild>
                        <Link href={`/products/${product.id}`}>
                            DETAILS <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
