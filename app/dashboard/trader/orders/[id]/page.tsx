"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/navbar';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtTime: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

interface OrderDetail {
  id: string;
  title: string;
  amount: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
  phoneNumber: string | null;
  transporterId: string | null;
  buyer: {
    id: string;
    name: string | null;
    email: string | null;
  };
  items: OrderItem[];
  transporter?: {
    name: string | null;
    phone: string | null;
  };
}

export default function OrderDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${id}?detailed=true`);
      if (!res.ok) throw new Error('Order not found');
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      toast.error('Failed to load transaction file');
      router.push('/dashboard/trader/orders');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'TRADER') {
        router.push('/');
        return;
      }
      fetchOrder();
    }
  }, [user, authLoading, router, fetchOrder]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      });
      if (res.ok) {
        toast.success(`Protocol status updated to ${newStatus}`);
        fetchOrder();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast.error('Failed to update protocol status');
    }
  };

  if (authLoading || loading) {
    return (
       <div className="min-h-screen bg-background flex flex-col">
          <Navbar onAuthClick={() => { }} />
          <div className="flex-grow flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      <Navbar onAuthClick={() => { }} />

      <main className="container mx-auto px-6 py-24 max-w-5xl">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-border/50 pb-12 mb-12 gap-8">
          <div>
            <Button 
                variant="ghost" 
                size="sm" 
                className="mb-4 -ml-2 text-[9px] font-black tracking-widest uppercase text-muted-foreground hover:text-accent transition-colors"
                onClick={() => router.push('/dashboard/trader/orders')}
            >
                <ArrowLeft className="h-3 w-3 mr-2" /> Back to Terminal
            </Button>
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-4">
              Manifest Detail
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.85]">
              #{order.id.slice(0, 12)} <span className="text-muted-foreground/30 italic">Details.</span>
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`text-[9px] font-black tracking-[0.3em] uppercase py-2 px-6 border border-current ${
                order.status === 'DELIVERED' ? 'text-green-500' :
                order.status === 'PENDING' ? 'text-accent' :
                order.status === 'CANCELLED' ? 'text-destructive' :
                'text-muted-foreground'
            }`}>
                {order.status.replace('_', ' ')}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
            {/* Left Column: Details */}
            <div className="lg:col-span-8 space-y-12">
                {/* Items Manifest */}
                <div className="space-y-6">
                    <div className="text-[10px] font-black tracking-[0.4em] uppercase text-muted-foreground">Payload Analysis</div>
                    <div className="border border-border/50 bg-background overflow-hidden divide-y divide-border/30">
                        {order.items.map((item) => (
                            <div key={item.id} className="p-6 flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-muted/20 border border-border/50 overflow-hidden relative">
                                        {item.product.imageUrl && (
                                            <img src={item.product.imageUrl} alt={item.product.name} className="object-cover w-full h-full" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-tight">{item.product.name}</div>
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                            KSH {item.priceAtTime.toLocaleString()} × {item.quantity}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm font-black font-mono">
                                    KSH {(item.priceAtTime * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))}
                        <div className="p-8 bg-muted/5 flex justify-between items-center">
                            <div className="text-[10px] font-black tracking-widest uppercase opacity-40">Total Settlement</div>
                            <div className="text-2xl font-black tracking-tighter">KSH {Number(order.amount).toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Logistics Info */}
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="text-[10px] font-black tracking-[0.4em] uppercase text-muted-foreground">Client Information</div>
                        <div className="border border-border/50 bg-muted/5 p-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-accent" />
                                <div className="text-[10px] font-black uppercase tracking-widest">{order.buyer.name || 'Anonymous Client'}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-accent" />
                                <div className="text-[10px] font-medium uppercase tracking-widest leading-relaxed">{order.shippingAddress}</div>
                            </div>
                            {order.phoneNumber && (
                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-7">TEL: {order.phoneNumber}</div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="text-[10px] font-black tracking-[0.4em] uppercase text-muted-foreground">Logistics Protocol</div>
                        <div className="border border-border/50 bg-muted/5 p-8 space-y-4">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <div className="text-[10px] font-black uppercase tracking-widest">PLACED: {new Date(order.createdAt).toLocaleDateString()}</div>
                            </div>
                            {order.transporter ? (
                                <div className="flex items-center gap-3">
                                    <Truck className="h-4 w-4 text-accent" />
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest">ASSIGNED: {order.transporter.name}</div>
                                        <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">UNIT CONTACT: {order.transporter.phone}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 opacity-40">
                                    <Truck className="h-4 w-4" />
                                    <div className="text-[10px] font-black uppercase tracking-widest">AWAITING ASSIGNMENT</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Actions */}
            <div className="lg:col-span-4 space-y-8">
                <div className="border border-border/50 bg-background p-8 space-y-8">
                    <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent">Protocol Control</div>
                    
                    <div className="space-y-4">
                        <Button 
                            className="w-full h-14 bg-muted/5 hover:bg-green-500/10 border border-border/50 hover:border-green-500/50 text-[10px] font-black tracking-widest uppercase transition-all flex justify-between px-6"
                            disabled={order.status !== 'PENDING'}
                            onClick={() => handleUpdateStatus('CONFIRMED')}
                        >
                            Confirm Manifest
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                        
                        <Button 
                            className="w-full h-14 bg-muted/5 hover:bg-accent/10 border border-border/50 hover:border-accent/50 text-[10px] font-black tracking-widest uppercase transition-all flex justify-between px-6"
                            disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                            onClick={() => router.push('/dashboard/trader/orders')}
                        >
                            Assign Logistics Component
                            <Truck className="h-4 w-4 text-accent" />
                        </Button>

                        <div className="py-2" />

                        <Button 
                            variant="destructive"
                            className="w-full h-14 rounded-none text-[10px] font-black tracking-widest uppercase flex justify-between px-6"
                            disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                            onClick={() => handleUpdateStatus('CANCELLED')}
                        >
                            Abort Protocol
                            <XCircle className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="border-t border-border/30 pt-8">
                        <p className="text-[9px] font-medium leading-relaxed uppercase tracking-widest opacity-40">
                            Updating manifest status will notify the client and any assigned logistics units immediately.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
