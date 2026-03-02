
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/components/auth/auth-provider';
import { cartService } from '@/lib/cartService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MpesaPaymentButton } from '@/components/mpesa-payment-button';
import { Package, ArrowLeft, MapPin, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/navbar';
import { AuthModal } from '@/components/auth/auth-modal';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product_name: string;
  product_price: number;
  product_image_url: string | null;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Delivery details
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Auth modal state
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
      toast.error('Please log in to checkout');
      router.push('/');
      return;
    }

    const fetchCartItems = async () => {
      try {
        const items = await cartService.getCartItems(user.id);
        if (items.length === 0) {
          toast.error('Your cart is empty');
          router.push('/cart');
          return;
        }
        setCartItems(items);
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [user, router]);

  const total = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);

  const handleCreateOrder = async () => {
    if (!user) {
      toast.error('Please log in');
      return;
    }
    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error('Please enter phone number');
      return;
    }

    setCreatingOrder(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: deliveryAddress,
          phoneNumber,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create order');
      }

      const result = await res.json();

      // If single order, set it for payment
      if (result.orderId) {
        setOrderId(result.orderId);
        toast.success('Order created! Complete payment below.');
      } else {
        // Multiple orders - redirect to orders page
        toast.success(`${result.orders.length} orders created!`);
        router.push('/orders');
      }
      
      // Notify Navbar to refresh cart count
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order: ' + error.message);
    } finally {
      setCreatingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onAuthClick={handleAuthClick} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleCloseAuthModal}
          initialType={authModalType}
          onSuccess={handleCloseAuthModal}
        />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAuthClick={handleAuthClick} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        initialType={authModalType}
        onSuccess={handleCloseAuthModal}
      />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => router.push('/cart')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Delivery Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Details
                </CardTitle>
                <CardDescription>Enter your delivery information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0712 345 678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10"
                      disabled={!!orderId}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={3}
                    disabled={!!orderId}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for delivery?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    disabled={!!orderId}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Items Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      {item.product_image_url ? (
                        <Image
                          src={item.product_image_url}
                          alt={item.product_name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center rounded">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">KSh {(item.product_price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Order Summary & Payment */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>KSh {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>KSh {total.toLocaleString()}</span>
                  </div>
                </div>

                {!orderId ? (
                  <Button
                    className="w-full african-gradient text-white"
                    size="lg"
                    onClick={handleCreateOrder}
                    disabled={creatingOrder || !deliveryAddress || !phoneNumber}
                  >
                    {creatingOrder ? 'Creating Order...' : 'Create Order'}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800 font-medium">✅ Order Created!</p>
                      <p className="text-xs text-green-600 mt-1">Complete payment below</p>
                    </div>

                    <MpesaPaymentButton
                      orderId={orderId}
                      amount={total}
                      onSuccess={() => {
                        toast.success('Payment successful!');
                        router.push(`/orders`);
                      }}
                      onError={(error) => {
                        toast.error('Payment failed', { description: error });
                      }}
                    />

                    <p className="text-xs text-center text-muted-foreground">
                      Secure payment via M-Pesa
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
