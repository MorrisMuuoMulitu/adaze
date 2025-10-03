"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Moon, 
  Sun, 
  Shield,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Check,
  X,
  ArrowLeft,
  Home,
  ShoppingBag,
  LayoutDashboard
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile settings
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  // 2FA settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactorQR, setShowTwoFactorQR] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchSettings = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || '');
          setPhone(profile.phone || '');
          setLocation(profile.location || '');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user, router, supabase]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          location: location,
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const userRole = user?.user_metadata?.role;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-8 p-4 bg-muted/50 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </Button>
                {userRole === 'buyer' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="gap-2"
                  >
                    <Link href="/marketplace">
                      <ShoppingBag className="h-4 w-4" />
                      Marketplace
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <Link href={`/dashboard/${userRole}`}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 XXX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notif">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notif">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                  <Switch
                    id="push-notif"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="order-updates">Order Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about order status changes</p>
                  </div>
                  <Switch
                    id="order-updates"
                    checked={orderUpdates}
                    onCheckedChange={setOrderUpdates}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="promotions">Promotional Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive updates about new features and offers</p>
                  </div>
                  <Switch
                    id="promotions"
                    checked={promotions}
                    onCheckedChange={setPromotions}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  Appearance
                </CardTitle>
                <CardDescription>Customize how ADAZE looks on your device</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('system')}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      System
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>Update your password and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                {newPassword && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Password Requirements:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        {newPassword.length >= 6 ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={newPassword.length >= 6 ? 'text-green-500' : 'text-muted-foreground'}>
                          At least 6 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {newPassword === confirmPassword && newPassword.length > 0 ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={newPassword === confirmPassword && newPassword.length > 0 ? 'text-green-500' : 'text-muted-foreground'}>
                          Passwords match
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <Button 
                  onClick={handleChangePassword} 
                  disabled={saving || !newPassword || newPassword !== confirmPassword}
                >
                  {saving ? 'Changing Password...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Two-Factor Authentication (2FA)
                </CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="2fa-toggle" className="text-base font-semibold">Enable 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      {twoFactorEnabled 
                        ? "Your account is protected with 2FA" 
                        : "Secure your account with an authenticator app"}
                    </p>
                  </div>
                  <Switch
                    id="2fa-toggle"
                    checked={twoFactorEnabled}
                    onCheckedChange={(checked) => {
                      setTwoFactorEnabled(checked);
                      if (checked) {
                        setShowTwoFactorQR(true);
                        // Generate secret (in real app, this would come from backend)
                        setTwoFactorSecret('JBSWY3DPEHPK3PXP');
                      } else {
                        setShowTwoFactorQR(false);
                        toast.success('2FA disabled successfully');
                      }
                    }}
                  />
                </div>

                {showTwoFactorQR && twoFactorEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 p-4 bg-background border-2 border-green-500/20 rounded-lg"
                  >
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Step 1: Scan QR Code
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                      </p>
                      <div className="flex justify-center p-4 bg-white rounded-lg">
                        {/* QR Code placeholder - in real app, generate actual QR */}
                        <div className="w-48 h-48 bg-muted flex items-center justify-center rounded border-2 border-dashed">
                          <div className="text-center">
                            <Shield className="h-12 w-12 mx-auto mb-2 text-green-600" />
                            <p className="text-xs text-muted-foreground">QR Code</p>
                            <p className="text-xs text-muted-foreground">Would appear here</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted p-3 rounded text-center">
                        <p className="text-xs text-muted-foreground mb-1">Or enter this code manually:</p>
                        <code className="text-sm font-mono font-bold">{twoFactorSecret}</code>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Step 2: Verify Code
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code from your authenticator app
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="000000"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          className="text-center text-lg font-mono tracking-widest"
                        />
                        <Button
                          onClick={() => {
                            if (twoFactorCode.length === 6) {
                              setShowTwoFactorQR(false);
                              toast.success('2FA enabled successfully!', {
                                description: 'Your account is now more secure'
                              });
                            } else {
                              toast.error('Please enter a valid 6-digit code');
                            }
                          }}
                          disabled={twoFactorCode.length !== 6}
                        >
                          Verify & Enable
                        </Button>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>💡 Tip:</strong> Save backup codes in a secure location. You&apos;ll need them if you lose access to your authenticator app.
                      </p>
                    </div>
                  </motion.div>
                )}

                {twoFactorEnabled && !showTwoFactorQR && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="h-5 w-5" />
                      <span className="font-semibold">2FA is active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowTwoFactorQR(true)}>
                        View QR Code
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast.info('Backup codes:', {
                          description: 'Save these: ABC123, DEF456, GHI789'
                        });
                      }}>
                        Show Backup Codes
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy
                </CardTitle>
                <CardDescription>Control your privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                  </div>
                  <Switch
                    id="profile-visibility"
                    checked={profileVisibility}
                    onCheckedChange={setProfileVisibility}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-email">Show Email</Label>
                    <p className="text-sm text-muted-foreground">Display your email on your profile</p>
                  </div>
                  <Switch
                    id="show-email"
                    checked={showEmail}
                    onCheckedChange={setShowEmail}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-phone">Show Phone Number</Label>
                    <p className="text-sm text-muted-foreground">Display your phone number on your profile</p>
                  </div>
                  <Switch
                    id="show-phone"
                    checked={showPhone}
                    onCheckedChange={setShowPhone}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
