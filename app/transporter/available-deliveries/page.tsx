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

export default function AvailableDeliveriesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transporter/available-deliveries');
      if (!res.ok) throw new Error('Failed to fetch available deliveries');
      const data = await res.json();
      setOrders(data);
    } catch (error: any) {
      toast.error("Failed to fetch orders", { description: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    if (!user) return;
    try {
      await orderService.assignOrderToTransporter(orderId, user.id);
      toast.success("Order accepted successfully!");
      fetchOrders(); // Refresh list
    } catch (error: any) {
      toast.error("Failed to accept order", { description: error.message });
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
    return <div className="min-h-screen flex items-center justify-center">Loading available deliveries...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Available Deliveries</CardTitle>
            <CardDescription>Select an order to start delivering.</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No available deliveries at the moment.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.title}</TableCell>
                      <TableCell>{order.shipping_address.split(',')[0]}</TableCell>
                      <TableCell>KSh {Number(order.amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleAcceptOrder(order.id)}>
                          Accept Mission
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
