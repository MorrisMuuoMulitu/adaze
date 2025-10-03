"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { cartService } from '@/lib/cartService';
import { productService, Product } from '@/lib/productService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Trash2, Plus, Minus, ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/navbar';
import { AuthModal } from '@/components/auth/auth-modal';

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Additional product info
  product_name: string;
  product_price: number;
  product_image_url: string | null;
}

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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

    const fetchCartItems = async () => {
      setLoading(true);
      try {
        const items = await cartService.getCartItems(user.id);
        setCartItems(items);
        setError(null);
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError('Failed to load cart items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [user]);

  const handleRemoveItem = async (cartItemId: string) => {
    if (!user) {
      toast.error('Please log in to manage your cart.');
      return;
    }
    try {
      await cartService.removeFromCart(cartItemId);
      setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
      toast.success('Item removed from cart!');
      window.dispatchEvent(new CustomEvent('cartUpdated')); // Notify Navbar
    } catch (err) {
      console.error('Error removing from cart:', err);
      toast.error('Failed to remove item from cart.');
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (!user) {
      toast.error('Please log in to manage your cart.');
      return;
    }
    if (newQuantity < 1) {
      handleRemoveItem(cartItemId);
      return;
    }
    try {
      await cartService.updateQuantity(cartItemId, newQuantity);
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success('Cart quantity updated!');
      window.dispatchEvent(new CustomEvent('cartUpdated')); // Notify Navbar
    } catch (err) {
      console.error('Error updating quantity:', err);
      toast.error('Failed to update item quantity.');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar onAuthClick={handleAuthClick} />
        <main className="flex-grow flex items-center justify-center">
          <div>Loading cart...</div>
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
              <CardTitle className="text-2xl">Your Shopping Cart</CardTitle>
              <CardDescription>Please log in to view your cart items.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ShoppingCartIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="mb-4">Log in to keep track of products you want to buy.</p>
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
              <CardDescription>Failed to load your cart.</CardDescription>
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
            <h1 className="text-3xl font-bold mb-8">Your Shopping Cart ({cartItems.length} items)</h1>

            {cartItems.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <ShoppingCartIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Your Cart is Empty</h2>
                  <p className="text-muted-foreground mb-6">
                    Looks like you haven&apos;t added any items to your cart yet.
                  </p>
                  <Button onClick={() => router.push('/marketplace')}>Start Shopping</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {cartItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4 flex items-center space-x-4">
                        <div className="relative w-24 h-24 flex-shrink-0">
                          {item.product_image_url ? (
                            <Image 
                              src={item.product_image_url} 
                              alt={item.product_name}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold">{item.product_name}</h2>
                          <p className="text-muted-foreground text-sm">KSh {item.product_price.toFixed(2)}</p>
                          <div className="flex items-center mt-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="mx-2 text-lg font-medium">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal ({cartItems.length} items)</span>
                        <span>KSh {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>KSh 0.00</span> {/* Placeholder for shipping cost */}
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>KSh {subtotal.toFixed(2)}</span>
                      </div>
                      <Button 
                        className="w-full african-gradient text-white hover:opacity-90 h-12"
                        onClick={() => router.push('/checkout')}
                      >
                        Proceed to Checkout
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}