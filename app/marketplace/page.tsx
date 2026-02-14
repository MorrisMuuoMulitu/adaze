"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { productService, Product } from '@/lib/productService';
import { cartService } from '@/lib/cartService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, MapPin, DollarSign, ShoppingCart, Star, Search, Heart, Filter, SlidersHorizontal, X, Eye, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/navbar';
import { AuthModal } from '@/components/auth/auth-modal';
import { wishlistService } from '@/lib/wishlistService';
import { createClient } from '@/lib/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from '@/components/ui/slider';
import { PRODUCT_CATEGORIES } from '@/lib/categories';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function MarketplacePage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null);
  const [traders, setTraders] = useState<Array<{ id: string, name: string }>>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [cartCount, setCartCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({});
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Check for trader filter in URL
  useEffect(() => {
    const traderParam = searchParams?.get('trader');
    if (traderParam) {
      setSelectedTrader(traderParam);
    }
  }, [searchParams]);

  const handleAuthClick = (type: 'login' | 'register') => {
    setAuthModalType(type);
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const checkUserRole = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (data && data.role === 'trader') {
        router.push('/dashboard/trader');
      }
    };

    checkUserRole();
  }, [user, router]);

  useEffect(() => {
    if (!user) {
      // Allow public access, just don't fetch user-specific data
    }

    const fetchData = async () => {
      setLoading(true);

      try {
        const allProducts = await productService.getAllProducts();
        setProducts(allProducts);
        setError(null);

        // Calculate max price
        const max = Math.max(...allProducts.map(p => p.price), 10000);
        setMaxPrice(max);
        setPriceRange([0, max]);

        // Get unique traders from products
        const supabase = createClient();
        const uniqueTraderIds = [...new Set(allProducts.map(p => p.trader_id))];
        const { data: traderProfiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', uniqueTraderIds)
          .eq('role', 'trader');

        if (traderProfiles) {
          setTraders(traderProfiles.map(t => ({ id: t.id, name: t.full_name })));
        }

        if (user) {
          const initialWishlistStatus: Record<string, boolean> = {};
          for (const product of allProducts) {
            initialWishlistStatus[product.id] = await wishlistService.isInWishlist(user.id, product.id);
          }
          setWishlistStatus(initialWishlistStatus);

          const count = await cartService.getCartCount(user.id);
          setCartCount(count);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load products. Please try again later.');
        if (user) {
          try {
            const count = await cartService.getCartCount(user.id);
            setCartCount(count);
          } catch (cartError) {
            console.error('Error fetching cart count:', cartError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please log in to manage your wishlist.');
      return;
    }

    try {
      if (wishlistStatus[productId]) {
        await wishlistService.removeFromWishlist(user.id, productId);
        setWishlistStatus(prev => ({ ...prev, [productId]: false }));
        toast.success('Removed from wishlist!');
      } else {
        await wishlistService.addToWishlist(user.id, productId);
        setWishlistStatus(prev => ({ ...prev, [productId]: true }));
        toast.success('Added to wishlist!');
      }
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist.');
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      handleAuthClick('login');
      return;
    }

    try {
      const cartItem = await cartService.addToCart(user.id, productId, 1);
      if (cartItem) {
        toast.success(`${cartItem.product_name} added to cart!`);
      } else {
        toast.success('Added to cart!');
      }

      const count = await cartService.getCartCount(user.id);
      setCartCount(count);

      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Get unique categories from products (dynamic)
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    const categoriesArray = Array.from(cats);
    console.log('Available categories in products:', categoriesArray);
    return categoriesArray;
  }, [products]);

  // Build category options (use predefined categories)
  const categoryOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Categories' }];

    // Add all predefined categories
    PRODUCT_CATEGORIES.forEach(cat => {
      options.push({ value: cat.value, label: cat.label });
    });

    return options;
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (debouncedSearch) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(debouncedSearch.toLowerCase()))
      );
    }

    // Category filter (case-insensitive and handles variations)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        if (!product.category) return false;
        const productCat = product.category.toLowerCase().trim();
        const selectedCat = selectedCategory.toLowerCase().trim();
        return productCat === selectedCat || productCat.includes(selectedCat) || selectedCat.includes(productCat);
      });
    }

    // Trader filter
    if (selectedTrader) {
      filtered = filtered.filter(product => product.trader_id === selectedTrader);
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
          return (b.rating || 0) - (a.rating || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

    return sorted;
  }, [products, debouncedSearch, selectedCategory, selectedTrader, priceRange, sortBy]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedTrader) count++;
    if (priceRange[0] !== 0 || priceRange[1] !== maxPrice) count++;
    return count;
  }, [selectedCategory, selectedTrader, priceRange, maxPrice]);

  const getTraderName = (traderId: string) => {
    return traders.find(t => t.id === traderId)?.name || 'Unknown Seller';
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedTrader(null);
    setPriceRange([0, maxPrice]);
    setSearchTerm('');
    setSortBy('newest');
    setFiltersOpen(false);
    // Clear URL params
    router.push('/marketplace');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Error Loading Products</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-accent/30">
      <Navbar onAuthClick={handleAuthClick} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        initialType={authModalType}
        onSuccess={handleCloseAuthModal}
      />

      <main className="flex-grow pt-32 pb-24">
        {/* Scanline Effect */}
        <div className="fixed inset-0 bg-scanline opacity-[0.02] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Editorial Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl"
            >
              <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-6">
                THE MARKETPLACE
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                The <span className="text-muted-foreground/30 italic">Collective.</span>
              </h1>
              <p className="mt-8 text-lg text-muted-foreground/60 font-medium tracking-tight uppercase">
                {filteredAndSortedProducts.length} Authenticated Pieces Available.
              </p>
            </motion.div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="rounded-none border-border/50 text-[10px] font-black tracking-widest uppercase h-14 px-8 hover:bg-muted/50 transition-all"
                onClick={() => router.push('/cart')}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({cartCount})
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0 space-y-12 sticky top-32">
              <div className="space-y-4">
                <Label className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Search</Label>
                <div className="relative">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                  <Input
                    type="text"
                    placeholder="KEYWORD"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 border-none bg-transparent rounded-none border-b border-border focus-visible:ring-0 focus-visible:border-accent font-black text-xs placeholder:opacity-30 p-0 h-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Categories</Label>
                <div className="flex flex-col gap-2">
                  {categoryOptions.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`text-left text-[11px] font-black tracking-widest uppercase transition-colors py-1 ${selectedCategory === cat.value ? 'text-accent' : 'text-foreground/60 hover:text-foreground'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-border/20">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Price Range</Label>
                  <span className="text-[10px] font-black font-mono">KSH {priceRange[1]}</span>
                </div>
                <Slider
                  min={0}
                  max={maxPrice}
                  step={500}
                  value={[priceRange[1]]}
                  onValueChange={(val) => setPriceRange([0, val[0]])}
                  className="w-full"
                />
              </div>

              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="w-full justify-start p-0 h-auto text-[9px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 hover:bg-transparent"
              >
                Reset All Filters
              </Button>
            </aside>

            {/* Mobile / Control Bar */}
            <div className="w-full lg:flex-1 space-y-12">
              <div className="flex flex-wrap items-center justify-between gap-6 py-4 border-y border-border/20">
                <div className="flex items-center gap-8">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-auto border-none bg-transparent h-auto p-0 rounded-none focus:ring-0 gap-2">
                      <ArrowUpDown className="h-3 w-3 text-accent" />
                      <SelectValue className="text-[10px] font-black tracking-widest uppercase" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border">
                      {SORT_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-black tracking-widest uppercase">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="lg:hidden">
                  <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="rounded-none border-border/50 text-[10px] font-black tracking-widest uppercase gap-2 h-10">
                        <SlidersHorizontal className="h-3 w-3" />
                        Filters
                        {activeFiltersCount > 0 && <span>({activeFiltersCount})</span>}
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="bg-background border-l border-border/50 w-full sm:max-w-md">
                      {/* Mobile Filter Content - Similar to sidebar */}
                      <div className="py-12 space-y-12">
                        <SheetHeader className="text-left mb-8">
                          <SheetTitle className="text-2xl font-black tracking-tighter uppercase">Filters.</SheetTitle>
                        </SheetHeader>
                        {/* Categories List */}
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Categories</Label>
                          <div className="grid grid-cols-2 gap-4">
                            {categoryOptions.map(cat => (
                              <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`text-left text-[11px] font-black tracking-widest uppercase transition-colors py-2 border-b border-border/10 ${selectedCategory === cat.value ? 'text-accent border-accent' : 'text-foreground/60'
                                  }`}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <Button className="btn-premium w-full h-14 rounded-none uppercase text-[10px] font-black tracking-widest" onClick={() => setFiltersOpen(false)}>
                          Show {filteredAndSortedProducts.length} Pieces
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              {/* Product Grid */}
              {filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-32 space-y-8 border border-dashed border-border/50">
                  <Package className="h-12 w-12 mx-auto text-accent opacity-20" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tighter uppercase">No pieces found.</h3>
                    <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest">Refine your criteria and try again.</p>
                  </div>
                  <Button variant="outline" onClick={handleClearFilters} className="rounded-none border-border text-[10px] font-black tracking-widest uppercase h-12 px-8">
                    Clear Workspace
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredAndSortedProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        ...product,
                        is_featured: index < 2 // Just for look
                      }}
                      index={index}
                      isWishlisted={wishlistStatus[product.id]}
                      onToggleWishlist={(e) => {
                        e.preventDefault();
                        handleToggleWishlist(product.id);
                      }}
                      onQuickView={(e) => {
                        e.preventDefault();
                        setQuickViewProduct(product);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

