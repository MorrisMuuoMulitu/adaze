"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/navbar';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  ArrowUpRight,
  Clock,
  CheckCircle,
  Bell,
  Settings,
  ChevronRight,
  Store
} from 'lucide-react';
import { toast } from 'sonner';

export default function TraderDashboard() {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSales: 0,
    unreadNotifications: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/trader/dashboard-stats');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await res.json();
      setStats({
        activeProducts: data.activeProducts,
        pendingOrders: data.pendingOrders,
        completedOrders: data.completedOrders,
        totalSales: data.totalSales,
        unreadNotifications: data.unreadNotifications
      });
      setRecentOrders(data.recentOrders);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'TRADER') {
        router.push('/');
        return;
      }
      fetchDashboardData();
    }
  }, [user, authLoading, router, fetchDashboardData]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar onAuthClick={() => { }} />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50">
              Authenticating Command Center...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profile = authProfile;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      <Navbar onAuthClick={() => { }} />

      <main className="container mx-auto px-6 py-24 space-y-12">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-border/50 pb-12 gap-8">
          <div>
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-4">
              Merchant Operations
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
              Trader <span className="text-muted-foreground/30 italic">Console.</span>
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Boutique Identity</div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black uppercase tracking-tighter">{profile?.full_name || 'Anonymous Store'}</span>
              <Badge className="bg-accent text-white rounded-none text-[9px] font-black tracking-widest">VERIFIED</Badge>
            </div>
          </div>
        </div>

        {/* Precision Stats Grid */}
        <div className="grid gap-px bg-border/50 border border-border/50 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-background p-8 hover:bg-muted/5 transition-colors group">
            <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-6 flex items-center justify-between">
              Inventory
              <Package className="h-4 w-4 text-accent" />
            </div>
            <div className="text-4xl font-black tracking-tighter mb-4 font-mono">
              {stats.activeProducts.toString().padStart(2, '0')}
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase text-accent cursor-pointer hover:underline" onClick={() => router.push('/dashboard/trader/products')}>
              Manage Collection <ChevronRight className="h-3 w-3" />
            </div>
          </div>

          <div className="bg-background p-8 hover:bg-muted/5 transition-colors">
            <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-6 flex items-center justify-between">
              Pending Orders
              <Clock className="h-4 w-4 text-accent" />
            </div>
            <div className="text-4xl font-black tracking-tighter mb-4 font-mono">
              {stats.pendingOrders.toString().padStart(2, '0')}
            </div>
            <div className="text-[9px] font-black tracking-widest uppercase opacity-40">
              Awaiting Dispatch
            </div>
          </div>

          <div className="bg-background p-8 hover:bg-muted/5 transition-colors">
            <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-6 flex items-center justify-between">
              Success Rate
              <CheckCircle className="h-4 w-4 text-accent" />
            </div>
            <div className="text-4xl font-black tracking-tighter mb-4 font-mono">
              {stats.completedOrders.toString().padStart(2, '0')}
            </div>
            <div className="text-[9px] font-black tracking-widest uppercase opacity-40">
              Fulfilled Requests
            </div>
          </div>

          <div className="bg-background p-8 hover:bg-muted/5 transition-colors">
            <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-6 flex items-center justify-between">
              Gross Volume
              <DollarSign className="h-4 w-4 text-accent" />
            </div>
            <div className="text-4xl font-black tracking-tighter mb-4 font-mono text-accent">
              {stats.totalSales.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase text-accent cursor-pointer hover:underline" onClick={() => router.push('/dashboard/trader/analytics')}>
              View Analytics <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Secondary Interface */}
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Quick Actions & Navigation */}
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-6">
              <div className="text-[10px] font-black tracking-[0.4em] uppercase text-muted-foreground">Operational Tasks</div>
              <div className="flex flex-col gap-4">
                <Button 
                  className="btn-premium rounded-none h-16 text-[10px] font-black tracking-widest uppercase flex justify-between px-8"
                  onClick={() => router.push('/dashboard/trader/products/new')}
                >
                  List New Asset
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-none h-16 border-border hover:bg-muted/50 transition-all text-[10px] font-black tracking-widest uppercase flex justify-between px-8"
                  onClick={() => router.push('/dashboard/trader/orders')}
                >
                  Order Archive
                  <ShoppingBag className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-none h-16 border-border hover:bg-muted/50 transition-all text-[10px] font-black tracking-widest uppercase flex justify-between px-8"
                  onClick={() => router.push('/settings')}
                >
                  System Configuration
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notifications Preview */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-[10px] font-black tracking-[0.4em] uppercase text-muted-foreground">Alerts</div>
                {stats.unreadNotifications > 0 && (
                  <Badge className="bg-accent text-white rounded-none text-[9px] font-black tracking-widest">{stats.unreadNotifications} NEW</Badge>
                )}
              </div>
              <div className="border border-border/50 bg-muted/5 p-8 text-center space-y-4">
                <Bell className="h-8 w-8 mx-auto text-muted-foreground/20" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  {stats.unreadNotifications === 0 ? 'No critical alerts' : 'System updates pending'}
                </p>
                <Button variant="link" className="text-[9px] font-black uppercase tracking-widest" onClick={() => router.push('/notifications')}>
                  Open Terminal
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Activity Terminal */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-[10px] font-black tracking-[0.4em] uppercase text-muted-foreground">Recent Transactions</div>
              <Button variant="link" className="text-[10px] font-black uppercase tracking-widest" onClick={() => router.push('/dashboard/trader/orders')}>
                Full Log
              </Button>
            </div>
            
            <div className="border border-border/50 bg-background overflow-hidden">
              <div className="grid grid-cols-12 bg-muted/30 p-4 border-b border-border/50 text-[9px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                <div className="col-span-4">Identifier</div>
                <div className="col-span-3 text-center">Status</div>
                <div className="col-span-3 text-right">Value</div>
                <div className="col-span-2"></div>
              </div>
              
              <div className="divide-y divide-border/30">
                {recentOrders.length === 0 ? (
                  <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    No recent transaction records detected.
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="grid grid-cols-12 p-6 items-center hover:bg-muted/5 transition-colors group">
                      <div className="col-span-4">
                        <div className="text-xs font-black tracking-tighter uppercase mb-1">#{order.id.slice(0, 8)}</div>
                        <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="col-span-3 text-center">
                        <Badge variant="outline" className="rounded-none text-[8px] font-black tracking-widest uppercase px-2 py-0">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="col-span-3 text-right text-xs font-black font-mono">
                        KSH {Number(order.amount).toLocaleString()}
                      </div>
                      <div className="col-span-2 text-right">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => router.push(`/dashboard/trader/orders/${order.id}`)}>
                          <ArrowUpRight className="h-4 w-4 text-accent" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
