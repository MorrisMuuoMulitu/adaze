"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Store,
  ShoppingBag,
  Truck,
  ArrowLeft,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Valid identity manifest required'),
  password: z.string().min(1, 'Security sequence required'),
  role: z.string().optional(),
});

const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  role: z.enum(["buyer", "trader", "transporter", "wholesaler"]),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface AuthModalProps {
  type?: 'login' | 'register' | null;
  initialType?: 'login' | 'register';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

const kenyanCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale',
  'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho', 'Embu', 'Migori',
  'Kisii', 'Nyahururu', 'Naivasha', 'Voi', 'Wajir', 'Marsabit', 'Isiolo', 'Mandera',
  'Lamu', 'Kilifi', 'Kwale', 'Taita Taveta', 'Kajiado', 'Kiambu', 'Murang\'a', 'Kirinyaga',
  'Nyandarua', 'Laikipia', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo Marakwet',
  'Nandi', 'Baringo', 'Turkana', 'West Pokot', 'Bungoma', 'Busia', 'Siaya', 'Homa Bay'
];

export function AuthModal({ type, initialType, isOpen, onClose, onSuccess }: AuthModalProps) {
  const [authType, setAuthType] = useState<'login' | 'register'>(type || initialType || 'login');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdminAccess, setShowAdminAccess] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", role: undefined },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      password: "",
      confirmPassword: "",
      role: "buyer",
      agreeToTerms: false,
    },
  });

  const userTypes = [
    { value: 'buyer', label: 'Buyer', description: 'Browse and purchase quality items', icon: ShoppingBag },
    { value: 'trader', label: 'Trader', description: 'Sell your items to customers', icon: Store },
    { value: 'transporter', label: 'Transporter', description: 'Deliver items and earn money', icon: Truck },
    { value: 'wholesaler', label: 'Wholesaler', description: 'Supply items to traders', icon: ShoppingBag }
  ];

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        role: values.role,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Authentication failed', { description: 'Please check your credentials.' });
      } else {
        toast.success('Karibu tena!');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Account established.');
        // Auto-login after registration
        await signIn('credentials', {
          email: values.email,
          password: values.password,
          redirect: false,
        });
        window.location.href = '/dashboard';
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    loginForm.reset();
    registerForm.reset();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[95vh] overflow-y-auto rounded-none border-border/50 bg-background p-0 overflow-hidden shadow-2xl group">
        {loading && (
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-1/2 h-[1px] bg-accent z-[60]"
          />
        )}

        <div className="relative z-10 p-8 sm:p-10">
          <DialogHeader className="space-y-4 mb-8 text-left">
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent/60">
              {authType === 'login' ? 'COMMUNICATIONS // GATEWAY' : 'NEW_ENTITY // PROTOCOL'}
            </div>
            <DialogTitle className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.9]">
              {authType === 'login' ? <>Secure <span className="font-serif italic text-muted-foreground/30 lowercase">Access.</span></> : <>Establish <span className="font-serif italic text-muted-foreground/30 lowercase">Rank.</span></>}
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {authType === 'login' ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[9px] font-black tracking-widest uppercase opacity-60">Identifier</FormLabel>
                        <FormControl>
                          <Input placeholder="USER@COLLECTIVE.COM" {...field} className="h-14 rounded-none border-border/50 bg-muted/5 font-mono text-[11px] tracking-widest uppercase" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[9px] font-black tracking-widest uppercase opacity-60">Sequence</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} className="h-14 rounded-none border-border/50 bg-muted/5 font-mono text-[11px]" />
                            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showAdminAccess && (
                    <div className="p-4 border border-accent/30 bg-accent/5 space-y-3">
                      <div className="text-[8px] font-black tracking-[0.3em] uppercase text-accent">Authority Override</div>
                      <FormField
                        control={loginForm.control}
                        name="role"
                        render={({ field }) => (
                          <Button 
                            type="button" 
                            variant={field.value === 'admin' ? 'default' : 'outline'}
                            onClick={() => field.onChange(field.value === 'admin' ? undefined : 'admin')}
                            className="w-full h-10 rounded-none text-[9px] font-black uppercase tracking-widest"
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" /> Elevate to Admin
                          </Button>
                        )}
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full btn-premium h-16 rounded-none text-[12px] font-black uppercase tracking-[0.4em]" disabled={loading}>
                    {loading ? 'Synchronizing...' : 'Initialize Session'}
                  </Button>

                  <div className="flex justify-between items-center pt-4">
                    <button type="button" onClick={() => setShowAdminAccess(!showAdminAccess)} className="text-[8px] font-black uppercase opacity-20 hover:opacity-100">[ System Command? ]</button>
                    <button type="button" onClick={() => setAuthType('register')} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100">New Entity? Establish Rank →</button>
                  </div>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <div className="space-y-6">
                  {step === 1 ? (
                    <div className="space-y-6">
                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <div className="grid grid-cols-1 gap-2">
                            {userTypes.map((type) => (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => field.onChange(type.value)}
                                className={`flex items-center gap-4 p-4 border transition-all ${field.value === type.value ? 'border-accent bg-accent/5' : 'border-border/50 opacity-40'}`}
                              >
                                <type.icon className="h-5 w-5 text-accent" />
                                <div className="text-left">
                                  <div className="text-[10px] font-black uppercase tracking-widest">{type.label}</div>
                                  <div className="text-[8px] uppercase opacity-50">{type.description}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      />
                      <Button onClick={() => setStep(2)} className="w-full btn-premium h-14 rounded-none text-[10px] font-black uppercase" disabled={!registerForm.watch('role')}>Proceed to Phase 02</Button>
                    </div>
                  ) : (
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={registerForm.control} name="firstName" render={({ field }) => (
                          <FormItem><FormLabel className="text-[9px] font-black uppercase opacity-60">Forename</FormLabel><FormControl><Input placeholder="NAME" {...field} className="h-12 rounded-none border-border/50 bg-muted/5 font-mono text-[10px] uppercase" /></FormControl></FormItem>
                        )} />
                        <FormField control={registerForm.control} name="lastName" render={({ field }) => (
                          <FormItem><FormLabel className="text-[9px] font-black uppercase opacity-60">Surname</FormLabel><FormControl><Input placeholder="COLLECTIVE" {...field} className="h-12 rounded-none border-border/50 bg-muted/5 font-mono text-[10px] uppercase" /></FormControl></FormItem>
                        )} />
                      </div>
                      <FormField control={registerForm.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel className="text-[9px] font-black uppercase opacity-60">Email</FormLabel><FormControl><Input placeholder="USER@COLLECTIVE.COM" {...field} className="h-12 rounded-none border-border/50 bg-muted/5 font-mono text-[10px] uppercase" /></FormControl></FormItem>
                      )} />
                      <FormField control={registerForm.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel className="text-[9px] font-black uppercase opacity-60">Phone</FormLabel><FormControl><Input placeholder="+254" {...field} className="h-12 rounded-none border-border/50 bg-muted/5 font-mono text-[10px]" /></FormControl></FormItem>
                      )} />
                      <FormField control={registerForm.control} name="location" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[9px] font-black uppercase opacity-60">Region</FormLabel>
                          <select {...field} className="w-full h-12 rounded-none border border-border/50 bg-muted/5 font-mono text-[10px] uppercase px-4 appearance-none">
                            <option value="">SELECT REGION</option>
                            {kenyanCounties.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                          </select>
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={registerForm.control} name="password" render={({ field }) => (
                          <FormItem><FormLabel className="text-[9px] font-black uppercase opacity-60">Sequence</FormLabel><FormControl><Input type="password" {...field} className="h-12 rounded-none border-border/50 bg-muted/5 font-mono text-[10px]" /></FormControl></FormItem>
                        )} />
                        <FormField control={registerForm.control} name="confirmPassword" render={({ field }) => (
                          <FormItem><FormLabel className="text-[9px] font-black uppercase opacity-60">Verify</FormLabel><FormControl><Input type="password" {...field} className="h-12 rounded-none border-border/50 bg-muted/5 font-mono text-[10px]" /></FormControl></FormItem>
                        )} />
                      </div>
                      <Button type="submit" className="w-full btn-premium h-16 rounded-none text-[12px] font-black uppercase mt-4" disabled={loading}>{loading ? 'Initializing...' : 'Establish Profile'}</Button>
                      <button type="button" onClick={() => setStep(1)} className="w-full text-[9px] font-black uppercase opacity-30">Back to Phase 01</button>
                    </form>
                  )}
                </div>
              </Form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
