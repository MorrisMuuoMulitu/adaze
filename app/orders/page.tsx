"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { orderService, Order } from '@/lib/orderService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Package, MapPin, DollarSign, Calendar, User, CheckCircle, Truck, Clock, XCircle } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'buyer' | 'trader' | 'transporter' | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/'); // Redirect to home if not logged in
      return;
    }

    const fetchRoleAndOrders = async () => {
      setLoading(true);
      
      try {
        // Get user's role from their profile
        const supabase = (await import('@/lib/supabase/client')).createClient();
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setRole(profile.role as 'buyer' | 'trader' | 'transporter');
        
        // For traders, redirect to marketplace since they might want to browse orders
        if (profile.role === 'trader') {
          router.push('/marketplace');
          return;
        }
        
        // Fetch orders based on user role (for buyers and transporters)
        const userOrders = await orderService.getAllOrders({
          userId: user.id,
          role: profile.role as 'buyer' | 'trader' | 'transporter'
        });
        
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching role and orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleAndOrders();
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

  const handleOrderAction = async (orderId: string, action: string) => {
    try {
      let updatedOrder: Order | null = null;
      
      switch (action) {
        case 'accept':
          if (role === 'trader') {
            updatedOrder = await orderService.assignOrderToTrader(orderId, user?.id || '');
          }
          break;
        case 'assign_transporter':
          if (role === 'trader') {
            // In a real app, this would show a list of available transporters
            // For now, we'll just update the status
            updatedOrder = await orderService.assignOrderToTransporter(orderId, user?.id || '');
          }
          break;
        case 'mark_delivered':
          if (role === 'transporter') {
            updatedOrder = await orderService.completeOrder(orderId);
          }
          break;
      }
      
      if (updatedOrder) {
        // Update the order in the local state
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId ? updatedOrder! : order
          )
        );
      }
    } catch (error) {
      console.error('Error performing order action:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading orders...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please log in to view your orders.</div>;
  }

  // This should not render if user is trader (they get redirected)
  if (role === 'trader') {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
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
              <p className="text-muted-foreground">Manage your orders based on your role: {role}</p>
            </div>
            <div className="mt-4 md:mt-0">
              {role === 'buyer' && (
                <Button onClick={() => router.push('/orders/create')}>
                  Create New Order
                </Button>
              )}
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">No orders found</h3>
              <p className="text-muted-foreground mt-2">
                {role === 'buyer'
                  ? 'You have not created any orders yet.'
                  : 'No orders are assigned to you for delivery yet.'}
              </p>
              {role === 'buyer' && (
                <Button className="mt-4" onClick={() => router.push('/orders/create')}>
                  Create Your First Order
                </Button>
              )}
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

                      {/* Role-specific action buttons */}
                      {role === 'transporter' && 
                        order.status === 'in_transit' && 
                        order.transporter_id === user?.id && (
                        <Button 
                          className="w-full mt-4" 
                          onClick={() => handleOrderAction(order.id, 'mark_delivered')}
                        >
                          Mark as Delivered
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
    </div>
  );
}