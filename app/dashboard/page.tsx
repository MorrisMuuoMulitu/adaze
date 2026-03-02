
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/');
      return;
    }

    const role = user.role?.toLowerCase();
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'buyer') {
      router.push('/dashboard/buyer');
    } else if (role === 'trader') {
      router.push('/dashboard/trader');
    } else if (role === 'transporter') {
      router.push('/dashboard/transporter');
    } else if (role === 'wholesaler') {
      router.push('/dashboard/wholesaler');
    } else {
      router.push('/profile');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading your dashboard...</p>
    </div>
  );
}
