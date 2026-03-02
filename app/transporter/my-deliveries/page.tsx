"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { orderService } from '@/lib/orderService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

export default function MyDeliveriesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?role=transporter&detailed=true');
      if (!res.ok) throw new Error('Failed to fetch my deliveries');
      const data = await res.json();
      setOrders(data);
    } catch (error: any) {
      toast.error("Failed to fetch orders", { description: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCompleteDelivery = async (orderId: string) => {
    try {
      await orderService.completeOrder(orderId);
      toast.success("Delivery completed successfully!");
      fetchOrders(); // Refresh
    } catch (error: any) {
      toast.error("Failed to complete delivery", { description: error.message });
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'TRANSPORTER') {
        router.push('/');
        return;
      }
      fetchOrders();
    }
  }, [user, authLoading, router, fetchOrders]);

  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading my deliveries...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>My Active Deliveries</CardTitle>
            <CardDescription>Manage and complete your assigned delivery missions.</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">You have no active deliveries.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.title}</TableCell>
                      <TableCell>{order.shipping_address.split(',')[0]}</TableCell>
                      <TableCell>
                        <Badge className="capitalize">{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => handleCompleteDelivery(order.id)}
                          disabled={order.status === 'delivered' || order.status === 'cancelled'}
                        >
                          Mark Delivered
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
