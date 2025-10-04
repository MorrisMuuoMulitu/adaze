
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { orderService, Order, OrderWithDetails } from '@/lib/orderService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Package, MapPin, DollarSign, Calendar, User, CheckCircle, Truck, Clock, XCircle, ShoppingCart } from 'lucide-react';
import { ReviewModal } from '@/components/reviews/review-modal';
import { RetryPaymentButton } from '@/components/retry-payment-button';
import { toast } from 'sonner';

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<OrderWithDetails | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/'); // Redirect to home if not logged in
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      
      try {
        const userOrders = await orderService.getAllOrders({
          userId: user.id,
          role: 'buyer'
        });
        
        // Fetch detailed order items and related profiles
        const ordersWithDetails = (await Promise.all(userOrders.map(async (order) => {
          const detailedOrder = await orderService.getDetailedOrderById(order.id);
          if (!detailedOrder) {
            console.error('Error fetching detailed order for ID:', order.id);
            return null; // Return null if details fail
          }
          return detailedOrder;
        }))).filter(Boolean) as OrderWithDetails[]; // Filter out nulls and assert type

        setOrders(ordersWithDetails);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Set up Supabase Realtime listener for orders
    const ordersChannel = orderService.supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `buyer_id=eq.${user.id}` },
        (payload) => {
          const updatedOrder = payload.new as OrderWithDetails;
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
            )
          );
          toast.info(`Order ${updatedOrder.title} status updated to ${updatedOrder.status}`);
        }
      )
      .subscribe();

    return () => {
      ordersChannel.unsubscribe();
    };
  }, [user, router]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'in_transit':
        return 'destructive';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_transit':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <Package className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading orders...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please log in to view your orders.</div>;
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
              <h1 className="text-3xl font-bold">Your Orders</h1>
              <p className="text-muted-foreground">View your purchase history and track order status.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button onClick={() => router.push('/marketplace')}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">No orders found</h3>
              <p className="text-muted-foreground mt-2">You have not placed any orders yet.</p>
              <Button className="mt-4" onClick={() => router.push('/marketplace')}>
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{order.title}</CardTitle>
                      <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center gap-1 capitalize">
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>{order.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>KSh {order.amount.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-2" />
                        <span>Trader: {order.profiles?.full_name || 'N/A'}</span>
                      </div>

                      {order.transporters && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Truck className="h-4 w-4 mr-2" />
                          <span>Transporter: {order.transporters.full_name}</span>
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground">
                        <h4 className="font-semibold mb-1">Products:</h4>
                        {order.order_items.map((item, index) => (
                          <div key={index} className="flex justify-between text-xs pl-4">
                            <span>{item.products.name} (x{item.quantity})</span>
                            <span>KSh {(item.quantity * item.price_at_time).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>Shipping: {order.shipping_address}</span>
                      </div>
                      
                      {order.billing_address && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>Billing: {order.billing_address}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>

                      {/* Retry Payment Button for Pending Payments */}
                      {order.status === 'pending' && (
                        <div className="mt-4">
                          <RetryPaymentButton
                            orderId={order.id}
                            amount={order.amount}
                            orderStatus={order.status}
                            paymentStatus="pending"
                            onPaymentSuccess={() => {
                              // Refresh orders after payment
                              window.location.reload();
                            }}
                          />
                        </div>
                      )}

                      {order.status === 'delivered' && (
                        <Button 
                          className="w-full mt-4" 
                          onClick={() => {
                            setSelectedOrderForReview(order);
                            setShowReviewModal(true);
                          }}
                        >
                          Leave Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      {selectedOrderForReview && (
        <ReviewModal 
          isOpen={showReviewModal} 
          onClose={() => setShowReviewModal(false)} 
          order={selectedOrderForReview}
        />
      )}
    </div>
  );
}
