"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { cartService, CartItem } from '@/lib/cartService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingCart, Package, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null); // Track which item is being updated

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const items = await cartService.getCartItems(user.id);
        setCartItems(items);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [user, router]);

  const updateQuantity = async (cartId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      return removeFromCart(cartId);
    }

    setUpdating(cartId);
    
    try {
      const updatedItem = await cartService.updateQuantity(cartId, newQuantity);
      if (updatedItem) {
        setCartItems(prev => 
          prev.map(item => 
            item.id === cartId ? updatedItem : item
          )
        );
        
        toast.success(`Quantity updated to ${newQuantity}`);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeFromCart = async (cartId: string) => {
    try {
      const success = await cartService.removeFromCart(cartId);
      if (success) {
        setCartItems(prev => prev.filter(item => item.id !== cartId));
        toast.success('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const clearCart = async () => {
    try {
      const success = await cartService.clearCart(user?.id || '');
      if (success) {
        setCartItems([]);
        toast.success('Cart cleared');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const checkout = () => {
    router.push('/checkout');
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + ((item.product_price || 0) * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading cart...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please log in to view your cart.</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Your Shopping Cart
              </h1>
              <p className="text-muted-foreground">Review and manage your items</p>
            </div>
            {cartItems.length > 0 && (
              <div className="mt-4 md:mt-0 flex gap-2">
                <Button variant="outline" onClick={clearCart}>
                  Clear Cart
                </Button>
                <Button onClick={() => router.push('/marketplace')}>
                  Continue Shopping
                </Button>
              </div>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground mt-2">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button className="mt-6" onClick={() => router.push('/marketplace')}>
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="flex items-center p-4">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
                      {item.product_image_url ? (
                        <img 
                          src={item.product_image_url} 
                          alt={item.product_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-grow">
                      <h3 className="font-semibold">{item.product_name}</h3>
                      <p className="text-sm text-muted-foreground">KSh {(item.product_price || 0).toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="w-10 text-center">
                        {updating === item.id ? '...' : item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="ml-4 w-24 text-right font-semibold">
                      KSh {((item.product_price || 0) * item.quantity).toFixed(2)}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>
                      Review your order details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal ({totalItems} items)</span>
                        <span className="font-medium">KSh {(totalAmount || 0).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="font-medium">KSh {((totalAmount || 0) * 0.1).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>KSh {((totalAmount || 0) + (totalAmount || 0) * 0.1).toFixed(2)}</span>
                      </div>
                      
                      <Button 
                        className="w-full mt-6" 
                        onClick={checkout}
                        size="lg"
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        Proceed to Checkout
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => router.push('/marketplace')}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Continue Shopping
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}