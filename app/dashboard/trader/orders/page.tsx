"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/navbar';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  ArrowLeft,
  Search,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  ExternalLink,
  User,
  MapPin,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { orderService } from '@/lib/orderService';

interface OrderWithDetails {
  id: string;
  title: string;
  amount: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
  transporterId: string | null;
  buyer: {
    name: string | null;
  };
  items: {
    quantity: number;
    priceAtTime: number;
    product: {
      name: string;
    };
  }[];
}

export default function TraderOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [transporters, setTransporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/orders?role=trader&detailed=true');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      
      // Transform Prisma fields to match interface if needed
      const transformed = data.map((o: any) => ({
        ...o,
        amount: Number(o.amount),
        createdAt: o.createdAt,
        items: o.items.map((i: any) => ({
          ...i,
          priceAtTime: Number(i.priceAtTime)
        }))
      }));
      
      setOrders(transformed);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load transaction logs');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTransporters = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch transporters');
      const data = await res.json();
      setTransporters(data.filter((u: any) => u.role === 'TRANSPORTER'));
    } catch (error) {
      console.error('Error fetching transporters:', error);
    }
  }, []);

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

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      });
      if (res.ok) {
        toast.success(`Protocol updated to ${newStatus}`);
        fetchOrders();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast.error('Failed to update session status');
    }
  };

  const handleAssignTransporter = async (orderId: string, transporterId: string) => {
    try {
       const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transporterId }),
      });
      if (res.ok) {
        toast.success(`Logistics unit assigned successfully`);
        fetchOrders();
      } else {
        throw new Error('Assignment failed');
      }
    } catch (error) {
      toast.error('Logistics assignment failure');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (o.buyer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      <Navbar onAuthClick={() => { }} />

      <main className="container mx-auto px-6 py-24 space-y-12">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-border/50 pb-12 gap-8">
          <div>
            <Button 
                variant="ghost" 
                size="sm" 
                className="mb-4 -ml-2 text-[9px] font-black tracking-widest uppercase text-muted-foreground hover:text-accent transition-colors"
                onClick={() => router.push('/dashboard/trader')}
            >
                <ArrowLeft className="h-3 w-3 mr-2" /> Back to Console
            </Button>
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-4">
              Logistics Control
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
              Order <span className="text-muted-foreground/30 italic">Terminal.</span>
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Live Manifests</div>
            <div className="text-xl font-black uppercase tracking-tighter">{filteredOrders.length} DETECTED</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH MANIFESTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 bg-muted/5 border border-border/50 pl-12 pr-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-accent transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             {['ALL', 'PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED'].map((status) => (
                <Button 
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    className={`h-10 px-4 rounded-none text-[8px] font-black tracking-widest uppercase border-border ${statusFilter === status ? 'bg-accent text-white border-accent' : ''}`}
                    onClick={() => setStatusFilter(status)}
                >
                    {status.replace('_', ' ')}
                </Button>
             ))}
          </div>
        </div>

        {/* Orders Manifest */}
        <div className="border border-border/50 bg-background overflow-hidden">
            <div className="hidden md:grid grid-cols-12 bg-muted/30 p-6 border-b border-border/50 text-[9px] font-black tracking-[0.3em] uppercase text-muted-foreground">
                <div className="col-span-3">Unique Identifier</div>
                <div className="col-span-2">Client Identity</div>
                <div className="col-span-3">Payload Details</div>
                <div className="col-span-2 text-center">Status Protocol</div>
                <div className="col-span-2 text-right">Settlement</div>
            </div>

            <div className="divide-y divide-border/30">
                <AnimatePresence mode="popLayout">
                    {filteredOrders.map((order) => (
                        <motion.div 
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-6 md:p-8 hover:bg-muted/5 transition-colors group relative"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                {/* Identifier */}
                                <div className="col-span-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs font-black tracking-tighter uppercase">#{order.id.slice(0, 12)}</div>
                                        <ExternalLink className="h-3 w-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => router.push(`/dashboard/trader/orders/${order.id}`)} />
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] font-black tracking-widest text-muted-foreground uppercase">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(order.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                {/* Buyer */}
                                <div className="col-span-2 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-none border border-border flex items-center justify-center bg-muted/20">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="text-[10px] font-black tracking-widest uppercase truncate max-w-[120px]">
                                        {order.buyer?.name || 'Anonymous client'}
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="col-span-3 space-y-2">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="text-[10px] font-bold uppercase tracking-tight flex justify-between">
                                            <span>{item.product.name}</span>
                                            <span className="text-accent underline decoration-accent/30 underline-offset-2">×{item.quantity}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-start gap-2 text-[9px] font-medium text-muted-foreground uppercase tracking-widest leading-relaxed">
                                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                        <span className="line-clamp-1">{order.shippingAddress}</span>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-2 flex justify-center">
                                    <div className={`text-[8px] font-black tracking-[0.2em] uppercase py-1 px-4 border border-current ${
                                        order.status === 'DELIVERED' ? 'text-green-500' :
                                        order.status === 'PENDING' ? 'text-accent' :
                                        order.status === 'CANCELLED' ? 'text-destructive' :
                                        'text-muted-foreground'
                                    }`}>
                                        {order.status.replace('_', ' ')}
                                    </div>
                                </div>

                                {/* Amount & Actions */}
                                <div className="col-span-2 flex flex-col items-end gap-4">
                                    <div className="text-lg font-black tracking-tighter">KSH {order.amount.toLocaleString()}</div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="rounded-none border-border h-8 px-4 text-[8px] font-black tracking-widest uppercase">
                                                Update Protocol <MoreHorizontal className="h-3 w-3 ml-2" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-none border-border bg-background w-48">
                                            <DropdownMenuLabel className="text-[9px] font-black tracking-widest uppercase opacity-40">Status Control</DropdownMenuLabel>
                                            <DropdownMenuItem 
                                                className="text-[10px] font-black tracking-widest uppercase cursor-pointer"
                                                onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                                                disabled={order.status !== 'PENDING'}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Confirm Order
                                            </DropdownMenuItem>
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className="text-[10px] font-black tracking-widest uppercase cursor-pointer">
                                                    <Truck className="h-4 w-4 mr-2 text-accent" /> Assign Logistics
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent className="rounded-none border-border bg-background">
                                                        <DropdownMenuLabel className="text-[9px] font-black tracking-widest uppercase opacity-40">Select Unit</DropdownMenuLabel>
                                                        {transporters.length === 0 ? (
                                                            <DropdownMenuItem disabled className="text-[9px] font-bold uppercase tracking-widest">No units available</DropdownMenuItem>
                                                        ) : (
                                                            transporters.map(t => (
                                                                <DropdownMenuItem 
                                                                    key={t.id} 
                                                                    className="text-[9px] font-bold uppercase tracking-widest cursor-pointer"
                                                                    onClick={() => handleAssignTransporter(order.id, t.id)}
                                                                >
                                                                    {t.name} ({t.location || 'Local'})
                                                                </DropdownMenuItem>
                                                            ))
                                                        )}
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                            <DropdownMenuSeparator className="bg-border/50" />
                                            <DropdownMenuItem 
                                                className="text-[10px] font-black tracking-widest uppercase text-destructive cursor-pointer"
                                                onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                                                disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" /> Abort Manifest
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredOrders.length === 0 && !loading && (
                    <div className="py-32 text-center">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-6 text-muted-foreground/20" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/50">No manifests detected in this frequency.</h3>
                        <Button variant="link" className="mt-4 text-[10px] font-black tracking-widest uppercase text-accent" onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}>Reset Frequency</Button>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}
