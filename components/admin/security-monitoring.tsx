"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, ShieldCheck, UserX, UserCheck, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function SecurityMonitoring() {
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSecurityData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/security-stats');
      if (!res.ok) throw new Error('Failed to fetch security stats');
      const data = await res.json();
      setActivities(data.suspiciousActivities);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast.error('Security scan failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  if (loading || !stats) return <div className="p-8 text-center uppercase font-black tracking-widest text-[10px]">Initializing security protocols...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-none border-border/50 bg-muted/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-40">System Integrity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <span className="text-xl font-black uppercase">Active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/50 bg-muted/5 border-l-red-500 border-l-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-40">Alerts Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-mono">{stats.suspiciousToday}</div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/50 bg-muted/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-40">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-mono">{stats.failedLogins}</div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/50 bg-muted/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-40">Isolated Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-mono">{stats.blockedUsers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="border border-border/50 bg-background overflow-hidden">
        <div className="p-4 bg-muted/30 border-b border-border/50 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-widest">Security Event Log</h3>
          <Button variant="ghost" size="sm" onClick={fetchSecurityData}><RefreshCw className="h-3 w-3 mr-2" /> Rescan</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Timestamp</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Entity</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Vector</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-[10px] uppercase font-bold opacity-30">No security events detected</TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity.id} className="hover:bg-muted/5">
                  <TableCell className="text-[10px] font-mono">{new Date(activity.createdAt).toLocaleTimeString()}</TableCell>
                  <TableCell className="text-xs font-bold uppercase">{activity.user?.email || 'External IP'}</TableCell>
                  <TableCell className="text-[10px] uppercase">{activity.description}</TableCell>
                  <TableCell>
                    <Badge variant={activity.severity === 'high' ? 'destructive' : 'outline'} className="rounded-none text-[8px] font-black uppercase">
                      {activity.severity}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
