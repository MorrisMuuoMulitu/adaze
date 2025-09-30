"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { orderService, Order } from '@/lib/orderService';
import { realtimeOrderService } from '@/lib/realtimeService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Package, MapPin, DollarSign, Calendar, User, CheckCircle, Truck, Clock, XCircle, Navigation, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function TransporterDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/'); // Redirect to home if not logged in
      return;
    }

    const fetchTransporterOrders = async () => {
      setLoading(true);
      
      try {
        // Get user's profile to confirm role
        const supabase = (await import('@/lib/supabase/client')).createClient();
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (profile.role !== 'transporter') {
          // Redirect non-transporters
          router.push('/dashboard');
          return;
        }
        
        // Get orders assigned to this transporter
        const transporterOrders = await orderService.getAllOrders({
          userId: user.id,
          role: 'transporter'
        });
        
        setOrders(transporterOrders);
      } catch (error) {
        console.error('Error fetching transporter orders:', error);
        toast.error('Failed to load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransporterOrders();
  }, [user, router]);

  // Set up real-time subscription for transporter orders
  useEffect(() => {
    if (user && isRealtimeActive) {
      // Subscribe to order updates for this transporter
      subscriptionRef.current = realtimeOrderService.subscribeToOrderChanges(
        user.id,
        (updatedOrder) => {
          setOrders(prevOrders => {
            // Update the specific order in the list
            const exists = prevOrders.some(order => order.id === updatedOrder.id);
            
            if (exists) {
              // Update existing order
              return prevOrders.map(order => 
                order.id === updatedOrder.id ? updatedOrder : order
              );
            } else {
              // Add new order if it matches transporter's role context
              return [...prevOrders, updatedOrder];
            }
          });
        },
        (error) => {
          console.error('Realtime subscription error:', error);
        }
      );
    }

    // Clean up subscription when component unmounts
    return () => {
      if (subscriptionRef.current) {
        realtimeOrderService.unsubscribe();
      }
    };
  }, [user, isRealtimeActive]);

  const toggleRealtime = () => {
    setIsRealtimeActive(!isRealtimeActive);
    if (isRealtimeActive) {
      // If turning off, unsubscribe
      realtimeOrderService.unsubscribe();
    } else {
      // If turning on, reset and resubscribe (effect will handle this)
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'in_transit':
        return 'destructive';
      case 'delivered':
        return 'default'; // Changed from 'success' to 'default'
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

  const handleMarkDelivered = async (orderId: string) => {
    try {
      const updatedOrder = await orderService.completeOrder(orderId);
      
      if (updatedOrder) {
        // The order will be automatically updated via real-time subscription
        toast.success('Order marked as delivered!');
      }
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      toast.error('Failed to update order status. Please try again.');
    }
  };

  const handleNavigate = (location: string) => {
    // In a real app, this would open maps
    alert(`Navigation to: ${location}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading your dashboard...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please log in to view your dashboard.</div>;
  }

  // Get active orders (in transit) and completed orders
  const activeOrders = orders.filter(order => order.status === 'in_transit');
  const completedOrders = orders.filter(order => order.status === 'delivered');

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
              <h1 className="text-3xl font-bold">Transporter Dashboard</h1>
              <p className="text-muted-foreground">Manage your delivery assignments</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleRealtime}
                className="flex items-center gap-2"
              >
                <div className={`h-3 w-3 rounded-full ${isRealtimeActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                {isRealtimeActive ? 'Real-time ON' : 'Real-time OFF'}
              </Button>
              <Badge variant="secondary" className="capitalize text-lg px-3 py-1">
                Transporter
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeOrders.length}</div>
                <p className="text-xs text-muted-foreground">Currently in transit</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedOrders.length}</div>
                <p className="text-xs text-muted-foreground">Delivered this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${activeOrders.reduce((sum, order) => sum + order.amount, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">From active deliveries</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Deliveries Section */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Active Deliveries
              </h2>
              <span className="text-sm text-muted-foreground">
                {isRealtimeActive ? (
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    Live Updates
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-500">
                    <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                    Updates Paused
                  </span>
                )}
              </span>
            </div>
            
            {activeOrders.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No active deliveries</h3>
                <p className="text-muted-foreground mt-2">
                  You don't have any orders in transit right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeOrders.map((order) => (
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
                          <span>${order.amount}</span>
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

                        <div className="flex flex-col gap-2 pt-2">
                          <Button 
                            className="w-full" 
                            onClick={() => handleNavigate(order.shipping_address)}
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Navigate to Pickup
                          </Button>
                          <Button 
                            className="w-full" 
                            onClick={() => handleNavigate(order.billing_address || order.shipping_address)}
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Navigate to Delivery
                          </Button>
                          <Button 
                            className="w-full" 
                            variant="default"
                            onClick={() => handleMarkDelivered(order.id)}
                          >
                            Mark as Delivered
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Completed Deliveries Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Completed Deliveries</h2>
            
            {completedOrders.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No completed deliveries</h3>
                <p className="text-muted-foreground mt-2">
                  You haven't completed any deliveries yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden opacity-80">
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
                          <span>${order.amount}</span>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}