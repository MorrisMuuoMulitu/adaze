"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, Smartphone, Globe, Lock, AlertTriangle, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { toast } from 'sonner';

export function SecurityDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSecurityData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch('/api/account/security-stats');
      if (!res.ok) throw new Error('Failed to fetch security data');
      const data = await res.json();
      setLoginHistory(data.loginHistory);
      setActiveSessions(data.activeSessions);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchSecurityData();
    }
  }, [user, authLoading, fetchSecurityData]);

  if (loading || authLoading) return <div className="p-8 text-center uppercase font-black tracking-widest text-[10px]">Accessing security archive...</div>;

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="rounded-none border-border/50 bg-muted/5">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-accent" /> Active Access Nodes
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Currently established session links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border border-border/30 bg-background hover:border-accent/30 transition-colors">
                <div>
                  <div className="text-xs font-black uppercase tracking-tight">{session.deviceName || 'Unknown Node'}</div>
                  <div className="text-[9px] font-mono text-muted-foreground uppercase">{session.ipAddress} // {session.locationCity}</div>
                </div>
                <Badge variant="outline" className="rounded-none text-[8px] font-black uppercase">CURRENT</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/50 bg-muted/5">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" /> Authentication Log
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Recent identity verification events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loginHistory.map((login) => (
                <div key={login.id} className="flex items-center justify-between border-b border-border/20 pb-3 last:border-0">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-tight">{login.browser} on {login.os}</div>
                    <div className="text-[9px] font-mono text-muted-foreground">{new Date(login.loginTime).toLocaleString()}</div>
                  </div>
                  <Badge variant={login.status === 'SUCCESS' ? 'default' : 'destructive'} className="rounded-none text-[8px] font-black uppercase">
                    {login.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
