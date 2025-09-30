
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Order, orderService } from '@/lib/orderService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  location: string;
  avatar_url: string;
  role: 'buyer' | 'trader' | 'transporter';
}

interface OrderWithDetails extends Order {
    profiles: { full_name: string } | null; // Trader's profile
    order_items: {
        quantity: number;
        products: {
            name: string;
        };
    }[];
}

export default function ReceivedOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [transporters, setTransporters] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await orderService.updateOrder(orderId, { status: newStatus });
      
      // If order is confirmed, try to auto-assign a transporter
      if (newStatus === 'confirmed') {
        await orderService.autoAssignTransporter(orderId);
      }
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error("Failed to update order status", { description: error.message });
    }
  };

  const handleAssignTransporter = async (orderId: string, transporterId: string) => {
    try {
      await orderService.assignOrderToTransporter(orderId, transporterId);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, transporter_id: transporterId, status: 'in_transit' } : order
        )
      );
      toast.success(`Transporter assigned to order ${orderId}`);
    } catch (error: any) {
      toast.error("Failed to assign transporter", { description: error.message });
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:buyer_id (full_name),
          order_items (
            quantity,
            products (
              name
            )
          )
        `)
        .eq('trader_id', user.id);

      if (error) {
        toast.error("Failed to fetch orders", { description: error.message });
      } else {
        setOrders(data as OrderWithDetails[]);
      }
      setLoading(false);
    };

    const fetchTransporters = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, location')
        .eq('role', 'transporter');

      if (error) {
        console.error('Error fetching transporters:', error);
      } else {
        setTransporters(data as Profile[]);
      }
    };

    fetchOrders();
    fetchTransporters();

    // Set up Supabase Realtime listener for orders
    const ordersChannel = orderService.supabase
      .channel('trader_orders_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `trader_id=eq.${user.id}` },
        async (payload) => {
          const updatedOrder = payload.new as Order;
          // Re-fetch detailed order to get nested data
          const detailedUpdatedOrder = await orderService.getDetailedOrderById(updatedOrder.id);
          if (detailedUpdatedOrder) {
            setOrders(prevOrders => 
              prevOrders.map(order => 
                order.id === detailedUpdatedOrder.id ? detailedUpdatedOrder : order
              )
            );
            toast.info(`Order ${detailedUpdatedOrder.title} status updated to ${detailedUpdatedOrder.status}`);
          }
        }
      )
      .subscribe();

    return () => {
      ordersChannel.unsubscribe();
    };
  }, [user, router, supabase]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading received orders...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Received Orders</CardTitle>
            <CardDescription>These are the orders placed by buyers for your products.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Title</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
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
                    <TableCell>{order.status}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                            disabled={order.status !== 'pending'}
                          >
                            Confirm Order
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              Assign Transporter
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuLabel>Select Transporter</DropdownMenuLabel>
                                {transporters.length === 0 ? (
                                  <DropdownMenuItem disabled>No transporters available</DropdownMenuItem>
                                ) : (
                                  transporters.map(transporter => (
                                    <DropdownMenuItem 
                                      key={transporter.id} 
                                      onClick={() => handleAssignTransporter(order.id, transporter.id)}
                                      disabled={order.status === 'delivered' || order.status === 'cancelled' || !!order.transporter_id}
                                    >
                                      {transporter.full_name} ({transporter.location})
                                    </DropdownMenuItem>
                                  ))
                                )}
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            disabled={order.status === 'delivered' || order.status === 'cancelled'}
                          >
                            Cancel Order
                          </DropdownMenuItem>
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
