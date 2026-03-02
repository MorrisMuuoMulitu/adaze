"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Bell, 
  LogOut, 
  Camera, 
  Save,
  CreditCard,
  ShoppingBag,
  Heart
} from 'lucide-react';
import { LogoutButton } from '@/components/LogoutButton';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/navbar';

export default function ProfilePage() {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const [isEditing, setIsIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    email: '',
  });

  useEffect(() => {
    if (authProfile) {
      setFormData({
        name: authProfile.full_name || authProfile.name || '',
        phone: authProfile.phone || '',
        location: authProfile.location || '',
        email: authProfile.email || '',
      });
    }
  }, [authProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/account/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      toast.success('Profile updated successfully');
      setIsIsEditing(false);
      
      // Optionally refresh the page or session
      window.location.reload();
    } catch (error: any) {
      toast.error('Update failed: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center p-4">Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onAuthClick={() => {}} />
      
      <main className="container mx-auto px-6 py-24 max-w-5xl space-y-12">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center gap-8 border-b border-border/50 pb-12"
        >
          <div className="relative group">
            <Avatar className="h-32 w-32 ring-4 ring-muted border-4 border-background">
              <AvatarImage src={authProfile?.avatar_url} />
              <AvatarFallback className="text-4xl font-black bg-accent text-white">
                {formData.name?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 p-2 bg-accent text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-4xl font-black tracking-tighter uppercase">{formData.name || 'Anonymous User'}</h1>
              <Badge className="bg-accent text-white rounded-none text-[10px] font-black tracking-widest uppercase w-fit mx-auto md:mx-0">
                {authProfile?.role || 'BUYER'}
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium tracking-tight">Member since {new Date().getFullYear()}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <LogoutButton variant="outline" className="rounded-none border-border h-12 px-6 text-[10px] font-black tracking-widest uppercase" />
          </div>
        </motion.div>

        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="bg-muted/30 p-1 rounded-none border border-border/50 w-full md:w-fit grid grid-cols-2 md:flex h-auto">
            <TabsTrigger value="identity" className="rounded-none text-[10px] font-black tracking-widest uppercase py-3 px-8 data-[state=active]:bg-background data-[state=active]:text-accent">Identity</TabsTrigger>
            <TabsTrigger value="security" className="rounded-none text-[10px] font-black tracking-widest uppercase py-3 px-8 data-[state=active]:bg-background data-[state=active]:text-accent">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="mt-8">
            <Card className="rounded-none border-border/50 bg-muted/5 shadow-none overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 -rotate-45 translate-x-16 -translate-y-16 pointer-events-none" />
              
              <CardHeader className="border-b border-border/30 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tighter">Boutique Dossier</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Manage your personal identification records</CardDescription>
                  </div>
                  <Button 
                    variant={isEditing ? "ghost" : "outline"}
                    className="rounded-none border-border text-[10px] font-black tracking-widest uppercase"
                    onClick={() => setIsIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel Acquisition' : 'Update Dossier'}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black tracking-widest uppercase opacity-40">Identification Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                      <Input 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="rounded-none border-border/50 bg-background pl-10 h-12 font-bold uppercase tracking-tight focus-visible:ring-accent" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black tracking-widest uppercase opacity-40">Electronic Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                      <Input 
                        value={formData.email}
                        disabled
                        className="rounded-none border-border/50 bg-muted/20 pl-10 h-12 font-bold tracking-tight opacity-50 cursor-not-allowed" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black tracking-widest uppercase opacity-40">Communication Line</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                      <Input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="rounded-none border-border/50 bg-background pl-10 h-12 font-bold tracking-tight focus-visible:ring-accent" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black tracking-widest uppercase opacity-40">Operational Base</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                      <Input 
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="rounded-none border-border/50 bg-background pl-10 h-12 font-bold uppercase tracking-tight focus-visible:ring-accent" 
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-8 border-t border-border/30"
                  >
                    <Button 
                      className="btn-premium rounded-none h-14 w-full md:w-fit px-12 text-[10px] font-black tracking-widest uppercase flex items-center gap-2"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Synchronizing...' : (
                        <>
                          Commit Changes <Save className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-8">
            <Card className="rounded-none border-border/50 bg-muted/5 shadow-none">
              <CardHeader className="border-b border-border/30 p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tighter">Security Protocol</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Manage authentication and encryption settings</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between p-6 bg-background border border-border/50 rounded-none group hover:border-accent transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 text-accent rounded-none">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">Multi-Factor Authentication</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Status: Standard Protocol Active</p>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-none text-[9px] font-black tracking-widest uppercase h-10">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between p-6 bg-background border border-border/50 rounded-none group hover:border-accent transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 text-accent rounded-none">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">System Notifications</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Active Channels: Push + Email</p>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-none text-[9px] font-black tracking-widest uppercase h-10">Manage</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
