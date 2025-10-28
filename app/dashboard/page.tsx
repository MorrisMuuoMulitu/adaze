
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      router.push('/'); // Redirect to home if not logged in
      return;
    }

    const fetchProfileAndRedirect = async () => {
      console.log("Fetching profile for user:", user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Handle error, maybe redirect to a generic error page or show a toast
        router.push('/');
      } else if (data) {
        // Redirect based on role
        const { role } = data;
        console.log("User role is:", role);
        console.log("Redirecting to /dashboard/" + role);
        if (role === 'buyer') {
          router.push('/dashboard/buyer');
        } else if (role === 'trader') {
          router.push('/dashboard/trader');
        } else if (role === 'transporter') {
          router.push('/dashboard/transporter');
        } else if (role === 'wholesaler') {
          router.push('/dashboard/wholesaler');
        } else {
          // Handle unknown role, maybe redirect to profile page to set role
          router.push('/profile');
        }
      }
    };

    fetchProfileAndRedirect();
  }, [user, router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading your dashboard...</p>
    </div>
  );
}
