"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/components/auth/auth-provider';
import { cartService, CartItem } from '@/lib/cartService';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingCart, Package, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface CartSidebarProps {
  cartCount: number;
  onCartUpdate: (count: number) => void;
}

export function CartSidebar({ cartCount, onCartUpdate }: CartSidebarProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCartItems = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const items = await cartService.getCartItems(user.id);
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      fetchCartItems();
    }
  }, [isOpen, user, fetchCartItems]);

  useEffect(() => {
    // Listen for cart updates
    const handleCartUpdate = () => {
      if (user) {
        fetchCartItems();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user, fetchCartItems]);

  const updateQuantity = async (cartId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      return removeFromCart(cartId);
    }
    
    try {
      const updatedItem = await cartService.updateQuantity(cartId, newQuantity);
      if (updatedItem) {
        setCartItems(prev => 
          prev.map(item => 
            item.id === cartId ? updatedItem : item
          )
        );
        
        // Update cart count
        const count = await cartService.getCartCount(user?.id || '');
        onCartUpdate(count);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeFromCart = async (cartId: string) => {
    try {
      const success = await cartService.removeFromCart(cartId);
      if (success) {
        setCartItems(prev => prev.filter(item => item.id !== cartId));
        
        // Update cart count
        const count = await cartService.getCartCount(user?.id || '');
        onCartUpdate(count);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        toast.success('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 h-full flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p>Loading cart...</p>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Add some items to your cart and they&apos;ll appear here
              </p>
              <Button onClick={() => setIsOpen(false)} asChild>
                <Link href="/marketplace">
                  Start Shopping
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                        {item.product_image_url ? (
                          <Image 
                            src={item.product_image_url} 
                            alt={item.product_name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-grow">
                        <h4 className="font-medium text-sm line-clamp-2">{item.product_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          KSh {(item.product_price || 0).toFixed(2)}
                        </p>
                        
                        <div className="flex items-center mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="mx-2 text-sm w-8 text-center">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 ml-2"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="ml-4 text-right">
                        <p className="font-medium">
                          KSh {((item.product_price || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="border-t pt-4 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-medium">KSh {totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span>KSh {totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsOpen(false)}
                    >
                      Continue Shopping
                    </Button>
                    <Button 
                      className="flex-1"
                      asChild
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/cart">
                        Checkout
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}