"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ShoppingBag, Package, DollarSign, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { UserManagement } from '@/components/admin/user-management';
import { ProductManagement } from '@/components/admin/product-management';
import { OrderManagement } from '@/components/admin/order-management';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { AdminSettings } from '@/components/admin/admin-settings';
import { SecurityMonitoring } from '@/components/admin/security-monitoring';

interface DashboardStats {
  totalUsers: number;
  totalBuyers: number;
  totalTraders: number;
  totalTransporters: number;
  totalProducts: number;
  activeProducts: number;
  pendingProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  todayRevenue: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBuyers: 0,
    totalTraders: 0,
    totalTransporters: 0,
    totalProducts: 0,
    activeProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user stats
      const { data: allUsers } = await supabase.from('profiles').select('role');
      const buyers = allUsers?.filter(u => u.role === 'buyer').length || 0;
      const traders = allUsers?.filter(u => u.role === 'trader').length || 0;
      const transporters = allUsers?.filter(u => u.role === 'transporter').length || 0;

      // Fetch product stats
      const { data: products } = await supabase.from('products').select('id, status');
      const activeProducts = products?.filter(p => p.status === 'active').length || 0;
      const pendingProducts = products?.filter(p => p.status === 'pending').length || 0;

      // Fetch order stats
      const { data: orders } = await supabase.from('orders').select('id, status, amount, created_at');
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
      const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;

      // Calculate revenue (only from delivered orders)
      const deliveredOrders = orders?.filter(o => o.status === 'delivered') || [];
      const totalRevenue = deliveredOrders.reduce((sum, order) => sum + Number(order.amount), 0);
      const today = new Date().toISOString().split('T')[0];
      const todayRevenue = deliveredOrders
        .filter(o => o.created_at?.startsWith(today))
        .reduce((sum, order) => sum + Number(order.amount), 0);

      setStats({
        totalUsers: allUsers?.length || 0,
        totalBuyers: buyers,
        totalTraders: traders,
        totalTransporters: transporters,
        totalProducts: products?.length || 0,
        activeProducts,
        pendingProducts,
        totalOrders: orders?.length || 0,
        pendingOrders,
        completedOrders,
        totalRevenue,
        todayRevenue,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const checkAdminAndFetchStats = async () => {
      if (!user) {
        router.push('/');
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);
      await fetchStats();
    };

    checkAdminAndFetchStats();
  }, [user, router, supabase, fetchStats]);



  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar onAuthClick={() => { }} />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50">
              {loading ? 'Authenticating Command Center...' : 'Access Restricted'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onAuthClick={() => { }} />
      <main className="container mx-auto px-6 py-24 space-y-12">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-border/50 pb-12 gap-8">
          <div>
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-4">
              SYSTEM ADMINISTRATION
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
              Control <span className="text-muted-foreground/30">Panel.</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">System Status</div>
              <div className="flex items-center gap-2 justify-end">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black tracking-widest uppercase text-foreground">Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Precision Stats Grid */}
        <div className="grid gap-px bg-border/50 border border-border/50 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-background p-8 hover:bg-muted/5 transition-colors">
            <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-6 flex items-center justify-between">
              Total Users
              <Users className="h-4 w-4 text-accent" />
            </div>
            <div className="text-4xl font-black tracking-tighter mb-4 font-mono">
              {stats.totalUsers.toLocaleString()}
            </div>
            <div className="flex gap-4 text-[9px] font-black tracking-widest uppercase opacity-40">
              <span>{stats.totalTraders} TRADERS</span>
              <span>•</span>
              <span>{stats.totalBuyers} BUYERS</span>
            </div>
          </div>

          <div className="bg-background p-8 hover:bg-muted/5 transition-colors">
            <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-6 flex items-center justify-between">
              Inventory
              <Package className="h-4 w-4 text-accent" />
            </div>
            <div className="text-4xl font-black tracking-tighter mb-4 font-mono">
              {stats.totalProducts.toLocaleString()}
            </div>
            <div className="flex gap-4 text-[9px] font-black tracking-widest uppercase opacity-40">
              <span className="text-accent">{stats.pendingProducts} PENDING APPROVAL</span>
            </div>
          </div>

          <div className="bg-background p-8 hover:bg-muted/5 transition-colors">
            <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-6 flex items-center justify-between">
              Order Volume
              <ShoppingBag className="h-4 w-4 text-accent" />
            </div>
            <div className="text-4xl font-black tracking-tighter mb-4 font-mono">
              {stats.totalOrders.toLocaleString()}
            </div>
            <div className="flex gap-4 text-[9px] font-black tracking-widest uppercase opacity-40">
              <span>{stats.completedOrders} DELIVERED</span>
            </div>
          </div>

          <div className="bg-background p-8 hover:bg-muted/5 transition-colors">
            <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-6 flex items-center justify-between">
              Revenue (KSH)
              <DollarSign className="h-4 w-4 text-accent" />
            </div>
            <div className="text-4xl font-black tracking-tighter mb-4 font-mono text-accent">
              {stats.totalRevenue.toLocaleString()}
            </div>
            <div className="flex gap-4 text-[9px] font-black tracking-widest uppercase opacity-40">
              <span>TODAY: {stats.todayRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Management Interface */}
        <div className="space-y-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-8 border-b border-border/50 rounded-none w-full mb-8">
              {[
                { value: 'overview', label: 'Overview' },
                { value: 'analytics', label: 'Analytics' },
                { value: 'users', label: 'Users' },
                { value: 'products', label: 'Products' },
                { value: 'orders', label: 'Orders' },
                { value: 'security', label: 'Security' },
                { value: 'settings', label: 'Settings' }
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-[10px] font-black tracking-[0.2em] uppercase px-0 py-4 transition-all"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-12">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="border border-border/50 p-8 space-y-8">
                  <div className="flex items-center gap-4">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <h3 className="text-sm font-black tracking-widest uppercase">Performance Summary</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Active Sellers', value: stats.totalTraders },
                      { label: 'Verified Transporters', value: stats.totalTransporters },
                      { label: 'Live Listings', value: stats.activeProducts },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-end border-b border-border/20 pb-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</span>
                        <span className="text-lg font-black font-mono">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {stats.pendingProducts > 0 && (
                  <div className="bg-accent/5 border border-accent/20 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-8">
                        <AlertCircle className="h-5 w-5 text-accent" />
                        <h3 className="text-sm font-black tracking-widest uppercase">Tasks Required</h3>
                      </div>
                      <div className="text-5xl font-black tracking-tighter text-accent font-mono mb-2">
                        {stats.pendingProducts}
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Items awaiting authentication and quality review.
                      </p>
                    </div>
                    <Button
                      onClick={() => document.querySelector('[value="products"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                      className="btn-premium rounded-none h-12 text-[10px] font-black tracking-widest uppercase mt-8 w-full"
                    >
                      Authenticate Items
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <div className="border border-border/50 p-8"><AnalyticsDashboard /></div>
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <div className="border border-border/50 p-8"><UserManagement /></div>
            </TabsContent>

            <TabsContent value="products" className="mt-0">
              <div className="border border-border/50 p-8"><ProductManagement /></div>
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <div className="border border-border/50 p-8"><OrderManagement /></div>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <div className="border border-border/50 p-8"><SecurityMonitoring /></div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <div className="border border-border/50 p-8"><AdminSettings /></div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
