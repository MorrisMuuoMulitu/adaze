"use client";

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { orderService, Order } from '@/lib/orderService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, MapPin, CreditCard, CheckCircle, Home, Clock } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { AuthModal } from '@/components/auth/auth-modal';

function OrderConfirmationContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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
      router.push('/');
      return;
    }

    if (!orderId) {
      router.push('/cart');
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(orderId);
        if (orderData) {
          setOrder(orderData);
        } else {
          router.push('/orders');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, router, orderId]);

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
        <div className="flex items-center justify-center py-12">
          Loading order confirmation...
        </div>
      </div>
    );
  }

  if (!user || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onAuthClick={handleAuthClick} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleCloseAuthModal}
          initialType={authModalType}
          onSuccess={handleCloseAuthModal}
        />
        <div className="flex items-center justify-center py-12">
          Order not found.
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
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <div className="mx-auto bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mt-4">Order Confirmed!</h1>
              <p className="text-muted-foreground mt-2">
                Thank you for your order. Your order ID is <strong>#{order.id.substring(0, 8)}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="capitalize">
                    {order.status}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Total Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">KSh {order.amount.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Order Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{new Date(order.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{order.shipping_address}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span>#{order.id.substring(0, 8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="secondary" className="capitalize">
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">KSh {order.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.push('/orders')}>
                View Order History
              </Button>
              <Button variant="outline" onClick={() => router.push('/marketplace')}>
                Continue Shopping
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}