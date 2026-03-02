"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminTestPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
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
            You have admin access! This page verifies your role from the session.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Role: {user.role}
          </p>
          <p className="text-sm text-muted-foreground">
            User ID: {user.id}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
