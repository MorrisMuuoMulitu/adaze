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
  const [traders, setTraders] = useState<Array<{id: string, name: string}>>([]);
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
      setLoading(false);
      return;
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

        const initialWishlistStatus: Record<string, boolean> = {};
        for (const product of allProducts) {
          initialWishlistStatus[product.id] = await wishlistService.isInWishlist(user.id, product.id);
        }
        setWishlistStatus(initialWishlistStatus);
        
        const count = await cartService.getCartCount(user.id);
        setCartCount(count);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load products. Please try again later.');
        try {
          const count = await cartService.getCartCount(user.id);
          setCartCount(count);
        } catch (cartError) {
          console.error('Error fetching cart count:', cartError);
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
      router.push('/');
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
    <div className="flex flex-col min-h-screen">
      <Navbar onAuthClick={handleAuthClick} />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleCloseAuthModal} 
        initialType={authModalType} 
        onSuccess={handleCloseAuthModal}
      />
      
      {/* Quick View Dialog */}
      <Dialog open={!!quickViewProduct} onOpenChange={() => setQuickViewProduct(null)}>
        <DialogContent className="max-w-3xl">
          {quickViewProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{quickViewProduct.name}</DialogTitle>
                <DialogDescription>Quick view product details</DialogDescription>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative h-64 md:h-full bg-gray-200 rounded-lg overflow-hidden">
                  {quickViewProduct.image_url ? (
                    <Image 
                      src={quickViewProduct.image_url} 
                      alt={quickViewProduct.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-primary">KSh {quickViewProduct.price.toFixed(2)}</p>
                    {quickViewProduct.category && (
                      <Badge variant="secondary" className="mt-2">{quickViewProduct.category}</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{quickViewProduct.description}</p>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">{quickViewProduct.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1" onClick={() => {
                      addToCart(quickViewProduct.id);
                      setQuickViewProduct(null);
                    }}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" onClick={() => handleToggleWishlist(quickViewProduct.id)}>
                      <Heart className={`h-4 w-4 ${wishlistStatus[quickViewProduct.id] ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                  <Button variant="link" className="w-full" onClick={() => {
                    router.push(`/products/${quickViewProduct.id}`);
                    setQuickViewProduct(null);
                  }}>
                    View Full Details →
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <main className="flex-grow">
        <div className="min-h-screen bg-background py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Marketplace</h1>
                  <p className="text-muted-foreground">{filteredAndSortedProducts.length} products available</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <Button onClick={() => router.push('/cart')}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart ({cartCount})
                  </Button>
                </div>
              </div>

              {/* Search and Filters Bar */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="relative">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Advanced Filters</SheetTitle>
                      <SheetDescription>Refine your product search</SheetDescription>
                    </SheetHeader>
                    <div className="py-6 space-y-6">
                      <div>
                        <Label className="mb-3 block">Price Range</Label>
                        <div className="space-y-4">
                          <Slider
                            min={0}
                            max={maxPrice}
                            step={100}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm">
                            <span>KSh {priceRange[0]}</span>
                            <span>KSh {priceRange[1]}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-3 block">Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="mb-3 block">Seller/Trader</Label>
                        <Select value={selectedTrader || 'all'} onValueChange={(value) => setSelectedTrader(value === 'all' ? null : value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Sellers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Sellers</SelectItem>
                            {traders.map(trader => (
                              <SelectItem key={trader.id} value={trader.id}>{trader.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <SheetFooter>
                      <Button variant="outline" onClick={handleClearFilters} className="w-full">
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="mb-4 flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {selectedCategory !== 'all' && (
                    <Badge variant="secondary" className="gap-1">
                      {categoryOptions.find(c => c.value === selectedCategory)?.label}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                    </Badge>
                  )}
                  {selectedTrader && (
                    <Badge variant="secondary" className="gap-1">
                      Seller: {getTraderName(selectedTrader)}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => { setSelectedTrader(null); router.push('/marketplace'); }} />
                    </Badge>
                  )}
                  {(priceRange[0] !== 0 || priceRange[1] !== maxPrice) && (
                    <Badge variant="secondary" className="gap-1">
                      KSh {priceRange[0]} - KSh {priceRange[1]}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setPriceRange([0, maxPrice])} />
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    Clear all
                  </Button>
                </div>
              )}

              {filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-xl font-semibold">No products found</h3>
                  <p className="text-muted-foreground mt-2">No products match your search and filters.</p>
                  <Button className="mt-6" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <div className="h-48 bg-gray-200 relative overflow-hidden">
                          {product.image_url ? (
                            <Image 
                              src={product.image_url} 
                              alt={product.name}
                              width={400}
                              height={300}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => setQuickViewProduct(product)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Quick View
                            </Button>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="rounded-full p-2 shadow-lg"
                            onClick={() => handleToggleWishlist(product.id)}
                          >
                            <Heart className={`h-4 w-4 ${wishlistStatus[product.id] ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                          </Button>
                        </div>
                        {product.category && (
                          <Badge className="absolute top-2 left-2">{product.category}</Badge>
                        )}
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {product.description || 'No description available'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xl font-bold text-primary">
                            KSh {product.price.toFixed(2)}
                          </span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{product.rating?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            className="flex-1" 
                            onClick={() => addToCart(product.id)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/products/${product.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
