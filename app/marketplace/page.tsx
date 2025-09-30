
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { productService, Product } from '@/lib/productService';
import { cartService } from '@/lib/cartService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Package, MapPin, DollarSign, ShoppingCart, Star, Search, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/navbar';
import { AuthModal } from '@/components/auth/auth-modal';
import { wishlistService } from '@/lib/wishlistService';
import { createClient } from '@/lib/supabase/client';

export default function MarketplacePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({});

  const handleAuthClick = (type: 'login' | 'register') => {
    setAuthModalType(type);
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                  <p className="text-muted-foreground">Browse products available for purchase</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <Button onClick={() => router.push('/cart')}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart ({cartCount})
                  </Button>
                </div>
              </div>

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
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-xl font-semibold">No products available</h3>
                  <p className="text-muted-foreground mt-2">No products match your search. Check back later for new items!</p>
                  <div className="mt-6 space-y-3">
                    <p className="text-muted-foreground">Try:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Changing your search terms</li>
                      <li>• Browsing different categories</li>
                      <li>• Checking back later for new products</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden group">
                      <div className="relative">
                        <div className="h-48 bg-gray-200 relative overflow-hidden">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="rounded-full p-2"
                            onClick={() => handleToggleWishlist(product.id)}
                          >
                            <Heart className={`h-4 w-4 ${wishlistStatus[product.id] ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                          </Button>
                        </div>
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg h-12 overflow-hidden">{product.name}</CardTitle>
                        <CardDescription className="h-12 overflow-hidden">
                          {product.description && product.description.substring(0, 60)}...
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xl font-bold text-primary">
                            KSh {product.price.toFixed(2)}
                          </span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{product.rating && product.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            className="flex-1" 
                            onClick={() => addToCart(product.id)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
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
