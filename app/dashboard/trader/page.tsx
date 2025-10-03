
"use client";

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!user) {
      router.push('/'); // Redirect to home if not logged in
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

        // Fetch received orders
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('trader_id', user.id);

        // Fetch total revenue (sum of completed orders)
        const { data: revenueData } = await supabase
          .from('orders')
          .select('amount, created_at')
          .eq('trader_id', user.id)
          .eq('status', 'delivered');

        const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

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

        // Generate revenue chart data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date;
        });

        const chartData = last7Days.map(date => {
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

        // Fetch recent orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('trader_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentOrders(ordersData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, router, supabase]);

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
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold capitalize flex items-center gap-3">
                {profile.role} Dashboard
                <Badge variant="secondary" className="capitalize text-sm px-3 py-1">
                  {profile.role}
                </Badge>
              </h1>
              <p className="text-muted-foreground mt-1">Welcome back, {profile.full_name || user.email}! 💼</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <Button onClick={() => router.push('/profile')} variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <LogoutButton variant="outline" size="sm" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Total Products
                </CardTitle>
                <CardDescription>All your listings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalProducts}</p>
                <p className="text-sm text-muted-foreground">Products listed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Active Listings
                </CardTitle>
                <CardDescription>Currently available</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.activeListings}</p>
                <p className="text-sm text-muted-foreground">Available for purchase</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Received Orders
                </CardTitle>
                <CardDescription>Total orders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.receivedOrders}</p>
                <p className="text-sm text-muted-foreground">All time orders</p>
                <Button onClick={() => router.push('/orders/received')} variant="outline" className="mt-4 w-full">View Orders</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Total Revenue
                </CardTitle>
                <CardDescription>Completed sales</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">KSh {stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">From delivered orders</p>
                <Button onClick={() => router.push('/dashboard/trader/analytics')} variant="outline" className="mt-4 w-full">View Analytics</Button>
              </CardContent>
            </Card>
          </div>

          {/* Performance Card */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Your Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Average Rating</p>
                    <p className="text-2xl font-bold">{averageRating !== null ? averageRating.toFixed(1) : 'N/A'} ⭐</p>
                    <p className="text-xs text-muted-foreground">Based on customer reviews</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Service Area</p>
                    <p className="text-lg font-semibold">{profile?.location || 'Not set'}</p>
                    <Button onClick={() => router.push('/profile')} variant="link" className="p-0 h-auto text-xs">Update location</Button>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {stats.receivedOrders > 0 
                        ? Math.round((stats.totalRevenue / stats.receivedOrders) * 100) / 100
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Order completion</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Overview & Top Products Grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart - 2 columns */}
            <div className="lg:col-span-2">
              <Card className="border-l-4 border-l-green-500 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Revenue Trends
                      </CardTitle>
                      <CardDescription>Your earnings over the last 7 days</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">KSh {stats.totalRevenue.toLocaleString()}</p>
                      <div className="flex items-center gap-1 text-sm">
                        {stats.weeklyRevenue > 0 ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 font-medium">+KSh {stats.weeklyRevenue.toLocaleString()} this week</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">No revenue this week</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'revenue') return [`KSh ${value.toLocaleString()}`, 'Revenue'];
                          if (name === 'orders') return [value, 'Orders'];
                          return [value, name];
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#22c55e" 
                        strokeWidth={3}
                        dot={{ fill: '#22c55e', r: 5 }}
                        activeDot={{ r: 7 }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Order Value</p>
                      <p className="text-xl font-bold">KSh {stats.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-xl font-bold">{stats.receivedOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products - 1 column */}
            <div>
              <Card className="border-l-4 border-l-amber-500 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-600" />
                    Top Products
                  </CardTitle>
                  <CardDescription>Best performing items</CardDescription>
                </CardHeader>
                <CardContent>
                  {topProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground text-center">No products yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                              #{index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-green-600">KSh {product.price?.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={() => router.push('/products/add')} size="lg" className="h-20">
                <PlusCircle className="h-5 w-5 mr-2" />
                List New Product
              </Button>
              <Button onClick={() => router.push('/products/manage')} size="lg" variant="outline" className="h-20">
                <List className="h-5 w-5 mr-2" />
                Manage Listings
              </Button>
              <Button onClick={() => router.push('/orders/received')} size="lg" variant="outline" className="h-20">
                <ClipboardList className="h-5 w-5 mr-2" />
                View Orders
              </Button>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recent Orders</h2>
              <Button onClick={() => router.push('/orders/received')} variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            {recentOrders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-6 text-center">
                    Orders from buyers will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {recentOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/orders/received')}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`p-3 rounded-full ${getStatusColor(order.status)} bg-opacity-10`}>
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">Order #{order.id.substring(0, 8)}</h3>
                              <Badge variant="secondary" className="capitalize">{order.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">KSh {order.amount?.toLocaleString() || '0'}</p>
                          <p className="text-sm text-muted-foreground">Total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
