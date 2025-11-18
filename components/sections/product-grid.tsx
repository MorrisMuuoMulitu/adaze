"use client"

import { useState, useEffect } from 'react';
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

    const fetchProducts = async (pageNumber: number, isLoadMore = false, currentFilters = filters) => {
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
    };

    useEffect(() => {
        fetchProducts(1);
    }, []);

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
            <section className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-10 w-24 bg-muted animate-pulse rounded" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <section className="container mx-auto px-4 py-12">
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

                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="absolute top-3 right-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0"
                                                    onClick={(e) => handleToggleWishlist(e, product.id)}
                                                >
                                                    <Heart className={`h-4 w-4 ${wishlistIds.has(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                                </Button>

                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="absolute top-12 right-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0 delay-75"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setSelectedProduct(product);
                                                        setIsQuickViewOpen(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
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

                            {hasMore && (
                                <div className="mt-12 text-center">
                                    <Button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        variant="secondary"
                                        size="lg"
                                        className="min-w-[200px]"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                                Loading...
                                            </>
                                        ) : (
                                            'Load More Products'
                                        )}
                                    </Button>
                                </div>
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
