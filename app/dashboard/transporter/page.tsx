
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { User, Truck, MapPin, BarChart3, Package, Star, ArrowRight, CheckCircle, DollarSign, TrendingUp, Award } from 'lucide-react';
import { reviewService } from '@/lib/reviewService';
import { LogoutButton } from '@/components/LogoutButton';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  location: string;
  avatar_url: string;
  role: 'buyer' | 'trader' | 'transporter';
}

export default function TransporterDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [stats, setStats] = useState({
    availableDeliveries: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
    totalEarnings: 0,
    weeklyEarnings: 0,
    averageCommission: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<any[]>([]);
  const [earningsData, setEarningsData] = useState<any[]>([]);

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

        // Fetch available deliveries (orders that need a transporter)
        const { count: availableCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .is('transporter_id', null)
          .in('status', ['confirmed']);

        // Fetch active deliveries (assigned to this transporter and in transit)
        const { count: activeCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('transporter_id', user.id)
          .eq('status', 'shipped');

        // Fetch completed deliveries
        const { count: completedCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('transporter_id', user.id)
          .eq('status', 'delivered');

        // Calculate earnings (assuming delivery fee is 10% of order amount)
        const { data: earningsData } = await supabase
          .from('orders')
          .select('amount, created_at')
          .eq('transporter_id', user.id)
          .eq('status', 'delivered');

        const totalEarnings = earningsData?.reduce((sum, order) => sum + (order.amount * 0.1 || 0), 0) || 0;

        // Calculate weekly earnings (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyEarnings = earningsData?.filter(delivery => 
          new Date(delivery.created_at) >= weekAgo
        ).reduce((sum, delivery) => sum + ((delivery.amount || 0) * 0.1), 0) || 0;

        // Calculate average commission per delivery
        const averageCommission = earningsData && earningsData.length > 0 
          ? totalEarnings / earningsData.length 
          : 0;

        // Generate earnings chart data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date;
        });

        const chartData = last7Days.map(date => {
          const dayDeliveries = earningsData?.filter(delivery => {
            const deliveryDate = new Date(delivery.created_at);
            return deliveryDate.toDateString() === date.toDateString();
          }) || [];

          const dayEarnings = dayDeliveries.reduce((sum, delivery) => sum + ((delivery.amount || 0) * 0.1), 0);

          return {
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            earnings: dayEarnings,
            deliveries: dayDeliveries.length
          };
        });

        setStats({
          availableDeliveries: availableCount || 0,
          activeDeliveries: activeCount || 0,
          completedDeliveries: completedCount || 0,
          totalEarnings,
          weeklyEarnings,
          averageCommission,
        });

        setEarningsData(chartData);

        // Fetch recent deliveries
        const { data: deliveriesData } = await supabase
          .from('orders')
          .select('*')
          .eq('transporter_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentDeliveries(deliveriesData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, router, supabase]);

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
              <p className="text-muted-foreground mt-1">Welcome back, {profile.full_name || user.email}! 🚚</p>
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
                  <Package className="h-5 w-5" />
                  Available Deliveries
                </CardTitle>
                <CardDescription>Ready to accept</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.availableDeliveries}</p>
                <p className="text-sm text-muted-foreground">Awaiting transporter</p>
                <Button onClick={() => router.push('/transporter/available-deliveries')} className="mt-4 w-full">View Available</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Active Deliveries
                </CardTitle>
                <CardDescription>In transit</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.activeDeliveries}</p>
                <p className="text-sm text-muted-foreground">Currently delivering</p>
                <Button onClick={() => router.push('/transporter/my-deliveries')} className="mt-4 w-full">View My Deliveries</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Completed Deliveries
                </CardTitle>
                <CardDescription>All time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.completedDeliveries}</p>
                <p className="text-sm text-muted-foreground">Successfully delivered</p>
                <Button onClick={() => router.push('/dashboard/transporter/performance')} variant="outline" className="mt-4 w-full">View Performance</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Total Earnings
                </CardTitle>
                <CardDescription>From deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">KSh {stats.totalEarnings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">10% of order value</p>
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
                    <p className="text-xs text-muted-foreground">From traders & buyers</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Service Area</p>
                    <p className="text-lg font-semibold">{profile?.location || 'Not set'}</p>
                    <Button onClick={() => router.push('/profile')} variant="link" className="p-0 h-auto text-xs">Update zones</Button>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {(stats.activeDeliveries + stats.completedDeliveries) > 0
                        ? Math.round((stats.completedDeliveries / (stats.activeDeliveries + stats.completedDeliveries)) * 100)
                        : 100}%
                    </p>
                    <p className="text-xs text-muted-foreground">On-time deliveries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Chart */}
          <div className="mt-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      Earnings Overview
                    </CardTitle>
                    <CardDescription>Your commission earnings over the last 7 days (10% per delivery)</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">KSh {stats.totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <div className="flex items-center gap-1 text-sm">
                      {stats.weeklyEarnings > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">+KSh {stats.weeklyEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })} this week</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">No earnings this week</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={earningsData}>
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
                        if (name === 'earnings') return [`KSh ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Earnings'];
                        if (name === 'deliveries') return [value, 'Deliveries'];
                        return [value, name];
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Bar 
                      dataKey="earnings" 
                      radius={[8, 8, 0, 0]}
                      animationDuration={1500}
                    >
                      {earningsData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.earnings > 0 ? '#3b82f6' : '#e5e7eb'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Commission</p>
                    <p className="text-xl font-bold">KSh {stats.averageCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-xl font-bold">{stats.completedDeliveries}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Now</p>
                    <p className="text-xl font-bold text-blue-600">{stats.activeDeliveries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={() => router.push('/transporter/available-deliveries')} size="lg" className="h-20">
                <Package className="h-5 w-5 mr-2" />
                Browse Available Deliveries
              </Button>
              <Button onClick={() => router.push('/transporter/my-deliveries')} size="lg" variant="outline" className="h-20">
                <Truck className="h-5 w-5 mr-2" />
                My Active Deliveries
              </Button>
              <Button onClick={() => router.push('/transporter')} size="lg" variant="outline" className="h-20">
                <MapPin className="h-5 w-5 mr-2" />
                View All Routes
              </Button>
            </div>
          </div>

          {/* Recent Deliveries */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recent Deliveries</h2>
              <Button onClick={() => router.push('/transporter/my-deliveries')} variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            {recentDeliveries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Truck className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No deliveries yet</h3>
                  <p className="text-muted-foreground mb-6 text-center">
                    Accepted deliveries will appear here
                  </p>
                  <Button onClick={() => router.push('/transporter/available-deliveries')}>
                    Browse Available Deliveries
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {recentDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/transporter/my-deliveries')}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                            <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">Delivery #{delivery.id.substring(0, 8)}</h3>
                              <Badge variant="secondary" className="capitalize">{delivery.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(delivery.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">KSh {((delivery.amount || 0) * 0.1).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Commission</p>
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
