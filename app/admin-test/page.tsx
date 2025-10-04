"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminTestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setRole(profile?.role || null);
      setLoading(false);

      if (profile?.role !== 'admin') {
        router.push('/');
      }
    };

    checkRole();
  }, [user, router, supabase]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (role !== 'admin') {
    return <div className="p-8">Access Denied - Not Admin</div>;
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>✅ Admin Access Test - SUCCESS!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600 font-semibold">
            You have admin access! This page bypasses middleware.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Role: {role}
          </p>
          <p className="text-sm text-muted-foreground">
            User ID: {user?.id}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
