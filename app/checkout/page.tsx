"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { cartService, CartItem } from '@/lib/cartService';
import { orderService } from '@/lib/orderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, Package, Check, Home, User, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const [processing, setProcessing] = useState(false);

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
        toast.error('Failed to load cart items');
        router.push('/cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [user, router]);

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      toast.error('Please enter a shipping address');
      return;
    }

    setProcessing(true);

    try {
      const order = await orderService.createOrderFromCart(
        user?.id || '',
        shippingAddress,
        useDifferentBilling ? billingAddress : shippingAddress
      );

      if (order) {
        toast.success('Order placed successfully!');
        router.push(`/order-confirmation?orderId=${order.id}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  const shippingCost = totalAmount * 0.1;
  const grandTotal = totalAmount + shippingCost;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading checkout...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please log in to checkout.</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Your cart is empty</h3>
          <p className="text-muted-foreground mt-2">
            Add items to your cart before checking out.
          </p>
          <Button className="mt-4" onClick={() => router.push('/marketplace')}>
            Start Shopping
          </Button>
        </div>
      </div>
    );
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
                <CreditCard className="h-6 w-6" />
                Checkout
              </h1>
              <p className="text-muted-foreground">Complete your purchase</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shipping & Billing Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                  <CardDescription>Where should we deliver your order?</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your full shipping address..."
                    rows={4}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Billing Address
                    </CardTitle>
                    <CardDescription>Same as shipping address?</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">No</span>
                    <button
                      onClick={() => setUseDifferentBilling(!useDifferentBilling)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        useDifferentBilling ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useDifferentBilling ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-sm">Yes</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {useDifferentBilling && (
                    <Textarea
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      placeholder="Enter your billing address..."
                      rows={4}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center pb-2 border-b">
                        <div>
                          <h4 className="font-medium">{item.product_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × KSh {item.product_price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium">KSh {(item.product_price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}

                    <div className="pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>KSh {totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>KSh {shippingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>KSh {grandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-6" 
                      onClick={handleCheckout}
                      disabled={processing || !shippingAddress.trim()}
                      size="lg"
                    >
                      {processing ? (
                        <div className="flex items-center">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          Place Order
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}