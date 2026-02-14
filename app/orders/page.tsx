
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
import { Navbar } from '@/components/layout/navbar';
import { AuthModal } from '@/components/auth/auth-modal';

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<OrderWithDetails | null>(null);

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
          Loading orders...
        </div>
      </div>
    );
  }

  if (!user) {
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
          Please log in to view your orders.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onAuthClick={handleAuthClick} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        initialType={authModalType}
        onSuccess={handleCloseAuthModal}
      />

      <main className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Minimalist Header */}
            <div className="mb-16 border-b border-border/50 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div>
                <div className="text-[10px] font-black tracking-[0.3em] uppercase text-accent mb-2">
                  PURCHASE HISTORY
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
                  Orders<span className="text-muted-foreground/30">.</span>
                </h1>
              </div>
              <Button
                onClick={() => router.push('/marketplace')}
                className="btn-premium rounded-none h-14 px-8 text-[10px] font-black tracking-widest uppercase"
              >
                Continue Shopping
              </Button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-32 border border-dashed border-border/50">
                <Package className="h-12 w-12 mx-auto mb-6 text-muted-foreground/30" />
                <h2 className="text-lg font-bold uppercase tracking-widest mb-4 text-muted-foreground">No orders yet</h2>
                <Button
                  onClick={() => router.push('/marketplace')}
                  className="btn-premium rounded-none h-14 px-10 text-[10px] font-black tracking-widest uppercase"
                >
                  Start Your Collection
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    className="border border-border/50 bg-muted/5 p-6 flex flex-col gap-6"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] font-black tracking-widest text-muted-foreground mb-1">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-tight">{order.title}</h3>
                      </div>
                      <div className={`text-[9px] font-black tracking-[0.2em] uppercase py-1 px-3 border border-current ${order.status === 'delivered' ? 'text-green-500' :
                          order.status === 'pending' ? 'text-accent' :
                            'text-muted-foreground'
                        }`}>
                        {order.status.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end border-b border-border/30 pb-4">
                        <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Total Amount</div>
                        <div className="text-xl font-black tracking-tighter">KSH {order.amount.toLocaleString()}</div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">Items</div>
                        {order.order_items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] font-bold">
                            <span className="uppercase">{item.products.name} <span className="text-muted-foreground/50">×{item.quantity}</span></span>
                            <span>KSH {(item.quantity * item.price_at_time).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-border/30 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                          <User className="h-3 w-3" />
                          <span>Trader: {order.profiles?.full_name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-4">
                      {order.status === 'pending' && (
                        <RetryPaymentButton
                          orderId={order.id}
                          amount={order.amount}
                          orderStatus={order.status}
                          paymentStatus="pending"
                          onPaymentSuccess={() => window.location.reload()}
                        />
                      )}

                      {order.status === 'delivered' && (
                        <Button
                          className="w-full h-12 rounded-none text-[10px] font-black tracking-widest uppercase btn-premium"
                          onClick={() => {
                            setSelectedOrderForReview(order);
                            setShowReviewModal(true);
                          }}
                        >
                          LEAVE REVIEW
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

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
