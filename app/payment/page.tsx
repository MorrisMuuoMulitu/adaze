"use client";

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { orderService, Order } from '@/lib/orderService';
import PaymentForm from '@/components/PaymentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, MapPin, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

function PaymentPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/'); // Redirect to home if not logged in
      return;
    }

    if (!orderId) {
      toast.error('Order ID is required');
      router.push('/orders');
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const foundOrder = await orderService.getOrderById(orderId);
        if (!foundOrder) {
          toast.error('Order not found');
          router.push('/orders');
          return;
        }

        // Verify the user is the buyer of this order
        if (foundOrder.buyer_id !== user.id) {
          toast.error('You are not authorized to pay for this order');
          router.push('/orders');
          return;
        }

        setOrder(foundOrder);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, router, orderId]);

  const handlePaymentSuccess = (result: any) => {
    setPaymentSuccess(true);
    
    // In a real app, you'd update the order status to paid
    // and potentially trigger the next steps in the workflow
    toast.success('Payment successful! The trader will be notified.');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading payment details...</div>;
  }

  if (!user || !order) {
    return <div className="min-h-screen flex items-center justify-center">Please log in to view this page.</div>;
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-2xl mt-4">Payment Successful!</CardTitle>
                <CardDescription>
                  Your order has been confirmed and payment processed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-6">
                  The trader will be notified and will process your order shortly.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => router.push('/orders')}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                  >
                    View My Orders
                  </button>
                  <button 
                    onClick={() => router.push('/marketplace')}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Browse More Orders
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Complete Your Payment</h1>
              <p className="text-muted-foreground">Securely pay for your order</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Order #{order.id.substring(0, 8)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PaymentForm 
                orderId={order.id} 
                amount={order.amount} 
                onSuccess={handlePaymentSuccess} 
              />
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-medium">#{order.id.substring(0, 8)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Order Title:</span>
                    <span className="font-medium truncate max-w-[150px]">{order.title}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium text-lg">${order.amount}</span>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-start text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                      <div>
                        <div className="font-medium">Shipping Address:</div>
                        <div>{order.shipping_address}</div>
                      </div>
                    </div>
                    
                    {order.billing_address && (
                      <div className="flex items-start text-sm text-muted-foreground mt-3">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                        <div>
                          <div className="font-medium">Billing Address:</div>
                          <div>{order.billing_address}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-muted-foreground mt-3">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Created: {new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Secure Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your payment information is securely processed. We use industry-standard encryption to protect your data.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}