"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugRolePage() {
  const { user } = useAuth();
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      console.log('Fetching for user ID:', user.id);

      // Try different queries
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Profile data:', profile);
      console.log('Profile error:', error);
      console.log('Profile role:', profile?.role);
      
      // Also try without single()
      const { data: profiles2, error: error2 } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);

      console.log('Profiles (array):', profiles2);
      console.log('Error2:', error2);
      
      setProfileRole(profile?.role || null);
      setLoading(false);
    };

    fetchRole();
  }, [user, supabase]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Debug: Your Current Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold">User ID:</p>
            <p className="text-sm font-mono">{user?.id || 'Not logged in'}</p>
          </div>
          
          <div>
            <p className="font-semibold">Email:</p>
            <p className="text-sm">{user?.email || 'Not logged in'}</p>
          </div>
          
          <div>
            <p className="font-semibold">Role from Database:</p>
            <p className="text-sm font-mono bg-yellow-100 p-2 rounded">
              {profileRole || 'No role found'}
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="text-sm">
              <strong>Expected:</strong> admin<br/>
              <strong>Actual:</strong> {profileRole}
            </p>
            {profileRole === 'admin' ? (
              <p className="text-green-600 font-semibold mt-2">✅ Role is correct!</p>
            ) : (
              <p className="text-red-600 font-semibold mt-2">❌ Role is not admin</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
