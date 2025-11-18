"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star, TrendingUp, MapPin, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

interface DBProduct {
    id: string;
    trader_id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string | null;
    stock_quantity: number;
    rating: number;
    created_at: string;
    updated_at: string;
    location?: string; // Added location if available in future schema updates or joins
}

export function ProductGrid() {
    const { user } = useAuth();
    const [products, setProducts] = useState<DBProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Use API route to avoid client-side Supabase connection issues
                const response = await fetch('/api/products');

                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Fresh Drops</h2>
                        <p className="text-muted-foreground mt-2">Latest items from our community</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-[400px] rounded-xl bg-muted/50 animate-pulse" />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Fresh Drops
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Discover unique finds from verified sellers
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/marketplace">View All</Link>
                </Button>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/25">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No products found</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        We couldn't find any active products at the moment. Check back soon or browse our categories.
                    </p>
                    <Button className="mt-6" asChild>
                        <Link href="/marketplace">Browse Marketplace</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card className="group h-full overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    <Image
                                        src={product.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random`}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="absolute top-3 right-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0"
                                    >
                                        <Heart className="h-4 w-4" />
                                    </Button>

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
                                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {product.location}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="shrink-0">
                                            {product.category}
                                        </Badge>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-bold">
                                            KSh {product.price.toLocaleString()}
                                        </span>
                                        {/* Placeholder for original price if we had it */}
                                        {/* <span className="text-sm text-muted-foreground line-through">KSh ...</span> */}
                                    </div>
                                </CardContent>

                                <CardFooter className="p-4 pt-0">
                                    <Button className="w-full gap-2" asChild>
                                        <Link href={`/products/${product.id}`}>
                                            <ShoppingCart className="h-4 w-4" />
                                            Buy Now
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    );
}
