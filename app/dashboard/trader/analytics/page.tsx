
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BarChart3, DollarSign, Package, ShoppingBag } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ProductSales {
  product_id: string;
  product_name: string;
  total_quantity_sold: number;
  total_revenue: number;
}

export default function TraderAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [topSellingProducts, setTopSellingProducts] = useState<any[]>([]);
  const [activeListingsCount, setActiveListingsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'TRADER') {
      router.push('/');
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/trader/analytics');
        if (!res.ok) throw new Error('Failed to fetch analytics');
        
        const data = await res.json();
        setTotalRevenue(data.totalRevenue);
        setTopSellingProducts(data.topSellingProducts);
        setActiveListingsCount(data.activeListingsCount);
      } catch (error: any) {
        toast.error("Failed to fetch analytics data", { description: error.message });
        console.error('Analytics fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, authLoading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Sales Analytics
            </CardTitle>
            <CardDescription>Overview of your sales performance and product insights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KSh {totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">From all delivered orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeListingsCount}</div>
                  <p className="text-xs text-muted-foreground">Products currently for sale</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Top Selling Products
                </CardTitle>
                <CardDescription>Products generating the most revenue.</CardDescription>
              </CardHeader>
              <CardContent>
                {topSellingProducts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No sales data available yet.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Quantity Sold</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topSellingProducts.map((product) => (
                        <TableRow key={product.product_id}>
                          <TableCell>{product.product_name}</TableCell>
                          <TableCell>{product.total_quantity_sold}</TableCell>
                          <TableCell>KSh {product.total_revenue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
