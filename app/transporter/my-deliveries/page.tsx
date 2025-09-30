
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrderWithDetails extends Order {
    profiles: { full_name: string } | null; // Trader's profile
    order_items: {
        quantity: number;
        products: {
            name: string;
        };
    }[];
}

export default function MyDeliveriesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [myDeliveries, setMyDeliveries] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchMyDeliveries = async () => {
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
        .eq('transporter_id', user.id)
        .not('status', 'in', '("delivered", "cancelled")'); // Orders not yet delivered or cancelled

      if (error) {
        toast.error("Failed to fetch your deliveries", { description: error.message });
      } else {
        setMyDeliveries(data as OrderWithDetails[]);
      }
      setLoading(false);
    };

    fetchMyDeliveries();

    // Set up Supabase Realtime listener for orders
    const ordersChannel = orderService.supabase
      .channel('transporter_deliveries_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `transporter_id=eq.${user.id}` },
        async (payload) => {
          const updatedOrder = payload.new as Order;
          // Re-fetch detailed order to get nested data
          const detailedUpdatedOrder = await orderService.getDetailedOrderById(updatedOrder.id);
          if (detailedUpdatedOrder) {
            setMyDeliveries(prevDeliveries => 
              prevDeliveries.map(delivery => 
                delivery.id === detailedUpdatedOrder.id ? detailedUpdatedOrder : delivery
              )
            );
            toast.info(`Delivery ${detailedUpdatedOrder.title} status updated to ${detailedUpdatedOrder.status}`);
          }
        }
      )
      .subscribe();

    return () => {
      ordersChannel.unsubscribe();
    };
  }, [user, router, supabase]);

  const handleUpdateDeliveryStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await orderService.updateOrder(orderId, { status: newStatus });
      setMyDeliveries(prevDeliveries => 
        prevDeliveries.map(delivery => 
          delivery.id === orderId ? { ...delivery, status: newStatus } : delivery
        )
      );
      toast.success(`Delivery ${orderId} status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error("Failed to update delivery status", { description: error.message });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading your deliveries...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>My Deliveries</CardTitle>
            <CardDescription>Deliveries assigned to you and currently in progress.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Title</TableHead>
                  <TableHead>Trader</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Shipping Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myDeliveries.map((order) => (
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
                    <TableCell>{order.shipping_address}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Update Status
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          {['picked_up', 'in_transit', 'delivered'].map(statusOption => (
                            <DropdownMenuItem 
                              key={statusOption} 
                              onClick={() => handleUpdateDeliveryStatus(order.id, statusOption as Order['status'])}
                              disabled={order.status === 'delivered' || order.status === 'cancelled'}
                            >
                              {statusOption.replace('_', ' ').charAt(0).toUpperCase() + statusOption.replace('_', ' ').slice(1)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
