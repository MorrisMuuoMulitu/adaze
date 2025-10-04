"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityDashboard } from '@/components/security/security-dashboard';
import { TwoFactorSetup } from '@/components/security/two-factor-setup';
import { User, Shield, Bell, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navbar onAuthClick={() => {}} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account security and preferences
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm shadow-md border-0 p-1.5">
            <TabsTrigger 
              value="security"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger 
              value="2fa"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Lock className="h-4 w-4 mr-2" />
              Two-Factor Auth
            </TabsTrigger>
          </TabsList>

          {/* Security Tab */}
          <TabsContent value="security">
            <SecurityDashboard />
          </TabsContent>

          {/* 2FA Tab */}
          <TabsContent value="2fa">
            <TwoFactorSetup />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
