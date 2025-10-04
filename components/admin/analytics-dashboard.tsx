"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Package, ShoppingCart, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  revenueData: Array<{ date: string; revenue: number; orders: number }>;
  userGrowth: Array<{ date: string; buyers: number; traders: number; transporters: number }>;
  categoryData: Array<{ name: string; value: number; revenue: number }>;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  metrics: {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    ordersGrowth: number;
    totalUsers: number;
    usersGrowth: number;
    completionRate: number;
    avgOrderValue: number;
  };
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenueData: [],
    userGrowth: [],
    categoryData: [],
    topProducts: [],
    metrics: {
      totalRevenue: 0,
      revenueGrowth: 0,
      totalOrders: 0,
      ordersGrowth: 0,
      totalUsers: 0,
      usersGrowth: 0,
      completionRate: 0,
      avgOrderValue: 0,
    },
  });

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const ranges: Record<string, Date> = {
        '7days': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30days': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        '90days': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        'year': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      };

      const startDate = ranges[timeRange];

      // Fetch orders for revenue data (only delivered orders for revenue)
      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, amount, status')
        .gte('created_at', startDate.toISOString());

      // Fetch order items with products for top products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          quantity,
          price,
          product_id,
          order_id,
          products (
            id,
            name,
            image_url
          ),
          orders!inner (
            status,
            created_at
          )
        `)
        .gte('orders.created_at', startDate.toISOString())
        .eq('orders.status', 'delivered'); // Only delivered orders

      // Fetch products for category data
      const { data: products } = await supabase
        .from('products')
        .select('category, price, status');

      // Fetch users for growth data
      const { data: users } = await supabase
        .from('profiles')
        .select('created_at, role')
        .gte('created_at', startDate.toISOString());

      // Process revenue data by date (only delivered orders)
      const revenueByDate: Record<string, { revenue: number; orders: number }> = {};
      (orders || []).forEach((order) => {
        // Only count delivered orders for revenue
        if (order.status === 'delivered') {
          const date = new Date(order.created_at).toLocaleDateString();
          if (!revenueByDate[date]) {
            revenueByDate[date] = { revenue: 0, orders: 0 };
          }
          revenueByDate[date].revenue += Number(order.amount);
          revenueByDate[date].orders += 1;
        }
      });

      const revenueData = Object.entries(revenueByDate).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }));

      // Process user growth by date
      const usersByDate: Record<string, { buyers: number; traders: number; transporters: number }> = {};
      (users || []).forEach((user) => {
        const date = new Date(user.created_at).toLocaleDateString();
        if (!usersByDate[date]) {
          usersByDate[date] = { buyers: 0, traders: 0, transporters: 0 };
        }
        if (user.role === 'buyer') usersByDate[date].buyers += 1;
        if (user.role === 'trader') usersByDate[date].traders += 1;
        if (user.role === 'transporter') usersByDate[date].transporters += 1;
      });

      const userGrowth = Object.entries(usersByDate).map(([date, data]) => ({
        date,
        ...data,
      }));

      // Process category data
      const categoryStats: Record<string, { count: number; revenue: number }> = {};
      (products || []).forEach((product) => {
        const category = product.category || 'Other';
        if (!categoryStats[category]) {
          categoryStats[category] = { count: 0, revenue: 0 };
        }
        categoryStats[category].count += 1;
        if (product.status === 'active') {
          categoryStats[category].revenue += Number(product.price);
        }
      });

      const categoryData = Object.entries(categoryStats)
        .map(([name, data]) => ({
          name,
          value: data.count,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      // Top products (real data from order_items)
      const productStats: Record<string, { name: string; sales: number; revenue: number }> = {};
      (orderItems || []).forEach((item: any) => {
        const productId = item.product_id;
        const productName = item.products?.name || 'Unknown Product';
        
        if (!productStats[productId]) {
          productStats[productId] = {
            name: productName,
            sales: 0,
            revenue: 0,
          };
        }
        
        productStats[productId].sales += item.quantity;
        productStats[productId].revenue += Number(item.price) * item.quantity;
      });

      const topProducts = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate metrics (only delivered orders for revenue)
      const deliveredOrders = (orders || []).filter(o => o.status === 'delivered');
      const totalRevenue = deliveredOrders.reduce((sum, o) => sum + Number(o.amount), 0);
      const totalOrders = orders?.length || 0;
      const completedOrders = deliveredOrders.length;
      const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
      const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

      // Calculate growth (comparing first half vs second half of period - only delivered)
      const midPoint = new Date((now.getTime() + startDate.getTime()) / 2);
      const recentDelivered = deliveredOrders.filter(o => new Date(o.created_at) >= midPoint);
      const oldDelivered = deliveredOrders.filter(o => new Date(o.created_at) < midPoint);
      const recentRevenue = recentDelivered.reduce((sum, o) => sum + Number(o.amount), 0);
      const oldRevenue = oldDelivered.reduce((sum, o) => sum + Number(o.amount), 0);
      const revenueGrowth = oldRevenue > 0 ? ((recentRevenue - oldRevenue) / oldRevenue) * 100 : 0;
      
      // Orders growth (all orders, not just delivered)
      const recentOrders = (orders || []).filter(o => new Date(o.created_at) >= midPoint);
      const oldOrders = (orders || []).filter(o => new Date(o.created_at) < midPoint);
      const ordersGrowth = oldOrders.length > 0 ? ((recentOrders.length - oldOrders.length) / oldOrders.length) * 100 : 0;

      // User growth
      const { data: allUsers } = await supabase.from('profiles').select('id');
      const totalUsers = allUsers?.length || 0;
      const recentUsers = (users || []).filter(u => new Date(u.created_at) >= midPoint);
      const oldUsers = (users || []).filter(u => new Date(u.created_at) < midPoint);
      const usersGrowth = oldUsers.length > 0 ? ((recentUsers.length - oldUsers.length) / oldUsers.length) * 100 : 0;

      setAnalytics({
        revenueData,
        userGrowth,
        categoryData,
        topProducts,
        metrics: {
          totalRevenue,
          revenueGrowth,
          totalOrders,
          ordersGrowth,
          totalUsers,
          usersGrowth,
          completionRate,
          avgOrderValue,
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const TrendIndicator = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span className="font-semibold">{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Analytics</h2>
          <p className="text-muted-foreground">Track your marketplace performance</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KSh {analytics.metrics.totalRevenue.toLocaleString()}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-purple-100">Delivered orders only</span>
              <TrendIndicator value={analytics.metrics.revenueGrowth} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.metrics.totalOrders}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-blue-100">vs previous period</span>
              <TrendIndicator value={analytics.metrics.ordersGrowth} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-xl transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.metrics.totalUsers}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-green-100">vs previous period</span>
              <TrendIndicator value={analytics.metrics.usersGrowth} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white hover:shadow-xl transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.metrics.completionRate.toFixed(1)}%</div>
            <div className="mt-2">
              <span className="text-xs text-orange-100">Avg Order: KSh {analytics.metrics.avgOrderValue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Daily revenue over selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Orders Trend
            </CardTitle>
            <CardDescription>Daily orders over selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              User Growth
            </CardTitle>
            <CardDescription>New user registrations by role</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend />
                <Bar dataKey="buyers" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="traders" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="transporters" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Sales by Category
            </CardTitle>
            <CardDescription>Product distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
          <CardDescription>Best selling products by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="revenue" fill="url(#colorBar)" radius={[0, 8, 8, 0]}>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
