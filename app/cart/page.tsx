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
        <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-background via-muted/20 to-background">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium text-muted-foreground">Loading your cart...</p>
          </motion.div>
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
      <main className="flex-grow py-12 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Enhanced Header */}
            <div className="mb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-4"
              >
                <ShoppingCartIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Your Shopping Bag
                </span>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Shopping Cart
                {cartItems.length > 0 && <span className="text-primary ml-3">({cartItems.length})</span>}
              </h1>
            </div>

            {cartItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="text-center py-16 bg-gradient-to-br from-background to-muted/20 border-2 border-dashed border-muted-foreground/20 shadow-xl">
                  <CardContent>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="mb-6"
                    >
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                        <ShoppingCartIcon className="h-12 w-12 text-primary" />
                      </div>
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Your Cart is Empty</h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                      Looks like you haven&apos;t added any items to your cart yet. Start exploring our amazing collection!
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => router.push('/marketplace')}
                        size="lg"
                        className="h-14 px-10 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
                      >
                        <Package className="h-5 w-5 mr-2" />
                        Start Shopping
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-muted-foreground/10">
                        <CardContent className="p-5 flex items-center space-x-5">
                          <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden">
                            {item.product_image_url ? (
                              <Image
                                src={item.product_image_url}
                                alt={item.product_name}
                                width={112}
                                height={112}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                <Package className="h-14 w-14 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold truncate mb-1">{item.product_name}</h2>
                            <p className="text-primary font-semibold text-xl mb-3">KSh {item.product_price.toFixed(2)}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border-2 border-muted-foreground/20 rounded-lg overflow-hidden">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="px-3 py-2 hover:bg-muted transition-colors"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </motion.button>
                                <span className="px-4 py-2 font-bold min-w-[3rem] text-center bg-muted/30">{item.quantity}</span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="px-3 py-2 hover:bg-muted transition-colors"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </motion.button>
                              </div>
                              <span className="text-sm text-muted-foreground font-medium">
                                Subtotal: <span className="text-foreground font-bold">KSh {(item.product_price * item.quantity).toFixed(2)}</span>
                              </span>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-700 transition-colors"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </motion.button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="lg:col-span-1"
                >
                  <Card className="sticky top-24 shadow-xl border-2">
                    <CardHeader className="bg-gradient-to-br from-muted/50 to-background pb-4">
                      <CardTitle className="text-2xl font-black">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                        <span className="font-semibold">KSh {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-semibold text-green-600">FREE</span>
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">KSh {subtotal.toFixed(2)}</span>
                      </div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 text-base"
                          onClick={() => router.push('/checkout')}
                        >
                          Proceed to Checkout
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full h-12 border-2 font-semibold hover:bg-muted"
                          onClick={() => router.push('/marketplace')}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Continue Shopping
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}