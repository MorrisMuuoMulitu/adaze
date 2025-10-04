"use client";

import { useEffect, useState } from 'react';
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
  }, [user, router, supabase]);

  const fetchStats = async () => {
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
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onAuthClick={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">{loading ? 'Loading...' : 'Access Denied'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar onAuthClick={() => {}} />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold">Adaze Admin Dashboard</h1>
            </div>
            <p className="text-blue-100 text-lg">Manage your platform with superpowers 👑</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        </div>

        {/* Stats Grid with Gradient Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Users</CardTitle>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-blue-100 mt-2">
                {stats.totalBuyers} buyers • {stats.totalTraders} traders • {stats.totalTransporters} transporters
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Total Products</CardTitle>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Package className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-purple-100 mt-2">
                {stats.activeProducts} active • {stats.pendingProducts} pending
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Total Orders</CardTitle>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-green-100 mt-2">
                {stats.pendingOrders} pending • {stats.completedOrders} completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-100">Total Revenue</CardTitle>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">KSh {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-amber-100 mt-2">
                Today: KSh {stats.todayRevenue.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Platform Growth</CardTitle>
                      <CardDescription>Your marketplace is thriving</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Users</span>
                      <span className="font-bold text-blue-600">{stats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Products</span>
                      <span className="font-bold text-purple-600">{stats.totalProducts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Orders</span>
                      <span className="font-bold text-green-600">{stats.totalOrders}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {stats.pendingProducts > 0 && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                        <AlertCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-amber-900">Pending Approvals</CardTitle>
                        <CardDescription>Products awaiting your review</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-amber-600 mb-2">
                      {stats.pendingProducts}
                    </div>
                    <p className="text-sm text-amber-700">
                      Click on Products tab to review and approve
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="security">
            <SecurityMonitoring />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
