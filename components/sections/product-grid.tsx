"use client"

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star, TrendingUp, MapPin, ShoppingBag, Eye } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { QuickViewModal } from '@/components/products/quick-view-modal';
import { AdvancedFilters, FilterState } from '@/components/sections/advanced-filters';
import { ProductSkeleton } from '@/components/products/product-skeleton';
import { ProductCard } from '@/components/products/product-card';
import { wishlistService } from '@/lib/wishlistService';
import { toast } from 'sonner';

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
    location?: string;
}

export function ProductGrid() {
    const { user } = useAuth();
    const [products, setProducts] = useState<DBProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    const [hasMore, setHasMore] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<DBProduct | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        category: '',
        minPrice: null,
        maxPrice: null,
        sortBy: 'newest'
    });
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
    const LIMIT = 12;

    useEffect(() => {
        if (user) {
            wishlistService.getWishlistItems(user.id).then(items => {
                setWishlistIds(new Set(items.map(item => item.product_id)));
            });
        }
    }, [user]);

    const handleToggleWishlist = async (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error('Please log in to add items to your wishlist');
            return;
        }

        try {
            if (wishlistIds.has(productId)) {
                await wishlistService.removeFromWishlist(user.id, productId);
                setWishlistIds(prev => {
                    const next = new Set(prev);
                    next.delete(productId);
                    return next;
                });
                toast.success('Removed from wishlist');
            } else {
                await wishlistService.addToWishlist(user.id, productId);
                setWishlistIds(prev => {
                    const next = new Set(prev);
                    next.add(productId);
                    return next;
                });
                toast.success('Added to wishlist');
            }
        } catch (error) {
            toast.error('Failed to update wishlist');
        }
    };

    const fetchProducts = useCallback(async (pageNumber: number, isLoadMore = false, currentFilters = filters) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const queryParams = new URLSearchParams({
                page: pageNumber.toString(),
                limit: LIMIT.toString(),
                category: currentFilters.category,
                sortBy: currentFilters.sortBy,
            });

            if (currentFilters.minPrice) queryParams.append('minPrice', currentFilters.minPrice.toString());
            if (currentFilters.maxPrice) queryParams.append('maxPrice', currentFilters.maxPrice.toString());

            const response = await fetch(`/api/products?${queryParams.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();

            if (data.length < LIMIT) {
                setHasMore(false);
            }

            if (isLoadMore) {
                setProducts(prev => [...prev, ...data]);
            } else {
                setProducts(data);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchProducts(1);
    }, [fetchProducts]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, true);
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setPage(1);
        setProducts([]); // Clear current products to show loading state cleanly or just replace
        fetchProducts(1, false, newFilters);
    };

    if (loading) {
        return (
            <section className="container mx-auto px-4 py-16">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <div className="h-10 w-48 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg mb-3" />
                        <div className="h-4 w-64 bg-muted/50 animate-pulse rounded" />
                    </div>
                    <div className="h-12 w-28 bg-muted animate-pulse rounded-lg" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {[...Array(8)].map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <Button onClick={() => fetchProducts(1)} variant="outline" className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <section className="container mx-auto px-4 py-16 relative">
            {/* Subtle background gradient */}
            <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl -z-10"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-3">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Latest Arrivals</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Fresh Drops
                    </h2>
                    <p className="text-muted-foreground/90 mt-3 text-lg font-medium">
                        Discover unique finds from verified sellers
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        variant="outline"
                        asChild
                        className="h-12 px-6 border-2 border-primary/30 hover:bg-primary/10 hover:border-primary font-semibold"
                    >
                        <Link href="/marketplace">View All</Link>
                    </Button>
                </motion.div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                <aside className="w-full md:w-64 shrink-0">
                    <AdvancedFilters onFilterChange={handleFilterChange} />
                </aside>

                <div className="flex-1 w-full">

                    {products.length === 0 ? (
                        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/25">
                            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No products found</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                We couldn&apos;t find any active products at the moment. Check back soon or browse our categories.
                            </p>
                            <Button className="mt-6" asChild>
                                <Link href="/marketplace">Browse Marketplace</Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {products.map((product, index) => (
                                    <motion.div
                                        key={`${product.id}-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: (index % LIMIT) * 0.05 }}
                                    >
                                        <ProductCard
                                            product={product}
                                            index={index}
                                            isWishlisted={wishlistIds.has(product.id)}
                                            onToggleWishlist={handleToggleWishlist}
                                            onQuickView={(e) => {
                                                e.preventDefault();
                                                setSelectedProduct(product);
                                                setIsQuickViewOpen(true);
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {hasMore && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="mt-16 text-center"
                                >
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            size="lg"
                                            className="min-w-[240px] h-14 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
                                        >
                                            {loadingMore ? (
                                                <>
                                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                                    Loading More...
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingBag className="h-5 w-5 mr-2" />
                                                    Load More Products
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <QuickViewModal
                product={selectedProduct ? {
                    ...selectedProduct,
                    condition: 'New', // Default or fetch from DB if available
                    size: null, // Default or fetch
                    brand: null // Default or fetch
                } : null}
                open={isQuickViewOpen}
                onOpenChange={setIsQuickViewOpen}
            />
        </section>
    );
}
