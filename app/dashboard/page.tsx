"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Package, Truck, ShoppingCart, User, Users, BarChart3, MapPin } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  location: string;
  avatar_url: string;
  role: 'buyer' | 'trader' | 'transporter';
}

export default function DashboardPage() {
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

  // Different dashboard content based on user role
  const renderRoleSpecificContent = () => {
    switch (profile.role) {
      case 'buyer':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Your Orders
                </CardTitle>
                <CardDescription>View your orders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Active orders</p>
                <Button onClick={() => router.push('/orders')} className="mt-4 w-full">View Orders</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Your Location
                </CardTitle>
                <CardDescription>Manage your delivery preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{profile.location || 'Not set'}</p>
                <Button onClick={() => router.push('/profile')} variant="outline" className="mt-4 w-full">Update Location</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Purchase History
                </CardTitle>
                <CardDescription>Track your purchase history</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Completed purchases</p>
                <Button onClick={() => router.push('/orders')} variant="outline" className="mt-4 w-full">View History</Button>
              </CardContent>
            </Card>
          </div>
        );
      case 'trader':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Assigned Orders
                </CardTitle>
                <CardDescription>Manage orders assigned to you</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Active orders</p>
                <Button onClick={() => router.push('/marketplace')} className="mt-4 w-full">View Orders</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
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
        );
      case 'transporter':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Assigned Deliveries
                </CardTitle>
                <CardDescription>Manage deliveries assigned to you</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Active deliveries</p>
                <Button onClick={() => router.push('/transporter')} className="mt-4 w-full">View Deliveries</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Service Area
                </CardTitle>
                <CardDescription>Manage your delivery zones</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{profile.location || 'Not set'}</p>
                <Button onClick={() => router.push('/profile')} variant="outline" className="mt-4 w-full">Update Zones</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Delivery Stats
                </CardTitle>
                <CardDescription>Track your delivery performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Deliveries completed</p>
                <Button onClick={() => router.push('/transporter')} variant="outline" className="mt-4 w-full">View Performance</Button>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Welcome to the Dashboard</h2>
            <p className="text-muted-foreground">Your role hasn't been fully set up yet. Please update your profile.</p>
            <Button className="mt-4" onClick={() => router.push('/profile')}>Update Profile</Button>
          </div>
        );
    }
  };

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
              <h1 className="text-3xl font-bold">Dashboard</h1>
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

          {renderRoleSpecificContent()}
        </motion.div>
      </div>
    </div>
  );
}