"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { User, BarChart3, ClipboardList, Globe, PlusCircle, List, Star, TrendingUp, ArrowRight, Package, CheckCircle, DollarSign, Award, TrendingDown } from 'lucide-react';
import { reviewService } from '@/lib/reviewService';
import { LogoutButton } from '@/components/LogoutButton';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { DateRangePicker } from '@/components/date-range-picker';
import { ComparisonMetric } from '@/components/comparison-metric';
import { ExportDataButton } from '@/components/export-data-button';
import { AdvancedFilters, FilterValues } from '@/components/advanced-filters';
import { ActivityFeed } from '@/components/activity-feed';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  location: string;
  avatar_url: string;
  role: 'buyer' | 'trader' | 'transporter';
}

export default function TraderDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  // Date range state
  const [dateFrom, setDateFrom] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [dateTo, setDateTo] = useState<Date>(new Date());

  // Filters state
  const [filters, setFilters] = useState<FilterValues>({});
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const [stats, setStats] = useState({
    totalProducts: 0,
    activeListings: 0,
    receivedOrders: 0,
    totalRevenue: 0,
    weeklyRevenue: 0,
    averageOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  // Previous period state
  const [prevStats, setPrevStats] = useState({
    totalProducts: 0,
    activeListings: 0,
    receivedOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, phone, location, avatar_url, role')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch average rating
        const avgRating = await reviewService.getAverageRating(user.id);
        setAverageRating(avgRating);

        // Fetch total products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('trader_id', user.id);

        // Fetch active listings (not sold)
        const { count: activeCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('trader_id', user.id)
          .eq('status', 'active');

        // Fetch received orders within date range
        const { count: ordersCount, data: ordersData } = await supabase
          .from('orders')
          .select('*, id, amount, status, created_at', { count: 'exact' })
          .eq('trader_id', user.id)
          .gte('created_at', dateFrom.toISOString())
          .lte('created_at', dateTo.toISOString())
          .order('created_at', { ascending: false });

        // Fetch total revenue (sum of completed orders)
        const { data: revenueData } = await supabase
          .from('orders')
          .select('amount, created_at')
          .eq('trader_id', user.id)
          .eq('status', 'delivered')
          .gte('created_at', dateFrom.toISOString())
          .lte('created_at', dateTo.toISOString());

        const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

        // Calculate previous period
        const periodLength = dateTo.getTime() - dateFrom.getTime();
        const prevFrom = new Date(dateFrom.getTime() - periodLength);
        const prevTo = new Date(dateTo.getTime() - periodLength);

        // Fetch previous period data
        const { count: prevOrdersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('trader_id', user.id)
          .gte('created_at', prevFrom.toISOString())
          .lte('created_at', prevTo.toISOString());

        const { data: prevRevenueData } = await supabase
          .from('orders')
          .select('amount')
          .eq('trader_id', user.id)
          .eq('status', 'delivered')
          .gte('created_at', prevFrom.toISOString())
          .lte('created_at', prevTo.toISOString());

        const prevTotalRevenue = prevRevenueData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

        setPrevStats({
          totalProducts: productsCount || 0,
          activeListings: activeCount || 0,
          receivedOrders: prevOrdersCount || 0,
          totalRevenue: prevTotalRevenue,
        });

        // Calculate weekly revenue (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyRevenue = revenueData?.filter(order =>
          new Date(order.created_at) >= weekAgo
        ).reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

        // Calculate average order value
        const averageOrderValue = revenueData && revenueData.length > 0
          ? totalRevenue / revenueData.length
          : 0;

        // Generate revenue chart data
        const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
        const days = Array.from({ length: Math.min(daysDiff, 30) }, (_, i) => {
          const date = new Date(dateFrom);
          date.setDate(dateFrom.getDate() + i);
          return date;
        });

        const chartData = days.map(date => {
          const dayOrders = revenueData?.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate.toDateString() === date.toDateString();
          }) || [];

          const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

          return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: dayRevenue,
            orders: dayOrders.length
          };
        });

        // Fetch top selling products (by order count)
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, price, image_url')
          .eq('trader_id', user.id)
          .eq('status', 'active')
          .limit(5);

        // Count orders for each product
        const productsWithSales = await Promise.all(
          (productsData || []).map(async (product) => {
            const { count: salesCount } = await supabase
              .from('orders')
              .select('*', { count: 'exact', head: true })
              .eq('trader_id', user.id)
              .eq('status', 'delivered');

            const { data: orderItems } = await supabase
              .from('orders')
              .select('amount')
              .eq('trader_id', user.id)
              .eq('status', 'delivered')
              .limit(100);

            const productRevenue = orderItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

            return {
              ...product,
              sales: salesCount || 0,
              revenue: productRevenue
            };
          })
        );

        const sortedProducts = productsWithSales.sort((a, b) => b.sales - a.sales).slice(0, 5);

        setStats({
          totalProducts: productsCount || 0,
          activeListings: activeCount || 0,
          receivedOrders: ordersCount || 0,
          totalRevenue,
          weeklyRevenue,
          averageOrderValue,
        });

        setRevenueData(chartData);
        setTopProducts(sortedProducts);
        setRecentOrders(ordersData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, router, supabase, dateFrom, dateTo]);

  // Filter orders based on filters
  const filteredOrders = useMemo(() => {
    let result = recentOrders;

    if (filters.status) {
      result = result.filter(o => o.status === filters.status);
    }

    if (filters.minAmount !== undefined) {
      result = result.filter(o => o.amount >= filters.minAmount!);
    }

    if (filters.maxAmount !== undefined) {
      result = result.filter(o => o.amount <= filters.maxAmount!);
    }

    if (filters.search) {
      result = result.filter(o =>
        o.id.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    return result;
  }, [recentOrders, filters]);

  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    const count = Object.keys(newFilters).filter(k => newFilters[k as keyof FilterValues]).length;
    setActiveFilterCount(count);
  };

  // Transform orders to activities
  const activities = useMemo(() => {
    return filteredOrders.slice(0, 10).map(order => ({
      id: order.id,
      type: 'order' as const,
      action: `Order ${order.status}`,
      description: `Order #${order.id.substring(0, 8)} - KSh ${order.amount?.toLocaleString()}`,
      timestamp: new Date(order.created_at),
      status: (order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'pending') as 'success' | 'pending' | 'error' | 'info',
      amount: order.amount,
    }));
  }, [filteredOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'shipped': return 'bg-blue-500';
      case 'confirmed': return 'bg-yellow-500';
      case 'pending': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onAuthClick={() => { }} />
      <main className="container mx-auto px-6 py-24 space-y-12">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-border/50 pb-12 gap-8">
          <div>
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-4">
              {profile.role} OPERATIONS
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
              Control <span className="text-muted-foreground/30">Panel.</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-6">
              Welcome back, {profile.full_name || user.email}. System status: <span className="text-green-500">Active</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push('/profile')} variant="outline" className="rounded-none border-border/50 text-[10px] font-black tracking-widest uppercase h-10">
              <User className="h-3 w-3 mr-2" />
              Settings
            </Button>
            <LogoutButton variant="outline" className="rounded-none border-border/50 text-[10px] font-black tracking-widest uppercase h-10" />
          </div>
        </div>

        {/* Precision Stats Grid */}
        <div className="grid gap-px bg-border/50 border border-border/50 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-background p-8 hover:bg-muted/5 transition-colors">
            <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-6 flex items-center justify-between">
              Inventory
              <List className="h-4 w-4 text-accent" />
            </div>
            <div className="text-4xl font-black tracking-tighter mb-4 font-mono">
              {stats.totalProducts}
            </div>
            <div className="flex gap-4 text-[9px] font-black tracking-widest uppercase opacity-40">
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {stats.activeListings} LIVE LISTINGS
              </span>
            </div>
          </div>

          <div className="bg-background p-8 hover:bg-muted/5 transition-colors">
            <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-6 flex items-center justify-between">
              Growth
              <Star className="h-4 w-4 text-accent" />
            </div>
            <div className="text-4xl font-black tracking-tighter mb-4 font-mono">
              {averageRating ? averageRating.toFixed(1) : 'N/A'}
            </div>
            <div className="flex gap-4 text-[9px] font-black tracking-widest uppercase opacity-40">
              <span>AVERAGE RATING</span>
            </div>
          </div>

          <div className="bg-background p-8 hover:bg-muted/5 transition-colors">
            <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-6 flex items-center justify-between">
              Orders
              <ClipboardList className="h-4 w-4 text-accent" />
            </div>
            <div className="text-4xl font-black tracking-tighter mb-4 font-mono">
              {stats.receivedOrders}
            </div>
            <div className="flex gap-4 text-[9px] font-black tracking-widest uppercase opacity-40">
              <ComparisonMetric current={stats.receivedOrders} previous={prevStats.receivedOrders} />
            </div>
          </div>

          <div className="bg-background p-8 hover:bg-muted/5 transition-colors">
            <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-6 flex items-center justify-between">
              Revenue
              <DollarSign className="h-4 w-4 text-accent" />
            </div>
            <div className="text-4xl font-black tracking-tighter mb-4 font-mono text-accent">
              KSH {stats.totalRevenue.toLocaleString()}
            </div>
            <div className="flex gap-4 text-[9px] font-black tracking-widest uppercase opacity-40">
              <ComparisonMetric current={stats.totalRevenue} previous={prevStats.totalRevenue} />
            </div>
          </div>
        </div>

        {/* Management Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content (2 columns) */}
          <div className="lg:col-span-2 space-y-12">

            {/* New Merchant Welcome State */}
            {stats.totalProducts === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-accent/5 border border-accent/20 p-12 text-center space-y-8"
              >
                <div className="w-16 h-16 border-2 border-accent flex items-center justify-center mx-auto relative">
                  <PlusCircle className="w-8 h-8 text-accent" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 border-2 border-accent"
                  />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-black tracking-tighter uppercase">Welcome to the Collective.</h2>
                  <p className="text-muted-foreground/60 max-w-sm mx-auto font-medium tracking-tight">
                    Your boutique is active, but empty. Give life to your first piece and start your ascent.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/products/add')}
                  className="btn-premium h-14 px-12 text-[10px] font-black tracking-widest uppercase rounded-none"
                >
                  Create Your First Listing
                </Button>
              </motion.div>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4 py-6 border-y border-border/20">
              <DateRangePicker
                from={dateFrom}
                to={dateTo}
                onDateChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
              />
              <AdvancedFilters
                onApply={handleApplyFilters}
                statusOptions={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'shipped', label: 'Shipped' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
                activeFiltersCount={activeFilterCount}
              />
              <ExportDataButton
                data={filteredOrders}
                filename={`trader-orders-${new Date().toISOString().split('T')[0]}`}
                columns={['id', 'created_at', 'amount', 'status']}
              />
            </div>

            {/* Data Visualizations */}
            <div className="space-y-6">
              <div className="bg-background border border-border/50 p-8">
                <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50 mb-8 flex items-center justify-between">
                  Revenue Trends
                  <div className="text-right">
                    <div className="text-xl font-black font-mono text-accent">KSH {stats.totalRevenue.toLocaleString()}</div>
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#404040"
                        style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#404040"
                        style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '0.1em' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a0a0a',
                          border: '1px solid #262626',
                          borderRadius: '0px',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: '800',
                          textTransform: 'uppercase'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: "hsl(var(--accent))", strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance & Feed Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/50 border border-border/50">
                <div className="bg-background p-8 space-y-8">
                  <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50">Top Performing</div>
                  {topProducts.length === 0 ? (
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">Waiting for data...</p>
                  ) : (
                    <div className="space-y-6">
                      {topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center gap-4 group">
                          <span className="text-xs font-black font-mono text-accent/40 group-hover:text-accent transition-colors">0{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-tight truncate">{product.name}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">{product.sales} PIECES SOLD</p>
                          </div>
                          <div className="text-right font-mono font-black text-xs">
                            KSH {product.price?.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-background p-8 space-y-8">
                  <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50">Quick Performance</div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                        <span>Fulfillment</span>
                        <span>{(stats.receivedOrders > 0 ? (stats.activeListings / stats.receivedOrders * 10).toFixed(0) : '100')}%</span>
                      </div>
                      <div className="h-1 bg-border/20">
                        <div className="h-full bg-accent w-[85%] transition-all" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-border/50 bg-muted/5">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Avg Order</p>
                        <p className="text-sm font-black font-mono">KSH {stats.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className="p-4 border border-border/50 bg-muted/5">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Growth</p>
                        <p className="text-sm font-black font-mono text-green-500">+12.4%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/50 border border-border/50">
              <button
                onClick={() => router.push('/products/add')}
                className="bg-background p-8 hover:bg-muted/10 transition-colors space-y-4 group text-left"
              >
                <PlusCircle className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-[10px] font-black tracking-[0.2em] uppercase">Archive Listing</div>
                  <p className="text-[9px] font-medium text-muted-foreground mt-1 uppercase">Add new pieces to catalog</p>
                </div>
              </button>
              <button
                onClick={() => router.push('/products/manage')}
                className="bg-background p-8 hover:bg-muted/10 transition-colors space-y-4 group text-left"
              >
                <List className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-[10px] font-black tracking-[0.2em] uppercase">Inventory Vault</div>
                  <p className="text-[9px] font-medium text-muted-foreground mt-1 uppercase">Manage active inventory</p>
                </div>
              </button>
              <button
                onClick={() => router.push('/orders/received')}
                className="bg-background p-8 hover:bg-muted/10 transition-colors space-y-4 group text-left"
              >
                <ClipboardList className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-[10px] font-black tracking-[0.2em] uppercase">Order Manifest</div>
                  <p className="text-[9px] font-medium text-muted-foreground mt-1 uppercase">Track shipment logistics</p>
                </div>
              </button>
            </div>
          </div>

          {/* Right: Activity Feed (1 column) */}
          <div className="lg:col-span-1 border-l border-border/50 pl-12 h-fit space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50">System Logs</h3>
              <div className="h-px flex-grow mx-4 bg-border/20" />
            </div>
            <ActivityFeed activities={activities} />

            <div className="pt-12">
              <div className="p-8 bg-accent/5 border border-accent/20 space-y-6">
                <div className="flex items-center gap-2 text-accent">
                  <Award className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-widest uppercase">Premium Merchant</span>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground leading-relaxed uppercase tracking-widest">
                  Maintain your high rating to unlock advanced buyer targeting and lower transaction fees.
                </p>
                <Button variant="link" className="p-0 h-auto text-[9px] font-black tracking-widest uppercase hover:text-accent">
                  READ THE BYLAWS <ArrowRight className="ml-1 w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
