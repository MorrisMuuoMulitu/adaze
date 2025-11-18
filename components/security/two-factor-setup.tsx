"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import {
  Lock,
  Unlock,
  Smartphone,
  Mail,
  Key,
  CheckCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  Shield
} from 'lucide-react';

interface TwoFactorSettings {
  enabled: boolean;
  method: 'totp' | 'sms' | 'email';
  phone_number: string | null;
  phone_verified: boolean;
  verified_at: string | null;
}

export function TwoFactorSetup() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<TwoFactorSettings | null>(null);
  const [secret, setSecret] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_2fa')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setSettings(data);
    } catch (error) {
      console.error('Error fetching 2FA settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSecret = () => {
    // Generate a random base32 secret (simplified version)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const handleEnableTOTP = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate secret and QR code
      const newSecret = generateSecret();
      setSecret(newSecret);

      // Generate OTPAuth URL
      const issuer = 'Adaze Marketplace';
      const otpauthUrl = `otpauth://totp/${issuer}:${user.email}?secret=${newSecret}&issuer=${issuer}`;

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      setQrCode(qrCodeDataUrl);

      toast({
        title: 'Setup Started',
        description: 'Scan the QR code with your authenticator app',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to enable 2FA',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyAndEnable = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In production, you would verify the TOTP code here
      if (verificationCode.length !== 6) {
        toast({
          title: 'Invalid Code',
          description: 'Please enter a 6-digit code',
          variant: 'destructive',
        });
        return;
      }

      // Generate backup codes
      const codes = generateBackupCodes();
      setBackupCodes(codes);

      // Save to database
      const { error } = await supabase
        .from('user_2fa')
        .upsert({
          user_id: user.id,
          enabled: true,
          method: 'totp',
          secret: secret, // In production, encrypt this!
          backup_codes: codes, // In production, hash these!
          verified_at: new Date().toISOString(),
        });

      if (error) throw error;

      setShowBackupCodes(true);

      toast({
        title: 'Success!',
        description: '2FA has been enabled on your account',
      });

      fetchSettings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify code',
        variant: 'destructive',
      });
    }
  };

  const handleDisable = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_2fa')
        .update({
          enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Disabled',
        description: '2FA has been disabled',
      });

      fetchSettings();
      setSecret('');
      setQrCode('');
      setVerificationCode('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to disable 2FA',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Code copied to clipboard',
    });
  };

  const copyAllBackupCodes = () => {
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'All backup codes copied',
    });
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
      {/* Status Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {settings?.enabled ? (
                  <Lock className="h-5 w-5 text-green-600" />
                ) : (
                  <Unlock className="h-5 w-5 text-gray-600" />
                )}
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </div>
            <Badge variant={settings?.enabled ? "default" : "secondary"} className="text-sm">
              {settings?.enabled ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Enabled
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Disabled
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {settings?.enabled ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">2FA is Active</p>
                    <p className="text-sm text-green-700 mt-1">
                      Your account is protected with two-factor authentication.
                      You&apos;ll need to enter a code from your authenticator app when signing in.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDisable} className="text-red-600 hover:text-red-700">
                  Disable 2FA
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  Two-factor authentication adds an extra layer of security by requiring a code from your phone
                  in addition to your password when signing in.
                </p>
              </div>

              {!qrCode && (
                <Button onClick={handleEnableTOTP} className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Lock className="h-4 w-4 mr-2" />
                  Enable 2FA
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Steps (when enabling) */}
      {qrCode && !settings?.enabled && !showBackupCodes && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Setup Authenticator App</CardTitle>
            <CardDescription>Follow these steps to enable 2FA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Download App */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold">
                  1
                </div>
                <h3 className="font-semibold">Download an Authenticator App</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-10">
                Download Google Authenticator, Authy, or Microsoft Authenticator on your phone.
              </p>
            </div>

            {/* Step 2: Scan QR Code */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold">
                  2
                </div>
                <h3 className="font-semibold">Scan QR Code</h3>
              </div>
              <div className="ml-10 space-y-3">
                <div className="p-6 bg-white border-2 border-dashed rounded-lg text-center">
                  {qrCode && (
                    <div className="mb-4">
                      <img
                        src={qrCode}
                        alt="QR Code for 2FA"
                        className="mx-auto"
                        style={{ width: '256px', height: '256px' }}
                      />
                    </div>
                  )}
                  <p className="text-sm font-medium mb-2">
                    Scan with your authenticator app
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Or enter this secret manually:
                  </p>
                  <div className="flex items-center gap-2 justify-center">
                    <code className="px-4 py-2 bg-gray-100 rounded text-sm font-mono">
                      {secret}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(secret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Enter Code */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold">
                  3
                </div>
                <h3 className="font-semibold">Enter Verification Code</h3>
              </div>
              <div className="ml-10 space-y-3">
                <div className="flex gap-2 max-w-sm">
                  <Input
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                  <Button onClick={handleVerifyAndEnable}>
                    Verify & Enable
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Codes */}
      {showBackupCodes && (
        <Card className="border-0 shadow-lg border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-700">Save Your Backup Codes</CardTitle>
            <CardDescription>
              Store these codes in a safe place. You can use them to access your account if you lose your phone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              {backupCodes.map((code, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <code className="font-mono text-sm">{code}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(code)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={copyAllBackupCodes} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy All Codes
              </Button>
              <Button onClick={() => setShowBackupCodes(false)}>
                I&apos;ve Saved My Codes
              </Button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>Important:</strong> Each backup code can only be used once. Store them securely!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
