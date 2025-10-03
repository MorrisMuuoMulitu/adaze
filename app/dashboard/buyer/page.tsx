
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, User, MapPin, TrendingUp, Clock, CheckCircle, Heart, ArrowRight, TrendingDown, DollarSign } from 'lucide-react';
import { LogoutButton } from '@/components/LogoutButton';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    wishlistItems: 0,
    cartItems: 0,
    totalSpending: 0,
    weeklySpending: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [spendingData, setSpendingData] = useState<any[]>([]);

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

        // Fetch active orders count
        const { count: activeCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', user.id)
          .in('status', ['pending', 'confirmed', 'shipped']);

        // Fetch completed orders count
        const { count: completedCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', user.id)
          .eq('status', 'delivered');

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

        // Calculate total spending
        const { data: allOrders } = await supabase
          .from('orders')
          .select('amount, created_at')
          .eq('buyer_id', user.id)
          .eq('status', 'delivered');

        const totalSpending = allOrders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

        // Calculate weekly spending (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklySpending = allOrders?.filter(order => 
          new Date(order.created_at) >= weekAgo
        ).reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

        // Generate spending chart data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date;
        });

        const chartData = last7Days.map(date => {
          const dayOrders = allOrders?.filter(order => {
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
          weeklySpending,
        });

        setSpendingData(chartData);

        // Fetch recent orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('buyer_id', user.id)
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
    return <div className="min-h-screen flex items-center justify-center">Profile not found or not logged in.</div>;
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Active Orders
                </CardTitle>
                <CardDescription>Orders in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.activeOrders}</p>
                <p className="text-sm text-muted-foreground">Pending & In Transit</p>
                <Button onClick={() => router.push('/orders')} className="mt-4 w-full">View Orders</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Completed Orders
                </CardTitle>
                <CardDescription>Purchase history</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.completedOrders}</p>
                <p className="text-sm text-muted-foreground">Delivered successfully</p>
                <Button onClick={() => router.push('/orders')} variant="outline" className="mt-4 w-full">View History</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart Items
                </CardTitle>
                <CardDescription>Ready to checkout</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.cartItems}</p>
                <p className="text-sm text-muted-foreground">Items in cart</p>
                <Button onClick={() => router.push('/cart')} variant="outline" className="mt-4 w-full">View Cart</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Wishlist
                </CardTitle>
                <CardDescription>Saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.wishlistItems}</p>
                <p className="text-sm text-muted-foreground">Favorite products</p>
                <Button onClick={() => router.push('/wishlist')} variant="outline" className="mt-4 w-full">View Wishlist</Button>
              </CardContent>
            </Card>
          </div>

          {/* Spending Overview Chart */}
          <div className="mt-8">
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                      Spending Overview
                    </CardTitle>
                    <CardDescription>Your spending trends over the last 7 days</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">KSh {stats.totalSpending.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {stats.weeklySpending > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">KSh {stats.weeklySpending.toLocaleString()} this week</span>
                        </>
                      ) : (
                        <span>No spending this week</span>
                      )}
                    </div>
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
                      tickFormatter={(value) => `KSh ${value.toLocaleString()}`}
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
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={() => router.push('/marketplace')} size="lg" className="h-20">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Browse Marketplace
              </Button>
              <Button onClick={() => router.push('/orders/create')} size="lg" variant="outline" className="h-20">
                <Package className="h-5 w-5 mr-2" />
                Create Order Request
              </Button>
              <Button onClick={() => router.push('/profile')} size="lg" variant="outline" className="h-20">
                <MapPin className="h-5 w-5 mr-2" />
                Update Delivery Address
              </Button>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recent Orders</h2>
              <Button onClick={() => router.push('/orders')} variant="ghost" size="sm">
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
                    Start shopping to see your orders here
                  </p>
                  <Button onClick={() => router.push('/marketplace')}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Browse Products
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {recentOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/orders')}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={`p-3 rounded-full ${getStatusColor(order.status)} bg-opacity-10`}>
                              {getStatusIcon(order.status)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">Order #{order.id.substring(0, 8)}</h3>
                                <Badge variant="secondary" className="capitalize">
                                  {order.status}
                                </Badge>
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
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
