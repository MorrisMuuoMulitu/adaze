"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { orderService, Order } from '@/lib/orderService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Package, MapPin, DollarSign, Calendar, Truck, CheckCircle, Clock, XCircle, Navigation } from 'lucide-react';
import { toast } from 'sonner';

export default function TransporterDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransporterOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const transporterOrders = await orderService.getAllOrders({
        userId: user.id,
        role: 'transporter'
      });
      setOrders(transporterOrders);
    } catch (error) {
      console.error('Error fetching transporter orders:', error);
      toast.error('Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'TRANSPORTER') {
        router.push('/');
        return;
      }
      fetchTransporterOrders();
    }
  }, [user, authLoading, router, fetchTransporterOrders]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'in_transit': return 'destructive';
      case 'delivered': return 'default';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      await orderService.completeOrder(orderId);
      toast.success('Order marked as delivered!');
      fetchTransporterOrders();
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      toast.error('Failed to update order status.');
    }
  };

  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading transporter terminal...</div>;
  }

  if (!user) return null;

  const activeOrders = orders.filter(order => order.status === 'in_transit');
  const completedOrders = orders.filter(order => order.status === 'delivered');

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Transporter Terminal</h1>
            <Badge variant="secondary" className="capitalize text-lg px-3 py-1">Transporter</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed Sorties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Estimated Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KSh {activeOrders.reduce((sum, o) => sum + Number(o.amount), 0).toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Truck className="h-6 w-6" /> Active Deliveries
              </h2>
              {activeOrders.length === 0 ? (
                <div className="p-8 border border-dashed text-center text-muted-foreground">No active missions.</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {activeOrders.map(order => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{order.title}</CardTitle>
                          <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center text-sm"><MapPin className="h-4 w-4 mr-2" /> {order.shipping_address}</div>
                        <Button className="w-full" onClick={() => handleMarkDelivered(order.id)}>Mark Delivered</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
