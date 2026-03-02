"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Mail,
  CreditCard,
  Palette,
  ToggleLeft,
  Save,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

export function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [settings, setSettings] = useState<any>({
    siteName: 'Adaze Marketplace',
    maintenanceMode: false,
    allowRegistration: true,
    commissionRate: 10,
    minWithdrawalAmount: 1000,
    supportEmail: 'support@adaze.com',
  });

  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/platform-settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/platform-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('Failed to save settings');

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
      fetchSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tighter">System Configuration</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Manage global marketplace parameters</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="btn-premium rounded-none h-12 px-8">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Commit Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/30 p-1 rounded-none border border-border/50">
          <TabsTrigger value="general" className="rounded-none text-[10px] font-black uppercase tracking-widest px-6">General</TabsTrigger>
          <TabsTrigger value="payment" className="rounded-none text-[10px] font-black uppercase tracking-widest px-6">Economics</TabsTrigger>
          <TabsTrigger value="features" className="rounded-none text-[10px] font-black uppercase tracking-widest px-6">Protocols</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="rounded-none border-border/50 bg-muted/5 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase">Identity Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest opacity-40">Platform Name</Label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    className="rounded-none border-border/50 bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest opacity-40">Support Email</Label>
                  <Input
                    value={settings.supportEmail}
                    onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                    className="rounded-none border-border/50 bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card className="rounded-none border-border/50 bg-muted/5 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase">Economic Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest opacity-40">Commission Rate (%)</Label>
                  <Input
                    type="number"
                    value={settings.commissionRate}
                    onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value))}
                    className="rounded-none border-border/50 bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest opacity-40">Min Withdrawal</Label>
                  <Input
                    type="number"
                    value={settings.minWithdrawalAmount}
                    onChange={(e) => handleInputChange('minWithdrawalAmount', parseFloat(e.target.value))}
                    className="rounded-none border-border/50 bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card className="rounded-none border-border/50 bg-muted/5 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase">Operational Protocols</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Maintenance Mode</Label>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-tight">Restrict access to admins only</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Open Registration</Label>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-tight">Allow new users to join the collective</p>
                </div>
                <Switch
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) => handleInputChange('allowRegistration', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
