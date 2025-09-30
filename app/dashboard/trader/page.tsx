
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { User, BarChart3, ClipboardList, Globe, PlusCircle, List } from 'lucide-react';

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

  useEffect(() => {
    if (!user) {
      router.push('/'); // Redirect to home if not logged in
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, location, avatar_url, role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, router, supabase]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold capitalize">{profile.role} Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {profile.full_name || user.email}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Badge variant="secondary" className="capitalize text-lg px-3 py-1">
                {profile.role}
              </Badge>
              <Button onClick={() => router.push('/profile')}>
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  List a New Product
                </CardTitle>
                <CardDescription>Add a new product to the marketplace for buyers to purchase.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/products/add')} className="mt-4 w-full">List New Product</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Manage Your Listings
                </CardTitle>
                <CardDescription>View, edit, or remove your current product listings.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/products/manage')} className="mt-4 w-full">Manage Listings</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  View Received Orders
                </CardTitle>
                <CardDescription>See and manage the orders that buyers have placed for your products.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/orders/received')} className="mt-4 w-full">View Received Orders</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Service Area
                </CardTitle>
                <CardDescription>Manage your service locations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{profile.location || 'Not set'}</p>
                <Button onClick={() => router.push('/profile')} variant="outline" className="mt-4 w-full">Update Area</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Trading Stats
                </CardTitle>
                <CardDescription>View your trading performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">$0.00</p>
                <p className="text-sm text-muted-foreground">Revenue this month</p>
                <Button onClick={() => router.push('/orders')} variant="outline" className="mt-4 w-full">View Analytics</Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
