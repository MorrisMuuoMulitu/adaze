"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BarChart3, Truck, CheckCircle, Star } from 'lucide-react';

export default function TransporterPerformancePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [performance, setPerformance] = useState({
    deliveredCount: 0,
    totalOrders: 0,
    averageRating: 0,
    reviewCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'TRANSPORTER') {
      router.push('/');
      return;
    }

    const fetchPerformance = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/transporter/performance');
        if (!res.ok) throw new Error('Failed to fetch performance data');
        
        const data = await res.json();
        setPerformance(data);
      } catch (error: any) {
        toast.error("Failed to fetch performance data", { description: error.message });
        console.error('Performance fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading performance data...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Delivery Performance
            </CardTitle>
            <CardDescription>Insights into your delivery efficiency and service quality.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performance.deliveredCount}</div>
                  <p className="text-xs text-muted-foreground">Successful completions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performance.totalOrders > 0 
                      ? Math.round((performance.deliveredCount / performance.totalOrders) * 100) 
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Completion percentage</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performance.averageRating} / 5</div>
                  <p className="text-xs text-muted-foreground">From {performance.reviewCount} reviews</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
