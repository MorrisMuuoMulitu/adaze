"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, User, MapPin, TrendingUp, Clock, CheckCircle, Heart, ArrowRight, DollarSign } from 'lucide-react';
import { LogoutButton } from '@/components/LogoutButton';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Stats
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    wishlistItems: 0,
    cartItems: 0,
    totalSpending: 0,
    weeklySpending: 0,
  });
  const [previousStats, setPreviousStats] = useState({ 
    totalSpending: 0, 
    activeOrders: 0,
    completedOrders: 0,
    wishlistItems: 0 
  });
  
  // Data
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [spendingData, setSpendingData] = useState<any[]>([]);
  
  // Date range
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [dateTo, setDateTo] = useState(new Date());
  
  // Filters
  const [filters, setFilters] = useState<FilterValues>({});
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Fetch profile
  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, phone, location, avatar_url, role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user, router, supabase]);

  // Fetch dashboard data based on date range
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch active orders count (within date range)
        const { count: activeCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', user.id)
          .in('status', ['pending', 'confirmed', 'shipped'])
          .gte('created_at', dateFrom.toISOString())
          .lte('created_at', dateTo.toISOString());

        // Fetch completed orders count
        const { count: completedCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', user.id)
          .eq('status', 'delivered')
          .gte('created_at', dateFrom.toISOString())
          .lte('created_at', dateTo.toISOString());

        // Fetch wishlist items count
        const { count: wishlistCount } = await supabase
          .from('wishlist')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch cart items count
        const { count: cartCount } = await supabase
          .from('cart')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch orders for spending calculation
        const { data: orders } = await supabase
          .from('orders')
          .select('amount, created_at')
          .eq('buyer_id', user.id)
          .eq('status', 'delivered')
          .gte('created_at', dateFrom.toISOString())
          .lte('created_at', dateTo.toISOString());

        const totalSpending = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

        // Generate chart data
        const periodLength = dateTo.getTime() - dateFrom.getTime();
        const days = Math.ceil(periodLength / (1000 * 60 * 60 * 24));
        const daysToShow = Math.min(days, 30); // Max 30 days

        const chartData = Array.from({ length: daysToShow }, (_, i) => {
          const date = new Date(dateFrom);
          date.setDate(date.getDate() + i);
          
          const dayOrders = orders?.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate.toDateString() === date.toDateString();
          }) || [];

          const daySpending = dayOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

          return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            spending: daySpending,
            orders: dayOrders.length
          };
        });

        setStats({
          activeOrders: activeCount || 0,
          completedOrders: completedCount || 0,
          wishlistItems: wishlistCount || 0,
          cartItems: cartCount || 0,
          totalSpending,
          weeklySpending: totalSpending, // For this date range
        });

        setSpendingData(chartData);

        // Fetch recent orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('buyer_id', user.id)
          .gte('created_at', dateFrom.toISOString())
          .lte('created_at', dateTo.toISOString())
          .order('created_at', { ascending: false })
          .limit(20);

        setRecentOrders(ordersData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, supabase, dateFrom, dateTo]);

  // Fetch previous period stats for comparison
  useEffect(() => {
    if (!user) return;

    const fetchPreviousStats = async () => {
      try {
        const periodLength = dateTo.getTime() - dateFrom.getTime();
        const prevFrom = new Date(dateFrom.getTime() - periodLength);
        const prevTo = new Date(dateTo.getTime() - periodLength);

        // Previous period orders
        const { data: prevOrders } = await supabase
          .from('orders')
          .select('amount, created_at, status')
          .eq('buyer_id', user.id)
          .gte('created_at', prevFrom.toISOString())
          .lte('created_at', prevTo.toISOString());

        const prevSpending = prevOrders
          ?.filter(o => o.status === 'delivered')
          .reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
        
        const prevActive = prevOrders?.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length || 0;
        const prevCompleted = prevOrders?.filter(o => o.status === 'delivered').length || 0;

        // Wishlist (compare with 30 days ago)
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const { count: prevWishlist } = await supabase
          .from('wishlist')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .lt('created_at', monthAgo.toISOString());

        setPreviousStats({
          totalSpending: prevSpending,
          activeOrders: prevActive,
          completedOrders: prevCompleted,
          wishlistItems: prevWishlist || 0
        });
      } catch (error) {
        console.error('Error fetching previous stats:', error);
      }
    };

    fetchPreviousStats();
  }, [user, supabase, dateFrom, dateTo]);

  // Helper functions (defined before useMemo)
  const getOrderAction = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Placed';
      case 'confirmed': return 'Order Confirmed';
      case 'shipped': return 'Order Shipped';
      case 'delivered': return 'Order Delivered';
      case 'cancelled': return 'Order Cancelled';
      default: return 'Order Updated';
    }
  };

  const getOrderActivityStatus = (status: string): 'success' | 'pending' | 'error' | 'info' => {
    switch (status) {
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      case 'pending': return 'pending';
      default: return 'info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'shipped': return 'bg-blue-500';
      case 'confirmed': return 'bg-yellow-500';
      case 'pending': return 'bg-orange-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Package className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Apply filters to orders
  const filteredOrders = useMemo(() => {
    let result = recentOrders;

    if (filters.status) {
      result = result.filter(o => o.status === filters.status);
    }

    if (filters.minAmount) {
      result = result.filter(o => o.amount >= filters.minAmount!);
    }

    if (filters.maxAmount) {
      result = result.filter(o => o.amount <= filters.maxAmount!);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(searchLower) ||
        o.product_name?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [recentOrders, filters]);

  // Transform orders to activities
  const activities = useMemo(() => {
    return filteredOrders.slice(0, 10).map(order => ({
      id: order.id,
      type: 'order' as const,
      action: getOrderAction(order.status),
      description: `Order #${order.id.slice(0, 8)} - ${order.product_name || 'Product'}`,
      timestamp: new Date(order.created_at),
      status: getOrderActivityStatus(order.status),
      amount: order.amount
    }));
  }, [filteredOrders]);

  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    const count = Object.keys(newFilters).filter(k => newFilters[k as keyof FilterValues]).length;
    setActiveFilterCount(count);
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
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold capitalize flex items-center gap-3">
                {profile.role} Dashboard
                <Badge variant="secondary" className="capitalize text-sm px-3 py-1">
                  {profile.role}
                </Badge>
              </h1>
              <p className="text-muted-foreground mt-1">Welcome back, {profile.full_name || user.email}! 👋</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <Button onClick={() => router.push('/profile')} variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <LogoutButton variant="outline" size="sm" />
            </div>
          </div>

          {/* Toolbar with Date Range, Filters, Export */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <DateRangePicker
                from={dateFrom}
                to={dateTo}
                onDateChange={(from, to) => {
                  setDateFrom(from);
                  setDateTo(to);
                }}
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
            </div>
            <ExportDataButton
              data={filteredOrders}
              filename={`buyer-orders-${dateFrom.toISOString().split('T')[0]}`}
              columns={['id', 'created_at', 'amount', 'status', 'product_name']}
            />
          </div>

          {/* Main Content Grid - Stats + Activity Feed */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Stats and Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid with Comparison Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Total Spending
                    </CardTitle>
                    <CardDescription>In selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">KSh {stats.totalSpending.toLocaleString()}</p>
                    <div className="mt-2">
                      <ComparisonMetric
                        current={stats.totalSpending}
                        previous={previousStats.totalSpending}
                        format="currency"
                      />
                    </div>
                    <Button onClick={() => router.push('/orders')} className="mt-4 w-full" size="sm">
                      View Orders
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Active Orders
                    </CardTitle>
                    <CardDescription>In progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.activeOrders}</p>
                    <div className="mt-2">
                      <ComparisonMetric
                        current={stats.activeOrders}
                        previous={previousStats.activeOrders}
                        format="number"
                      />
                    </div>
                    <Button onClick={() => router.push('/orders')} variant="outline" className="mt-4 w-full" size="sm">
                      Track Orders
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Completed
                    </CardTitle>
                    <CardDescription>Successfully delivered</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.completedOrders}</p>
                    <div className="mt-2">
                      <ComparisonMetric
                        current={stats.completedOrders}
                        previous={previousStats.completedOrders}
                        format="number"
                      />
                    </div>
                    <Button onClick={() => router.push('/orders')} variant="outline" className="mt-4 w-full" size="sm">
                      View History
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Wishlist
                    </CardTitle>
                    <CardDescription>Saved items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.wishlistItems}</p>
                    <div className="mt-2">
                      <ComparisonMetric
                        current={stats.wishlistItems}
                        previous={previousStats.wishlistItems}
                        format="number"
                      />
                    </div>
                    <Button onClick={() => router.push('/wishlist')} variant="outline" className="mt-4 w-full" size="sm">
                      View Wishlist
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Spending Overview Chart */}
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                        Spending Overview
                      </CardTitle>
                      <CardDescription>Spending trends in selected period</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={spendingData}>
                      <defs>
                        <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `${value.toLocaleString()}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'spending') return [`KSh ${value.toLocaleString()}`, 'Spending'];
                          if (name === 'orders') return [value, 'Orders'];
                          return [value, name];
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="spending" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSpending)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Orders</CardTitle>
                    <Button onClick={() => router.push('/orders')} variant="ghost" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  <CardDescription>
                    {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                      <p className="text-muted-foreground text-center">
                        {recentOrders.length === 0 ? 'No orders yet. Start shopping!' : 'No orders match your filters'}
                      </p>
                      {recentOrders.length === 0 && (
                        <Button onClick={() => router.push('/marketplace')} className="mt-4">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Browse Products
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredOrders.slice(0, 5).map((order) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => router.push('/orders')}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${getStatusColor(order.status)} bg-opacity-10`}>
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">#{order.id.substring(0, 8)}</p>
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {order.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">KSh {order.amount?.toLocaleString() || '0'}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Activity Feed */}
            <div className="lg:col-span-1">
              <ActivityFeed 
                activities={activities}
                maxHeight="800px"
              />

              {/* Quick Actions below Activity Feed */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={() => router.push('/marketplace')} className="w-full justify-start">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Browse Marketplace
                  </Button>
                  <Button onClick={() => router.push('/cart')} variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    View Cart ({stats.cartItems})
                  </Button>
                  <Button onClick={() => router.push('/profile')} variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    Update Address
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
