"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star, MapPin, Eye } from 'lucide-react';
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
        <Card className="group h-full overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                    src={product.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random`}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {onToggleWishlist && (
                    <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-3 right-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0"
                        onClick={(e) => onToggleWishlist(e, product.id)}
                    >
                        <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                )}

                {onQuickView && (
                    <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-12 right-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0 delay-75"
                        onClick={(e) => {
                            e.preventDefault();
                            onQuickView(e, product);
                        }}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                )}

                {product.rating >= 4.5 && (
                    <Badge className="absolute top-3 left-3 bg-yellow-500/90 text-white border-0 backdrop-blur-md">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Top Rated
                    </Badge>
                )}
            </div>

            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                        {product.location && (
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {product.location}
                            </p>
                        )}
                    </div>
                    <Badge variant="outline" className="shrink-0">
                        {product.category}
                    </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">
                        KSh {product.price.toLocaleString()}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button className="w-full gap-2 african-gradient hover:opacity-90 shadow-lg hover:shadow-primary/20 transition-all duration-300" asChild>
                    <Link href={`/products/${product.id}`}>
                        <ShoppingCart className="h-4 w-4" />
                        Buy Now
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
