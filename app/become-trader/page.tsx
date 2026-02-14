"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Store,
    TrendingUp,
    Users,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    Package,
    BadgeCheck,
    Rocket,
    ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
    {
        title: "The Vision",
        description: "Define your brand and business details",
        icon: Store
    },
    {
        title: "Verification",
        description: "Official documents for platform trust",
        icon: ShieldCheck
    },
    {
        title: "Activation",
        description: "Launch your storefront to the world",
        icon: Rocket
    }
];

export default function BecomeTraderPage() {
    const router = useRouter();
    const { user, profile, loading } = useAuth();
    const supabase = createClient();

    const [step, setStep] = useState(0); // 0 is landing, 1-3 are flow
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        businessDescription: '',
        location: '',
        phone: '',
    });

    const isAlreadyTrader = profile?.role === 'trader';

    const handleStartOnboarding = () => {
        if (!user) {
            // Trigger login modal via window event (handled in Navbar/Home)
            window.dispatchEvent(new CustomEvent('TRIGGER_AUTH_MODAL', { detail: { type: 'register' } }));
            return;
        }
        setStep(1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!user) return;

        setSubmitting(true);
        try {
            // In a real flow, we might save this to a 'trader_applications' table
            // But for this MVP refinement, we'll upgrade the role and save profile info
            const { error } = await supabase
                .from('profiles')
                .update({
                    role: 'trader',
                    full_name: formData.businessName || profile?.full_name,
                    phone: formData.phone || profile?.phone,
                    location: formData.location || profile?.location,
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success('Welcome to the inner circle. You are now a Trader.');
            router.push('/dashboard/trader');
        } catch (error: any) {
            console.error('Upgrade error:', error);
            toast.error('Failed to upgrade account: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
            <Navbar onAuthClick={() => { }} />

            <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {step === 0 ? (
                        <motion.div
                            key="landing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-24"
                        >
                            {/* Hero Section */}
                            <div className="text-center space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-[10px] font-black tracking-[0.3em] uppercase text-accent"
                                >
                                    <BadgeCheck className="w-3 h-3" />
                                    Elite Merchant Program
                                </motion.div>

                                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
                                    Empower Your <span className="text-muted-foreground/20 italic">Empire.</span>
                                </h1>

                                <p className="text-xl md:text-2xl text-muted-foreground/60 max-w-2xl mx-auto font-medium tracking-tight">
                                    Join the most exclusive network of fashion curators in Africa.
                                    Scale your influence, manage your inventory, and reach thousands.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                                    {isAlreadyTrader ? (
                                        <Button
                                            size="lg"
                                            className="btn-premium h-14 px-12 group rounded-none"
                                            onClick={() => router.push('/dashboard/trader')}
                                        >
                                            Go to Your Command Center
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className="btn-premium h-14 px-12 group rounded-none"
                                            onClick={handleStartOnboarding}
                                        >
                                            Begin Your Ascent
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="link"
                                        className="text-[10px] font-black tracking-[0.3em] uppercase hover:text-accent transition-colors"
                                    >
                                        View Merchant Handbook
                                    </Button>
                                </div>
                            </div>

                            {/* Perks Grid */}
                            <div className="grid md:grid-cols-3 gap-px bg-border/50 border border-border/50">
                                {[
                                    {
                                        title: "Curated Exposure",
                                        desc: "Your boutique showcased to a global audience of high-intent buyers.",
                                        icon: Users
                                    },
                                    {
                                        title: "Advanced Analytics",
                                        desc: "Real-time data on sales, trends, and customer behavior at your fingertips.",
                                        icon: TrendingUp
                                    },
                                    {
                                        title: "Seamless Logistics",
                                        desc: "Integrated transporter network ensures your goods reach customers safely.",
                                        icon: Package
                                    }
                                ].map((perk, i) => (
                                    <div key={i} className="bg-background p-12 space-y-6 hover:bg-muted/5 transition-colors group">
                                        <div className="w-12 h-12 flex items-center justify-center border border-border group-hover:border-accent/50 transition-colors">
                                            <perk.icon className="w-5 h-5 text-accent" />
                                        </div>
                                        <h3 className="text-lg font-black tracking-tighter uppercase">{perk.title}</h3>
                                        <p className="text-muted-foreground/60 text-sm leading-relaxed font-medium">
                                            {perk.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="onboarding"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="max-w-2xl mx-auto"
                        >
                            <Button
                                variant="ghost"
                                className="mb-12 gap-2 text-[10px] font-black tracking-widest uppercase opacity-50 hover:opacity-100"
                                onClick={() => setStep(0)}
                            >
                                <ArrowLeft className="w-3 h-3" />
                                Return
                            </Button>

                            <div className="space-y-12">
                                <div>
                                    <h2 className="text-4xl font-black tracking-tighter uppercase mb-4">
                                        Merchant <span className="text-accent">Onboarding.</span>
                                    </h2>
                                    <div className="flex gap-4">
                                        {STEPS.map((s, i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-grow transition-all duration-500 ${step >= i + 1 ? 'bg-accent' : 'bg-border'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <Card className="rounded-none border-border shadow-2xl bg-muted/5">
                                    <CardContent className="p-12 space-y-8">
                                        {step === 1 && (
                                            <motion.div
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                className="space-y-6"
                                            >
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black tracking-widest uppercase opacity-50">Business Identity</Label>
                                                    <Input
                                                        name="businessName"
                                                        placeholder="BOUTIQUE NAME"
                                                        className="h-14 rounded-none bg-background border-none text-xl font-bold tracking-tight px-0 border-b border-border focus-visible:ring-0 focus-visible:border-accent transition-colors"
                                                        value={formData.businessName}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black tracking-widest uppercase opacity-50">Operational Base</Label>
                                                    <Input
                                                        name="location"
                                                        placeholder="LOCATION / CITY"
                                                        className="h-14 rounded-none bg-background border-none text-xl font-bold tracking-tight px-0 border-b border-border focus-visible:ring-0 focus-visible:border-accent transition-colors"
                                                        value={formData.location}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black tracking-widest uppercase opacity-50">Contact Line</Label>
                                                    <Input
                                                        name="phone"
                                                        placeholder="PHONE NUMBER"
                                                        className="h-14 rounded-none bg-background border-none text-xl font-bold tracking-tight px-0 border-b border-border focus-visible:ring-0 focus-visible:border-accent transition-colors"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 2 && (
                                            <motion.div
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                className="space-y-6"
                                            >
                                                <div className="p-8 border border-dashed border-border text-center space-y-4 hover:border-accent/50 transition-colors cursor-pointer group">
                                                    <div className="w-12 h-12 border border-border flex items-center justify-center mx-auto group-hover:border-accent group-hover:text-accent transition-colors">
                                                        <ShieldCheck className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black tracking-tighter uppercase">Upload Identity Document</p>
                                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">
                                                            National ID or Business License (PDF, JPG)
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black tracking-widest uppercase opacity-50">Business Vision (Optional)</Label>
                                                    <Textarea
                                                        name="businessDescription"
                                                        placeholder="Describe your boutique's aesthetic and focus..."
                                                        className="min-h-[120px] rounded-none bg-background border-border focus-visible:ring-accent font-medium tracking-tight"
                                                        value={formData.businessDescription}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 3 && (
                                            <motion.div
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                className="text-center space-y-8 py-12"
                                            >
                                                <div className="w-20 h-20 border-2 border-accent flex items-center justify-center mx-auto relative">
                                                    <CheckCircle2 className="w-10 h-10 text-accent" />
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className="absolute inset-0 border-2 border-accent"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-black tracking-tighter uppercase">Finalize Activation</h3>
                                                    <p className="text-muted-foreground/60 text-sm font-medium tracking-tight">
                                                        By proceeding, you agree to our Merchant Terms of Service and quality guidelines.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="flex justify-between gap-4 pt-12">
                                            {step > 1 && (
                                                <Button
                                                    variant="outline"
                                                    className="h-14 px-8 rounded-none border-border hover:bg-muted/50 transition-all font-black text-[10px] tracking-widest uppercase"
                                                    onClick={() => setStep(step - 1)}
                                                >
                                                    Back
                                                </Button>
                                            )}

                                            {step < 3 ? (
                                                <Button
                                                    className="btn-premium h-14 flex-grow rounded-none group"
                                                    onClick={() => setStep(step + 1)}
                                                    disabled={step === 1 && (!formData.businessName || !formData.location)}
                                                >
                                                    Continue
                                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="btn-premium h-14 flex-grow rounded-none"
                                                    onClick={handleSubmit}
                                                    disabled={submitting}
                                                >
                                                    {submitting ? 'Authenticating...' : 'Launch Storefront'}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
