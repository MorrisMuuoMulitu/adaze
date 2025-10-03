"use client";

import { useState, useEffect, useMemo } from 'react';
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

export default function TransporterDashboardPage() {
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
    availableDeliveries: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
    totalEarnings: 0,
    weeklyEarnings: 0,
    averageCommission: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<any[]>([]);
  const [earningsData, setEarningsData] = useState<any[]>([]);

  // Previous period state
  const [prevStats, setPrevStats] = useState({
    activeDeliveries: 0,
    completedDeliveries: 0,
    totalEarnings: 0,
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

        // Fetch available deliveries (orders that need a transporter)
        const { count: availableCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .is('transporter_id', null)
          .in('status', ['confirmed']);

        // Fetch active deliveries within date range
        const { count: activeCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('transporter_id', user.id)
          .eq('status', 'shipped')
          .gte('created_at', dateFrom.toISOString())
          .lte('created_at', dateTo.toISOString());

        // Fetch completed deliveries within date range
        const { count: completedCount, data: completedData } = await supabase
          .from('orders')
          .select('*, id, amount, status, created_at', { count: 'exact' })
          .eq('transporter_id', user.id)
          .eq('status', 'delivered')
          .gte('created_at', dateFrom.toISOString())
          .lte('created_at', dateTo.toISOString())
          .order('created_at', { ascending: false });

        // Calculate earnings (10% commission)
        const { data: earningsData } = await supabase
          .from('orders')
          .select('amount, created_at')
          .eq('transporter_id', user.id)
          .eq('status', 'delivered')
          .gte('created_at', dateFrom.toISOString())
          .lte('created_at', dateTo.toISOString());

        const totalEarnings = earningsData?.reduce((sum, order) => sum + (order.amount * 0.1 || 0), 0) || 0;

        // Calculate previous period
        const periodLength = dateTo.getTime() - dateFrom.getTime();
        const prevFrom = new Date(dateFrom.getTime() - periodLength);
        const prevTo = new Date(dateTo.getTime() - periodLength);

        // Fetch previous period data
        const { count: prevActiveCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('transporter_id', user.id)
          .eq('status', 'shipped')
          .gte('created_at', prevFrom.toISOString())
          .lte('created_at', prevTo.toISOString());

        const { count: prevCompletedCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('transporter_id', user.id)
          .eq('status', 'delivered')
          .gte('created_at', prevFrom.toISOString())
          .lte('created_at', prevTo.toISOString());

        const { data: prevEarningsData } = await supabase
          .from('orders')
          .select('amount')
          .eq('transporter_id', user.id)
          .eq('status', 'delivered')
          .gte('created_at', prevFrom.toISOString())
          .lte('created_at', prevTo.toISOString());

        const prevTotalEarnings = prevEarningsData?.reduce((sum, order) => sum + (order.amount * 0.1 || 0), 0) || 0;

        setPrevStats({
          activeDeliveries: prevActiveCount || 0,
          completedDeliveries: prevCompletedCount || 0,
          totalEarnings: prevTotalEarnings,
        });

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

        // Generate earnings chart data
        const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
        const days = Array.from({ length: Math.min(daysDiff, 30) }, (_, i) => {
          const date = new Date(dateFrom);
          date.setDate(dateFrom.getDate() + i);
          return date;
        });

        const chartData = days.map(date => {
          const dayDeliveries = earningsData?.filter(delivery => {
            const deliveryDate = new Date(delivery.created_at);
            return deliveryDate.toDateString() === date.toDateString();
          }) || [];

          const dayEarnings = dayDeliveries.reduce((sum, delivery) => sum + ((delivery.amount || 0) * 0.1), 0);

          return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
          .gte('created_at', dateFrom.toISOString())
          .lte('created_at', dateTo.toISOString())
          .order('created_at', { ascending: false })
          .limit(20);

        setRecentDeliveries(deliveriesData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, router, supabase, dateFrom, dateTo]);

  // Filter deliveries based on filters
  const filteredDeliveries = useMemo(() => {
    let result = recentDeliveries;
    
    if (filters.status) {
      result = result.filter(d => d.status === filters.status);
    }
    
    if (filters.minAmount !== undefined) {
      result = result.filter(d => d.amount >= filters.minAmount!);
    }
    
    if (filters.maxAmount !== undefined) {
      result = result.filter(d => d.amount <= filters.maxAmount!);
    }
    
    if (filters.search) {
      result = result.filter(d => 
        d.id.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    return result;
  }, [recentDeliveries, filters]);

  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    const count = Object.keys(newFilters).filter(k => newFilters[k as keyof FilterValues]).length;
    setActiveFilterCount(count);
  };

  // Transform deliveries to activities
  const activities = useMemo(() => {
    return filteredDeliveries.slice(0, 10).map(delivery => ({
      id: delivery.id,
      type: 'delivery' as const,
      action: `Delivery ${delivery.status}`,
      description: `Delivery #${delivery.id.substring(0, 8)} - KSh ${((delivery.amount || 0) * 0.1).toLocaleString()} commission`,
      timestamp: new Date(delivery.created_at),
      status: (delivery.status === 'delivered' ? 'success' : delivery.status === 'cancelled' ? 'error' : 'pending') as 'success' | 'pending' | 'error' | 'info',
      amount: (delivery.amount || 0) * 0.1,
    }));
  }, [filteredDeliveries]);

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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Toolbar with DateRangePicker, Filters, and Export */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
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
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'shipped', label: 'In Transit' },
                { value: 'delivered', label: 'Delivered' }
              ]}
              activeFiltersCount={activeFilterCount}
            />
            <ExportDataButton
              data={filteredDeliveries}
              filename={`transporter-deliveries-${new Date().toISOString().split('T')[0]}`}
              columns={['id', 'created_at', 'amount', 'status']}
            />
          </div>

          {/* 3-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Stats and Charts (2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Available Deliveries
                    </CardTitle>
                    <CardDescription>Ready to accept</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-2">{stats.availableDeliveries}</p>
                    <Button onClick={() => router.push('/transporter/available-deliveries')} className="mt-2 w-full" size="sm">
                      View Available
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Active Deliveries
                    </CardTitle>
                    <CardDescription>In selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-2">{stats.activeDeliveries}</p>
                    <ComparisonMetric
                      current={stats.activeDeliveries}
                      previous={prevStats.activeDeliveries}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Completed Deliveries
                    </CardTitle>
                    <CardDescription>In selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-2">{stats.completedDeliveries}</p>
                    <ComparisonMetric
                      current={stats.completedDeliveries}
                      previous={prevStats.completedDeliveries}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Total Earnings
                    </CardTitle>
                    <CardDescription>10% commission</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-2">KSh {stats.totalEarnings.toLocaleString()}</p>
                    <ComparisonMetric
                      current={stats.totalEarnings}
                      previous={prevStats.totalEarnings}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Earnings Chart */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                        Earnings Overview
                      </CardTitle>
                      <CardDescription>10% commission per delivery</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">KSh {stats.totalEarnings.toLocaleString()}</p>
                      <ComparisonMetric
                        current={stats.totalEarnings}
                        previous={prevStats.totalEarnings}
                      />
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
                          if (name === 'earnings') return [`KSh ${value.toLocaleString()}`, 'Earnings'];
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

              {/* Performance Card */}
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

              {/* Quick Actions */}
              <div>
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => router.push('/transporter/available-deliveries')} size="lg" className="h-16">
                    <Package className="h-5 w-5 mr-2" />
                    Browse Available
                  </Button>
                  <Button onClick={() => router.push('/transporter/my-deliveries')} size="lg" variant="outline" className="h-16">
                    <Truck className="h-5 w-5 mr-2" />
                    My Active Deliveries
                  </Button>
                  <Button onClick={() => router.push('/transporter')} size="lg" variant="outline" className="h-16">
                    <MapPin className="h-5 w-5 mr-2" />
                    View All Routes
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Activity Feed (1 column) */}
            <div>
              <ActivityFeed
                activities={activities}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
