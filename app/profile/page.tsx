"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { uploadAvatar } from '@/lib/supabase/storage';
import { ErrorHandler } from '@/lib/errorHandler';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import {
  MapPin,
  Phone,
  User as UserIcon,
  Mail,
  Camera,
  AlertTriangle,
  Trash2,
  PauseCircle,
  PlayCircle,
  Shield,
  ShoppingBag,
  History,
  Terminal,
  Activity,
  Laptop,
  Smartphone,
  Globe,
  Settings,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { AuthModal } from '@/components/auth/auth-modal';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  location: string;
  avatar_url: string;
  role: 'buyer' | 'trader' | 'transporter' | 'wholesaler' | 'admin';
  created_at: string;
}

interface UserSession {
  id: string;
  device_name: string;
  device_type: string;
  browser: string;
  os: string;
  ip_address: string;
  location_country: string;
  location_city: string;
  last_activity_at: string;
  is_active: boolean;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    avatar_url: '',
    role: 'buyer',
  });
  const [activeTab, setActiveTab] = useState('identity');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');
  const [actionLoading, setActionLoading] = useState(false);

  // Stats for the "Market Archive"
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    itemsPurchased: 0
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          avatar_url: profileData.avatar_url || '',
          role: profileData.role || 'buyer',
        });

        // Fetch User Sessions
        const { data: sessionData } = await supabase
          .from('active_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('last_activity_at', { ascending: false })
          .limit(5);

        if (sessionData) setSessions(sessionData);

        // Fetch Stats (mock for now or real if tables exist)
        // In a real app, you'd aggregate orders here
        setStats({
          totalOrders: 12,
          totalSpent: 14500,
          itemsPurchased: 24
        });

      } catch (err) {
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          avatar_url: formData.avatar_url,
        })
        .eq('id', user?.id || '');

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...formData } : null as any);
      setEditing(false);
      toast.success('Identity Updated', { description: 'Your commercial profile has been synchronized.' });
    } catch (err) {
      toast.error('Sync Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    try {
      const { publicUrl } = await uploadAvatar(user?.id || '', e.target.files[0]);
      if (publicUrl) {
        setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
        await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user?.id || '');
        setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null as any);
        toast.success('Visual Identity Updated');
      }
    } catch (err) {
      toast.error('Upload Failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Synchronizing Identity...</p>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-accent/30">
      <Navbar onAuthClick={() => { }} />

      <main className="flex-grow pt-24 pb-20 relative overflow-hidden">
        {/* Aesthetic Ornaments */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-scanline opacity-[0.02] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          {/* Header Section */}
          <header className="mb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] font-black tracking-[0.4em] uppercase text-accent/60 flex items-center gap-3"
                >
                  <Terminal className="h-3 w-3" />
                  Commercial Identifier // {profile.id.slice(0, 12).toUpperCase()}
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8]"
                >
                  Profile <span className="font-serif italic text-muted-foreground/20 lowercase">Vector.</span>
                </motion.h1>
              </div>

              {/* Quick Role Action */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border/50 p-6 flex items-center gap-6"
              >
                <div className="text-right">
                  <p className="text-[9px] font-black tracking-widest uppercase opacity-40">Current Status</p>
                  <p className="text-sm font-black uppercase text-accent">{profile.role}</p>
                </div>
                <div className="h-10 w-[1px] bg-border/20" />
                <Button
                  onClick={() => router.push(profile.role === 'buyer' ? '/marketplace' : `/dashboard/${profile.role}`)}
                  className="btn-premium h-12 rounded-none px-6 text-[10px] font-black tracking-[0.2em] uppercase"
                >
                  Enter Dashboard <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </header>

          <Tabs defaultValue="identity" className="space-y-12">
            <TabsList className="bg-transparent border-b border-border/10 w-full justify-start h-auto rounded-none p-0 gap-10">
              {['identity', 'archive', 'security'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-accent border-b-2 border-transparent rounded-none px-0 pb-4 text-[11px] font-black tracking-[0.3em] uppercase transition-all"
                >
                  {tab === 'identity' && 'Identity Core'}
                  {tab === 'archive' && 'Market Archive'}
                  {tab === 'security' && 'Security Protocols'}
                </TabsTrigger>
              ))}
            </TabsList>

            <AnimatePresence mode="wait">
              {/* --- IDENTITY CORE --- */}
              <TabsContent value="identity" className="mt-0 outline-none">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  {/* Left: Visual Identity */}
                  <div className="lg:col-span-4 space-y-8">
                    <Card className="bg-card/50 border-border/50 backdrop-blur-sm rounded-none overflow-hidden group">
                      <div className="h-24 bg-gradient-to-r from-accent/5 to-primary/5 border-b border-border/20" />
                      <div className="p-8 -mt-16 text-center">
                        <div className="relative inline-block group">
                          <Avatar className="h-40 w-40 rounded-none border-2 border-accent shadow-[0_0_30px_rgba(var(--accent),0.1)] group-hover:scale-[1.02] transition-transform">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback className="bg-background text-3xl font-black rounded-none">
                              {profile.full_name?.charAt(0) || user.email?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <label className="absolute bottom-4 right-4 bg-accent p-3 cursor-pointer shadow-xl hover:scale-110 active:scale-95 transition-all">
                            <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                            <Camera className={`h-4 w-4 text-white ${uploading ? 'animate-pulse' : ''}`} />
                          </label>
                        </div>
                        <div className="mt-6 space-y-1">
                          <h2 className="text-2xl font-black uppercase tracking-tight">{profile.full_name || 'Unregistered Entity'}</h2>
                          <p className="text-[10px] font-mono tracking-widest opacity-40 uppercase">{user.email}</p>
                        </div>
                      </div>
                      <div className="p-6 border-t border-border/10 bg-muted/5 grid grid-cols-2 divide-x divide-border/10">
                        <div className="text-center px-2">
                          <p className="text-[8px] font-black tracking-widest uppercase opacity-40 mb-1">Rank</p>
                          <p className="text-[10px] font-black uppercase text-accent">{profile.role}</p>
                        </div>
                        <div className="text-center px-2">
                          <p className="text-[8px] font-black tracking-widest uppercase opacity-40 mb-1">Initialized</p>
                          <p className="text-[10px] font-black uppercase">{new Date(profile.created_at).toLocaleDateString('en-GB')}</p>
                        </div>
                      </div>
                    </Card>

                    <div className="p-6 border border-accent/20 bg-accent/5 space-y-4">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-accent" />
                        <span className="text-[10px] font-black tracking-widest uppercase">Verified Transactor</span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-60">Your profile is currently synchronized with the ADAZE mainnet. All commercial operations are logged under this identifier.</p>
                    </div>
                  </div>

                  {/* Right: Form Details */}
                  <div className="lg:col-span-8">
                    <Card className="bg-transparent border-none shadow-none">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-3xl font-black tracking-tighter uppercase">Manifest <span className="font-serif italic text-muted-foreground/30 lowercase">Input.</span></CardTitle>
                        <CardDescription className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 mt-2">Modify core identity parameters across the network.</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 pt-8">
                        <form onSubmit={handleSave} className="space-y-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            <div className="space-y-3">
                              <Label className="text-[9px] font-black tracking-widest uppercase opacity-60">Legal Forename</Label>
                              <Input
                                disabled={!editing}
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="h-14 rounded-none border-border/50 bg-muted/5 focus-ring uppercase font-mono text-[11px] font-bold tracking-widest disabled:opacity-40"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[9px] font-black tracking-widest uppercase opacity-60">Identity Link (Global)</Label>
                              <Input
                                disabled
                                value={user.email || ''}
                                className="h-14 rounded-none border-border/50 bg-muted/5 uppercase font-mono text-[11px] font-bold tracking-widest opacity-30"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[9px] font-black tracking-widest uppercase opacity-60">Security Contact (Phone)</Label>
                              <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent opacity-30 group-focus-within:opacity-100 transition-opacity" />
                                <Input
                                  disabled={!editing}
                                  value={formData.phone}
                                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                  placeholder="+254 XXX XXX XXX"
                                  className="pl-12 h-14 rounded-none border-border/50 bg-muted/5 focus-ring uppercase font-mono text-[11px] font-bold tracking-widest disabled:opacity-40"
                                />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[9px] font-black tracking-widest uppercase opacity-60">Regional Sector (Location)</Label>
                              <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent opacity-30 group-focus-within:opacity-100 transition-opacity" />
                                <Input
                                  disabled={!editing}
                                  value={formData.location}
                                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                  className="pl-12 h-14 rounded-none border-border/50 bg-muted/5 focus-ring uppercase font-mono text-[11px] font-bold tracking-widest disabled:opacity-40"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 pt-6 border-t border-border/10">
                            {!editing ? (
                              <Button
                                type="button"
                                onClick={() => setEditing(true)}
                                className="h-14 rounded-none px-10 text-[10px] font-black tracking-[0.3em] uppercase border border-border/50 hover:bg-accent/5 hover:border-accent transition-all"
                              >
                                Modify Identity
                              </Button>
                            ) : (
                              <>
                                <Button
                                  className="btn-premium h-14 rounded-none px-10 text-[10px] font-black tracking-[0.3em] uppercase"
                                  disabled={loading}
                                >
                                  {loading ? 'Synchronizing...' : 'Save Sequence'}
                                </Button>
                                <button
                                  type="button"
                                  onClick={() => { setEditing(false); setFormData({ ...profile } as any); }}
                                  className="text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity"
                                >
                                  Cancel Operation
                                </button>
                              </>
                            )}
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* --- MARKET ARCHIVE --- */}
              <TabsContent value="archive" className="mt-0 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="border border-border/50 p-8 space-y-4 bg-muted/5">
                    <ShoppingBag className="h-6 w-6 text-accent opacity-40" />
                    <div>
                      <h3 className="text-[9px] font-black tracking-widest uppercase opacity-40">Total Acquisitions</h3>
                      <p className="text-4xl font-black">{stats.totalOrders}</p>
                    </div>
                  </div>
                  <div className="border border-border/50 p-8 space-y-4 bg-muted/5">
                    <Activity className="h-6 w-6 text-accent opacity-40" />
                    <div>
                      <h3 className="text-[9px] font-black tracking-widest uppercase opacity-40">Currency Outflow</h3>
                      <p className="text-4xl font-black tracking-tight">KSH {stats.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="border border-border/50 p-8 space-y-4 bg-muted/5">
                    <History className="h-6 w-6 text-accent opacity-40" />
                    <div>
                      <h3 className="text-[9px] font-black tracking-widest uppercase opacity-40">Items Managed</h3>
                      <p className="text-4xl font-black">{stats.itemsPurchased}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-border/10 p-12 text-center bg-card/10 space-y-6">
                  <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto border border-border/10">
                    <History className="h-8 w-8 opacity-20" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Archive Empty.</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">No historical market transactions detected for this vector.</p>
                  </div>
                  <Button
                    onClick={() => router.push('/marketplace')}
                    className="btn-premium h-14 px-8 rounded-none text-[10px] font-black tracking-[0.3em] uppercase"
                  >
                    Initiate First Acquisition
                  </Button>
                </div>
              </TabsContent>

              {/* --- SECURITY PROTOCOLS --- */}
              <TabsContent value="security" className="mt-0 outline-none">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Active <span className="font-serif italic text-muted-foreground/30 lowercase">Synchronizations.</span></h3>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40">Monitored access points currently linked to your identifier.</p>
                    </div>

                    <div className="space-y-4">
                      {sessions.length > 0 ? sessions.map((s, idx) => (
                        <div key={s.id} className="border border-border/30 p-6 flex items-center justify-between group hover:border-accent/40 transition-colors">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 border border-border/50 flex items-center justify-center bg-muted/5">
                              {s.device_type === 'mobile' ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
                            </div>
                            <div className="space-y-1">
                              <p className="text-[11px] font-black uppercase tracking-widest">{s.browser} on {s.os} {idx === 0 && <span className="text-accent ml-2">// CURRENT</span>}</p>
                              <div className="flex items-center gap-3 text-[9px] opacity-40 font-mono">
                                <Globe className="h-3 w-3" />
                                {s.location_city}, {s.location_country} • {s.ip_address}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-black tracking-widest uppercase opacity-40">Last Pulse</p>
                            <p className="text-[10px] font-black uppercase">{new Date(s.last_activity_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="p-10 border border-dashed border-border/30 text-center opacity-30 text-[9px] font-black uppercase tracking-widest">
                          No external session history available.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Danger <span className="font-serif italic text-muted-foreground/30 lowercase">Zone.</span></h3>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40">Terminal commands to suspend or purge your commercial presence.</p>
                    </div>

                    <div className="p-8 border border-red-500/30 bg-red-500/5 space-y-6">
                      <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                        <div className="space-y-1">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-red-500">Deactivate Vector</h4>
                          <p className="text-[9px] opacity-50 uppercase font-bold tracking-wider">Temporarily suspend all commercial operations.</p>
                        </div>
                        <Button
                          variant="outline"
                          className="h-10 rounded-none border-red-500/50 text-red-500 text-[9px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-white"
                        >
                          Deactivate
                        </Button>
                      </div>

                      <div className="h-[1px] bg-red-500/20" />

                      <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                        <div className="space-y-1">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-red-500">Purge Identifier</h4>
                          <p className="text-[9px] opacity-50 uppercase font-bold tracking-wider">Irreversibly delete all records from the ADAZE ledger.</p>
                        </div>
                        <Button
                          variant="destructive"
                          className="h-10 rounded-none bg-red-600 text-[9px] font-black tracking-widest uppercase"
                        >
                          Final Purge
                        </Button>
                      </div>
                    </div>

                    <div className="p-8 border border-border/50 bg-muted/5 flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase tracking-widest">System Logout</h4>
                        <p className="text-[9px] opacity-50 uppercase font-bold tracking-wider">Terminate all active links for this vector.</p>
                      </div>
                      <Button
                        onClick={async () => {
                          await supabase.auth.signOut();
                          window.location.href = '/';
                        }}
                        className="h-12 rounded-none px-8 border border-border/50 hover:bg-accent/5 text-[10px] font-black tracking-widest uppercase"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </main>

      <footer className="py-12 border-t border-border/10 bg-muted/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black tracking-widest uppercase opacity-40">© 2026 ADAZE COLLECTIVE // ALL RIGHTS RESERVED.</p>
          <div className="flex gap-10">
            {['Protocol', 'Privacy', 'Network'].map(item => (
              <button key={item} className="text-[9px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity">
                {item}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
