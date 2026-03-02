"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, Users, Package, ShoppingCart, DollarSign, Calendar } from 'lucide-react';

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading || !analytics) {
    return <div className="p-8 text-center">Synchronizing analytical data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tighter">Marketplace Intelligence</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Real-time performance metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px] rounded-none border-border/50">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Cycles</SelectItem>
            <SelectItem value="30days">Last 30 Cycles</SelectItem>
            <SelectItem value="90days">Quarterly Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-none border-border/50 bg-muted/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-40">Gross Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-mono text-accent">KSh {analytics.metrics.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-none border-border/50 bg-muted/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-40">Order Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-mono">{analytics.metrics.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/50 bg-muted/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-mono">{analytics.metrics.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/50 bg-muted/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-40">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-mono">
              {analytics.metrics.totalOrders > 0 
                ? Math.round((analytics.ordersByStatus.delivered / analytics.metrics.totalOrders) * 100) 
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-none border-border/50 bg-muted/5">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase">Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analytics.ordersByStatus).map(([status, count]: [any, any]) => (
              <div key={status} className="flex justify-between items-center border-b border-border/30 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{status}</span>
                <span className="font-mono font-bold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/50 bg-muted/5">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase">User Demographics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analytics.usersByRole).map(([role, count]: [any, any]) => (
              <div key={role} className="flex justify-between items-center border-b border-border/30 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{role}</span>
                <span className="font-mono font-bold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
