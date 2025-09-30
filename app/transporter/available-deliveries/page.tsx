
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { orderService, Order } from '@/lib/orderService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Package, MapPin, DollarSign, Calendar } from 'lucide-react';

interface OrderWithDetails extends Order {
    profiles: { full_name: string } | null; // Trader's profile
    order_items: {
        quantity: number;
        products: {
            name: string;
        };
    }[];
}

export default function AvailableDeliveriesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [availableOrders, setAvailableOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchAvailableOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:trader_id (full_name),
          order_items (
            quantity,
            products (
              name
            )
          )
        `)
        .eq('status', 'confirmed') // Orders ready for pickup
        .is('transporter_id', null); // Not yet assigned to a transporter

      if (error) {
        toast.error("Failed to fetch available deliveries", { description: error.message });
      } else {
        setAvailableOrders(data as OrderWithDetails[]);
      }
      setLoading(false);
    };

    fetchAvailableOrders();

    // Set up Supabase Realtime listener for orders
    const ordersChannel = orderService.supabase
      .channel('available_deliveries_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' }, // Listen for all events
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const order = payload.new as Order;
            // Check if the order is confirmed and not assigned to a transporter
            if (order.status === 'confirmed' && order.transporter_id === null) {
              const detailedOrder = await orderService.getDetailedOrderById(order.id);
              if (detailedOrder) {
                setAvailableOrders(prevOrders => {
                  // Add if new, update if existing
                  const exists = prevOrders.some(o => o.id === detailedOrder.id);
                  if (!exists) {
                    toast.info(`New delivery available: ${detailedOrder.title}`);
                    return [...prevOrders, detailedOrder];
                  }
                  return prevOrders.map(o => o.id === detailedOrder.id ? detailedOrder : o);
                });
              }
            } else {
              // If order is no longer available (e.g., accepted by another transporter, status changed)
              setAvailableOrders(prevOrders => prevOrders.filter(o => o.id !== order.id));
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedOrder = payload.old as Order;
            setAvailableOrders(prevOrders => prevOrders.filter(o => o.id !== deletedOrder.id));
          }
        }
      )
      .subscribe();

    return () => {
      ordersChannel.unsubscribe();
    };
  }, [user, router, supabase]);

  const handleAcceptDelivery = async (orderId: string) => {
    if (!user) {
      toast.error("You must be logged in to accept deliveries.");
      return;
    }

    try {
      await orderService.assignOrderToTransporter(orderId, user.id);
      setAvailableOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      toast.success(`Delivery ${orderId} accepted!`);
    } catch (error: any) {
      toast.error("Failed to accept delivery", { description: error.message });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading available deliveries...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Available Deliveries</CardTitle>
            <CardDescription>Orders ready for pickup and awaiting a transporter.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Title</TableHead>
                  <TableHead>Trader</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Shipping Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.title}</TableCell>
                    <TableCell>{order.profiles?.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      {order.order_items.map((item, index) => (
                        <div key={index}>
                          {item.products.name} (x{item.quantity})
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>KSh {order.amount.toFixed(2)}</TableCell>
                    <TableCell>{order.shipping_address}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleAcceptDelivery(order.id)}>Accept Delivery</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
