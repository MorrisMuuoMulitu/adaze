
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BarChart3, Truck, CheckCircle } from 'lucide-react';

export default function TransporterPerformancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [completedDeliveries, setCompletedDeliveries] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchPerformance = async () => {
      setLoading(true);
      try {
        // Fetch total completed deliveries
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .eq('transporter_id', user.id)
          .eq('status', 'delivered');

        if (error) throw error;
        setCompletedDeliveries(count || 0);

      } catch (error: any) {
        toast.error("Failed to fetch performance data", { description: error.message });
        console.error('Performance fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [user, supabase]);

  if (loading) {
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
            <CardDescription>Overview of your delivery statistics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Deliveries</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedDeliveries}</div>
                  <p className="text-xs text-muted-foreground">Total orders delivered</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">N/A</div> {/* This needs to be fetched */}
                  <p className="text-xs text-muted-foreground">Based on buyer feedback</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
