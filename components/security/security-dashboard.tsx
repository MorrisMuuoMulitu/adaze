"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Smartphone,
  Globe,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Lock,
  Unlock,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LoginHistory {
  id: string;
  login_time: string;
  ip_address: string;
  device_type: string;
  browser: string;
  location_city: string;
  location_country: string;
  status: 'success' | 'failed' | 'blocked';
  is_suspicious: boolean;
}

interface ActiveSession {
  id: string;
  device_name: string;
  device_type: string;
  browser: string;
  location_city: string;
  location_country: string;
  last_activity_at: string;
  is_active: boolean;
}

interface SecuritySettings {
  require_2fa: boolean;
  login_notifications: boolean;
  unusual_activity_alerts: boolean;
  auto_logout_minutes: number;
}

export function SecurityDashboard() {
  const [loading, setLoading] = useState(true);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [settings, setSettings] = useState<SecuritySettings>({
    require_2fa: false,
    login_notifications: true,
    unusual_activity_alerts: true,
    auto_logout_minutes: 60,
  });

  const supabase = createClient();
  const { toast } = useToast();

  const fetchSecurityData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch login history
      const { data: historyData } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', user.id)
        .order('login_time', { ascending: false })
        .limit(10);

      setLoginHistory(historyData || []);

      // Fetch active sessions
      const { data: sessionsData } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_activity_at', { ascending: false });

      setActiveSessions(sessionsData || []);

      // Fetch security settings
      const { data: settingsData } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsData) {
        setSettings({
          require_2fa: settingsData.require_2fa,
          login_notifications: settingsData.login_notifications,
          unusual_activity_alerts: settingsData.unusual_activity_alerts,
          auto_logout_minutes: settingsData.auto_logout_minutes,
        });
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  const handleSettingChange = async (field: keyof SecuritySettings, value: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: user.id,
          [field]: value,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, [field]: value }));

      toast({
        title: 'Settings Updated',
        description: 'Your security settings have been saved',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      });
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('active_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: 'Session Terminated',
        description: 'The session has been successfully terminated',
      });

      fetchSecurityData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to terminate session',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'blocked':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Security Center</h2>
        <p className="text-muted-foreground">Manage your account security and monitor activity</p>
      </div>

      {/* Security Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Security Settings
          </CardTitle>
          <CardDescription>Configure your security preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA code for every login
              </p>
            </div>
            <Switch
              checked={settings.require_2fa}
              onCheckedChange={(checked) => handleSettingChange('require_2fa', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Login Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone logs into your account
              </p>
            </div>
            <Switch
              checked={settings.login_notifications}
              onCheckedChange={(checked) => handleSettingChange('login_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Unusual Activity Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Alert me of suspicious login attempts
              </p>
            </div>
            <Switch
              checked={settings.unusual_activity_alerts}
              onCheckedChange={(checked) => handleSettingChange('unusual_activity_alerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-purple-600" />
            Active Sessions ({activeSessions.length})
          </CardTitle>
          <CardDescription>Devices currently signed into your account</CardDescription>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active sessions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Smartphone className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {session.device_name || session.browser} • {session.device_type}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.location_city}, {session.location_country}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Active {formatDistanceToNow(new Date(session.last_activity_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => terminateSession(session.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Terminate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Login History */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Login History
          </CardTitle>
          <CardDescription>Recent login attempts on your account</CardDescription>
        </CardHeader>
        <CardContent>
          {loginHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No login history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {loginHistory.map((login) => (
                <div
                  key={login.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(login.status)}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{login.browser}</span>
                        {login.is_suspicious && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Suspicious
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {login.location_city}, {login.location_country} • {login.ip_address}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(login.login_time), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div>
                    {login.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : login.status === 'failed' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
