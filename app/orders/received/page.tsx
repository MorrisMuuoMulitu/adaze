"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Order, orderService } from '@/lib/orderService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface OrderWithDetails extends Order {
    profiles: { full_name: string } | null; // Buyer's profile
    order_items: {
        quantity: number;
        products: {
            name: string;
        };
    }[];
}

export default function ReceivedOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [transporters, setTransporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/orders?role=trader&detailed=true');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (error: any) {
      toast.error("Failed to fetch orders", { description: error.message });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTransporters = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users'); // Assuming this returns all, but we filter or use specific
      if (!res.ok) throw new Error('Failed to fetch transporters');
      const data = await res.json();
      setTransporters(data.filter((u: any) => u.role === 'TRANSPORTER'));
    } catch (error) {
      console.error('Error fetching transporters:', error);
    }
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await orderService.updateOrder(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(); // Refresh
    } catch (error: any) {
      toast.error("Failed to update order status", { description: error.message });
    }
  };

  const handleAssignTransporter = async (orderId: string, transporterId: string) => {
    try {
      await orderService.assignOrderToTransporter(orderId, transporterId);
      toast.success(`Transporter assigned successfully`);
      fetchOrders(); // Refresh
    } catch (error: any) {
      toast.error("Failed to assign transporter", { description: error.message });
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'TRADER') {
        router.push('/');
        return;
      }
      fetchOrders();
      fetchTransporters();
    }
  }, [user, authLoading, router, fetchOrders, fetchTransporters]);

  if (loading || authLoading) {
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
                    <TableCell className="font-medium">{order.title}</TableCell>
                    <TableCell>{order.profiles?.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      {order.order_items.map((item, index) => (
                        <div key={index} className="text-xs">
                          {item.products.name} (x{item.quantity})
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>KSh {Number(order.amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{order.status}</Badge>
                    </TableCell>
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
                                      {transporter.name} ({transporter.location})
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
