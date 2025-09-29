
"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { getCartItems, removeFromCart, updateCartItemQuantity, clearCart } from '@/lib/cart';
import { Product } from '@/types';
import { toast } from 'sonner';

interface CartItem extends Product {
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setCartItems(getCartItems());
  }, []);

  const handleRemoveItem = (productId: number) => {
    removeFromCart(productId);
    setCartItems(getCartItems());
    toast.info('Item removed from cart.');
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else {
      updateCartItemQuantity(productId, newQuantity);
      setCartItems(getCartItems());
    }
  };

  const handleClearCart = () => {
    clearCart();
    setCartItems([]);
    toast.info('Cart cleared.');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 0 ? 250 : 0; // Example flat shipping fee
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-background py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4"
      >
        <h1 className="text-3xl font-bold mb-8 text-center">Your Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground text-lg">Your cart is empty.</p>
              <Link href="/">
                <Button size="lg">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 flex items-center space-x-4">
                    <Image src={item.images[0]} alt={item.name} width={96} height={96} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-muted-foreground text-sm">KSh {item.price.toLocaleString()}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                          className="w-16 text-center"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="ml-auto"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={handleClearCart} className="w-full">
                Clear Cart
              </Button>
            </div>

            <Card className="lg:col-span-1 h-fit">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>KSh {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>KSh {shippingCost.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>KSh {total.toLocaleString()}</span>
                </div>
                <Link href="/payments">
                  <Button size="lg" className="w-full african-gradient text-white" onClick={() => {
                    localStorage.setItem('checkoutData', JSON.stringify({ cartItems, subtotal, shippingCost, total }));
                  }}>
                    Proceed to Checkout
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}
