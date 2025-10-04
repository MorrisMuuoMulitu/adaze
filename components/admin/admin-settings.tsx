"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
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

interface PlatformSettings {
  // General
  site_name: string;
  site_description: string;
  site_logo_url: string;
  contact_email: string;
  support_phone: string;
  
  // Email
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;
  
  // Payment
  mpesa_consumer_key: string;
  mpesa_consumer_secret: string;
  mpesa_passkey: string;
  mpesa_shortcode: string;
  platform_commission_rate: number;
  
  // Features
  enable_reviews: boolean;
  enable_wishlist: boolean;
  enable_chat: boolean;
  enable_notifications: boolean;
  maintenance_mode: boolean;
  
  // Appearance
  primary_color: string;
  secondary_color: string;
  theme_mode: string;
}

export function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings>({
    // General
    site_name: 'Adaze Marketplace',
    site_description: 'Your trusted online marketplace in Kenya',
    site_logo_url: '',
    contact_email: 'support@adaze.com',
    support_phone: '+254700000000',
    
    // Email
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: 'Adaze Marketplace',
    
    // Payment
    mpesa_consumer_key: '',
    mpesa_consumer_secret: '',
    mpesa_passkey: '',
    mpesa_shortcode: '',
    platform_commission_rate: 10,
    
    // Features
    enable_reviews: true,
    enable_wishlist: true,
    enable_chat: false,
    enable_notifications: true,
    maintenance_mode: false,
    
    // Appearance
    primary_color: '#8b5cf6',
    secondary_color: '#3b82f6',
    theme_mode: 'light',
  });

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch settings from database
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .single();

      if (data) {
        setSettings({
          ...settings,
          ...data,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Upsert settings to database
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          id: 1, // Single row for all settings
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
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

  const handleInputChange = (field: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Settings</h2>
          <p className="text-muted-foreground">Manage your marketplace configuration</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-purple-600 to-blue-600">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-sm shadow-md border-0 p-1.5">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="features">
            <ToggleLeft className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform information and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    placeholder="Adaze Marketplace"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="support@adaze.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={settings.site_description}
                  onChange={(e) => handleInputChange('site_description', e.target.value)}
                  placeholder="Your trusted online marketplace..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site_logo_url">Logo URL</Label>
                  <Input
                    id="site_logo_url"
                    value={settings.site_logo_url}
                    onChange={(e) => handleInputChange('site_logo_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_phone">Support Phone</Label>
                  <Input
                    id="support_phone"
                    value={settings.support_phone}
                    onChange={(e) => handleInputChange('support_phone', e.target.value)}
                    placeholder="+254700000000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Configuration</CardTitle>
                  <CardDescription>SMTP settings for sending emails</CardDescription>
                </div>
                <TestEmailButton />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={settings.smtp_host}
                    onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    value={settings.smtp_port}
                    onChange={(e) => handleInputChange('smtp_port', e.target.value)}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp_user">SMTP Username</Label>
                  <Input
                    id="smtp_user"
                    value={settings.smtp_user}
                    onChange={(e) => handleInputChange('smtp_user', e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <div className="relative">
                    <Input
                      id="smtp_password"
                      type={showPasswords ? 'text' : 'password'}
                      value={settings.smtp_password}
                      onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp_from_email">From Email</Label>
                  <Input
                    id="smtp_from_email"
                    type="email"
                    value={settings.smtp_from_email}
                    onChange={(e) => handleInputChange('smtp_from_email', e.target.value)}
                    placeholder="noreply@adaze.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_from_name">From Name</Label>
                  <Input
                    id="smtp_from_name"
                    value={settings.smtp_from_name}
                    onChange={(e) => handleInputChange('smtp_from_name', e.target.value)}
                    placeholder="Adaze Marketplace"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>M-Pesa Configuration</CardTitle>
              <CardDescription>Daraja API credentials for M-Pesa payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mpesa_consumer_key">Consumer Key</Label>
                  <Input
                    id="mpesa_consumer_key"
                    type={showPasswords ? 'text' : 'password'}
                    value={settings.mpesa_consumer_key}
                    onChange={(e) => handleInputChange('mpesa_consumer_key', e.target.value)}
                    placeholder="Enter consumer key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mpesa_consumer_secret">Consumer Secret</Label>
                  <Input
                    id="mpesa_consumer_secret"
                    type={showPasswords ? 'text' : 'password'}
                    value={settings.mpesa_consumer_secret}
                    onChange={(e) => handleInputChange('mpesa_consumer_secret', e.target.value)}
                    placeholder="Enter consumer secret"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mpesa_passkey">Passkey</Label>
                  <Input
                    id="mpesa_passkey"
                    type={showPasswords ? 'text' : 'password'}
                    value={settings.mpesa_passkey}
                    onChange={(e) => handleInputChange('mpesa_passkey', e.target.value)}
                    placeholder="Enter passkey"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mpesa_shortcode">Business Shortcode</Label>
                  <Input
                    id="mpesa_shortcode"
                    value={settings.mpesa_shortcode}
                    onChange={(e) => handleInputChange('mpesa_shortcode', e.target.value)}
                    placeholder="174379"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform_commission_rate">Platform Commission Rate (%)</Label>
                <Input
                  id="platform_commission_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.platform_commission_rate}
                  onChange={(e) => handleInputChange('platform_commission_rate', parseFloat(e.target.value))}
                  placeholder="10"
                />
                <p className="text-sm text-muted-foreground">
                  Percentage taken from each transaction (e.g., 10% = KSh 100 from KSh 1,000)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Toggles */}
        <TabsContent value="features" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Product Reviews</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow buyers to rate and review products
                  </p>
                </div>
                <Switch
                  checked={settings.enable_reviews}
                  onCheckedChange={(checked) => handleInputChange('enable_reviews', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Wishlist</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to save products to wishlist
                  </p>
                </div>
                <Switch
                  checked={settings.enable_wishlist}
                  onCheckedChange={(checked) => handleInputChange('enable_wishlist', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Live Chat</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable real-time chat between buyers and traders
                  </p>
                </div>
                <Switch
                  checked={settings.enable_chat}
                  onCheckedChange={(checked) => handleInputChange('enable_chat', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send automated email notifications to users
                  </p>
                </div>
                <Switch
                  checked={settings.enable_notifications}
                  onCheckedChange={(checked) => handleInputChange('enable_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between border-t pt-6">
                <div className="space-y-1">
                  <Label className="text-red-600">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Put the site in maintenance mode (only admins can access)
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Theme Mode</Label>
                <div className="flex gap-4">
                  <Button
                    variant={settings.theme_mode === 'light' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('theme_mode', 'light')}
                  >
                    Light
                  </Button>
                  <Button
                    variant={settings.theme_mode === 'dark' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('theme_mode', 'dark')}
                  >
                    Dark
                  </Button>
                  <Button
                    variant={settings.theme_mode === 'auto' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('theme_mode', 'auto')}
                  >
                    Auto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
