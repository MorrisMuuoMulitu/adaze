"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Ban,
  Unlock,
  TrendingUp,
  Users,
  Activity,
  Lock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SuspiciousActivity {
  id: string;
  user_id: string;
  activity_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: string;
  created_at: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

interface SecurityStats {
  total_users_with_2fa: number;
  suspicious_activities_today: number;
  failed_logins_today: number;
  blocked_logins_today: number;
}

export function SecurityMonitoring() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState<SuspiciousActivity[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    total_users_with_2fa: 0,
    suspicious_activities_today: 0,
    failed_logins_today: 0,
    blocked_logins_today: 0,
  });

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);

      // Fetch suspicious activities
      const { data: activitiesData } = await supabase
        .from('suspicious_activities')
        .select(`
          *,
          profiles (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      setActivities(activitiesData || []);

      // Fetch stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Count users with 2FA
      const { count: users2fa } = await supabase
        .from('user_2fa')
        .select('*', { count: 'exact', head: true })
        .eq('enabled', true);

      // Count suspicious activities today
      const { count: suspiciousToday } = await supabase
        .from('suspicious_activities')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Count failed logins today
      const { count: failedToday } = await supabase
        .from('login_history')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')
        .gte('login_time', today.toISOString());

      // Count blocked logins today
      const { count: blockedToday } = await supabase
        .from('login_history')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'blocked')
        .gte('login_time', today.toISOString());

      setStats({
        total_users_with_2fa: users2fa || 0,
        suspicious_activities_today: suspiciousToday || 0,
        failed_logins_today: failedToday || 0,
        blocked_logins_today: blockedToday || 0,
      });
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveActivity = async (activityId: string, resolution: string) => {
    try {
      const { error } = await supabase
        .from('suspicious_activities')
        .update({
          status: resolution,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', activityId);

      if (error) throw error;

      toast({
        title: 'Activity Resolved',
        description: `Marked as ${resolution}`,
      });

      fetchSecurityData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resolve activity',
        variant: 'destructive',
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'multiple_failed_logins':
        return <Ban className="h-4 w-4" />;
      case 'unusual_location':
        return <AlertTriangle className="h-4 w-4" />;
      case 'unusual_device':
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const filteredActivities = activities.filter(activity =>
    activity.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Security Monitoring</h2>
        <p className="text-muted-foreground">Monitor platform security and suspicious activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Users with 2FA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.total_users_with_2fa}</div>
              <Lock className="h-8 w-8 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Suspicious Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.suspicious_activities_today}</div>
              <AlertTriangle className="h-8 w-8 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-pink-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Failed Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.failed_logins_today}</div>
              <XCircle className="h-8 w-8 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Blocked Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.blocked_logins_today}</div>
              <Ban className="h-8 w-8 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suspicious Activities */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Suspicious Activities</CardTitle>
              <CardDescription>Recent security alerts and suspicious behavior</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No suspicious activities detected</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${getSeverityColor(activity.severity)} text-white`}>
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.activity_type.replace(/_/g, ' ')}
                        </Badge>
                        <Badge className={getSeverityColor(activity.severity) + ' text-white'}>
                          {activity.severity}
                        </Badge>
                        <Badge variant="secondary">
                          {activity.status}
                        </Badge>
                      </div>
                      <p className="font-medium">{activity.description}</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        User: {activity.profiles?.full_name || activity.profiles?.email || 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  {activity.status === 'detected' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveActivity(activity.id, 'resolved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveActivity(activity.id, 'false_positive')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        False Alarm
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
