"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { wishlistService } from '@/lib/wishlistService';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Heart, ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/navbar';
import { AuthModal } from '@/components/auth/auth-modal';

interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products: Product; // Joined product data
}

export default function WishlistPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');

  const handleAuthClick = (type: 'login' | 'register') => {
    setAuthModalType(type);
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      // Optionally redirect to home or show a message to log in
      return;
    }

    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const items = await wishlistService.getWishlistItems(user.id);
        setWishlistItems(items);
        setError(null);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load wishlist. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please log in to manage your wishlist.');
      return;
    }
    try {
      await wishlistService.removeFromWishlist(user.id, productId);
      setWishlistItems(prevItems => prevItems.filter(item => item.product_id !== productId));
      toast.success('Item removed from wishlist!');
      window.dispatchEvent(new CustomEvent('wishlistUpdated')); // Notify Navbar
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      toast.error('Failed to remove item from wishlist.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar onAuthClick={handleAuthClick} />
        <main className="flex-grow flex items-center justify-center">
          <div>Loading wishlist...</div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar onAuthClick={handleAuthClick} />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={handleCloseAuthModal} 
          initialType={authModalType} 
          onSuccess={handleCloseAuthModal}
        />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Your Wishlist</CardTitle>
              <CardDescription>Please log in to view your saved items.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="mb-4">Log in to keep track of products you love.</p>
              <Button onClick={() => handleAuthClick('login')}>Log In</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar onAuthClick={handleAuthClick} />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Error</CardTitle>
              <CardDescription>Failed to load your wishlist.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </main>
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
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-8">Your Wishlist ({wishlistItems.length} items)</h1>

            {wishlistItems.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Your Wishlist is Empty</h2>
                  <p className="text-muted-foreground mb-6">
                    Looks like you haven't added any items to your wishlist yet.
                  </p>
                  <Button onClick={() => router.push('/marketplace')}>Start Browsing</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item) => (
                  <Card key={item.product_id} className="overflow-hidden">
                    <div className="relative">
                      <div className="h-48 bg-gray-200 relative overflow-hidden">
                        {item.products.image_url ? (
                          <img 
                            src={item.products.image_url} 
                            alt={item.products.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="absolute top-2 right-2 rounded-full p-2"
                        onClick={() => handleRemoveFromWishlist(item.product_id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{item.products.name}</CardTitle>
                      <CardDescription>{item.products.description.substring(0, 60)}...</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xl font-bold text-primary">
                          KSh {item.products.price.toFixed(2)}
                        </span>
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 fill-red-400 text-red-400 mr-1" />
                          <span>In Wishlist</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1" 
                          onClick={() => {
                            // Add to cart functionality (not implemented yet)
                            toast.info('Add to cart functionality coming soon!');
                          }}
                        >
                          <ShoppingCartIcon className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/products/${item.product_id}`)}
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
      </main>
    </div>
  );
}