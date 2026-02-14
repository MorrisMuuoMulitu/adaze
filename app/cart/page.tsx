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
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Scanline Effect */}
      <div className="fixed inset-0 bg-scanline opacity-[0.03] pointer-events-none z-50" />

      <Navbar onAuthClick={handleAuthClick} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        initialType={authModalType}
        onSuccess={handleCloseAuthModal}
      />
      <main className="flex-grow py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Editorial Header */}
            <div className="mb-20 border-b border-border/50 pb-12 flex flex-col md:flex-row justify-between items-end gap-8">
              <div>
                <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-4">
                  THE COLLECTION
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
                  Your <span className="text-muted-foreground/30 italic">Manifest.</span>
                </h1>
              </div>
              <div className="text-[10px] font-black tracking-widest uppercase text-muted-foreground/60">
                // {cartItems.length} {cartItems.length === 1 ? 'PIECE' : 'PIECES'} READY FOR DISPATCH
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-40 border border-border/30 bg-muted/5 group">
                <div className="relative w-16 h-16 mx-auto mb-8">
                  <ShoppingCartIcon className="w-full h-full text-accent/20" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-[-10px] inset-y-[-10px] border-t border-accent/20 rounded-full"
                  />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter mb-6 text-muted-foreground/40">Repository is currently empty</h2>
                <Button
                  onClick={() => router.push('/marketplace')}
                  className="btn-premium rounded-none h-14 px-12 text-[10px] font-black tracking-widest uppercase"
                >
                  Source New Pieces
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                <div className="lg:col-span-7 space-y-12">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-8 group pb-12 border-b border-border/20 last:border-0"
                    >
                      <div className="relative w-36 h-48 bg-muted overflow-hidden shrink-0 border border-border/50">
                        {item.product_image_url ? (
                          <Image
                            src={item.product_image_url}
                            alt={item.product_name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="text-[9px] font-black tracking-widest uppercase text-accent mb-1">Authentic Piece</div>
                              <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight">{item.product_name}</h2>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="w-10 h-10 flex items-center justify-center border border-border/50 hover:bg-destructive hover:text-white hover:border-destructive transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-xl font-black font-mono tracking-tighter text-muted-foreground/80">
                            KSH {item.product_price.toLocaleString()}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-8 mt-8">
                          <div className="flex items-center border border-border h-10 w-32">
                            <button
                              className="flex-1 h-full flex items-center justify-center hover:bg-muted font-black"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="w-10 text-[11px] font-black text-center font-mono border-x border-border">
                              {item.quantity.toString().padStart(2, '0')}
                            </span>
                            <button
                              className="flex-1 h-full flex items-center justify-center hover:bg-muted font-black"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <div className="text-[10px] font-black tracking-widest uppercase text-muted-foreground/40">
                            Manifest Subtotal // <span className="text-foreground font-mono">KSH {(item.product_price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="lg:col-span-5">
                  <div className="sticky top-32 p-10 border border-accent/20 bg-muted/5 relative backdrop-blur-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 -rotate-45 translate-x-16 -translate-y-16 pointer-events-none" />

                    <h3 className="text-[11px] font-black tracking-[0.4em] uppercase mb-10 pb-4 border-b border-border/30">Acquisition Summary</h3>

                    <div className="space-y-6 mb-10">
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span className="opacity-40">Original Value</span>
                        <span className="font-mono">KSH {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span className="opacity-40">System Logistics</span>
                        <span className="text-accent">Complimentary</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span className="opacity-40">Tax Adjustment</span>
                        <span className="font-mono">Inclusive</span>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-border flex justify-between items-end mb-12">
                      <div>
                        <div className="text-[9px] font-black tracking-widest uppercase opacity-40 mb-1">Total Payable</div>
                        <div className="text-3xl font-black tracking-tighter text-accent font-mono">KSH {subtotal.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <Button
                        className="btn-premium h-16 rounded-none text-[11px] font-black tracking-widest uppercase w-full shadow-2xl shadow-accent/10"
                        onClick={() => router.push('/checkout')}
                      >
                        Initiate Secure Acquisition
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-16 rounded-none text-[10px] font-black tracking-widest uppercase w-full border border-border/50 hover:bg-muted/50"
                        onClick={() => router.push('/marketplace')}
                      >
                        Return to Archive
                      </Button>
                    </div>

                    <div className="mt-8 text-[9px] font-bold uppercase tracking-[0.2em] opacity-30 text-center leading-relaxed">
                      Secure SSL Encryption • Verified Collective Asset • Insured Handover
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>

  );
}