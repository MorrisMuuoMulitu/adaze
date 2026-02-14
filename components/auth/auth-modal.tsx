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
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  Shield,
  ShieldCheck,
  Terminal,
  Zap,
  Heart
} from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

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
  type?: 'login' | 'register' | null; // Make type optional
  initialType?: 'login' | 'register'; // Add initialType
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminAccess, setShowAdminAccess] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: undefined,
    },
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
    {
      value: 'buyer',
      label: 'Buyer',
      description: 'Browse and purchase quality mitumba items across Kenya',
      icon: ShoppingBag,
      color: 'from-blue-500 to-purple-500',
      features: ['Browse products', 'M-Pesa payments', 'Kenya-wide delivery']
    },
    {
      value: 'trader',
      label: 'Trader',
      description: 'Sell your quality mitumba items to customers across Kenya',
      icon: Store,
      color: 'from-green-500 to-teal-500',
      features: ['List products', 'Manage inventory', 'Earn with M-Pesa']
    },
    {
      value: 'transporter',
      label: 'Transporter',
      description: 'Deliver items across Kenya and earn money',
      icon: Truck,
      color: 'from-orange-500 to-red-500',
      features: ['Delivery jobs', 'County coverage', 'Good earnings']
    },
    {
      value: 'wholesaler',
      label: 'Wholesaler',
      description: 'Import and wholesale mitumba items to traders across Kenya',
      icon: ShoppingBag,
      color: 'from-purple-500 to-pink-500',
      features: ['Bulk imports', 'Trader supply', 'Country-wide reach']
    }
  ];

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        // Track the session
        try {
          const { createActiveSession } = await import('@/lib/login-tracker');
          await createActiveSession(result.user.id);
        } catch (sessionError) {
          console.error('Failed to track session:', sessionError);
        }

        onSuccess(result.user);
        toast.success('Karibu tena!', {
          description: 'Great to see you again.'
        });
        window.location.href = '/dashboard';
      } else {
        toast.error('Authentication failed', {
          description: result.message || 'Please check your credentials and try again.'
        });
      }
    } catch (error) {
      toast.error('An error occurred', {
        description: 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    // Create a logs array to save in localStorage
    const logs: string[] = [];
    const addLog = (message: string, data?: any) => {
      try {
        const logEntry = data ? `${message} ${JSON.stringify(data)}` : message;
        console.log(message, data || '');
        logs.push(logEntry);
        // Save to localStorage immediately
        localStorage.setItem('registration_debug_logs', JSON.stringify(logs));
      } catch (err) {
        console.error('Error in addLog:', err);
      }
    };

    addLog('🎯 [AUTH MODAL] Registration form submitted');
    addLog('🛑 [DEBUG] Preventing any page refresh or navigation on error');
    addLog('📋 [AUTH MODAL] Form data:', {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      location: data.location,
      role: data.role,
      agreeToTerms: data.agreeToTerms,
      hasPassword: !!data.password,
      passwordLength: data.password?.length,
      passwordsMatch: data.password === data.confirmPassword
    });

    setLoading(true);
    try {
      addLog('📡 [AUTH MODAL] Sending registration request to /api/auth/register...');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      addLog('📨 [AUTH MODAL] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      const result = await response.json();
      addLog('📦 [AUTH MODAL] Response data:', result);

      if (response.ok) {
        addLog('✅ [AUTH MODAL] Registration successful!', {
          userId: result.user?.id,
          email: result.user?.email,
          profile: result.profile
        });

        // Email verification is disabled - proceed directly
        onSuccess(result.user);
        toast.success('Account created successfully!', {
          description: 'Welcome to ADAZE! Redirecting...',
          duration: 3000
        });

        addLog('🔄 [AUTH MODAL] Redirecting to /dashboard...');
        // Small delay for toast to show
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Redirect to dashboard after successful registration
        window.location.href = '/dashboard';
      } else {
        // ERROR CASE - Save logs and keep modal open
        addLog('❌ [AUTH MODAL] Registration failed:', {
          status: response.status,
          message: result.message,
          error: result.error
        });

        console.error('⚠️⚠️⚠️ REGISTRATION FAILED - MODAL STAYING OPEN SO YOU CAN COPY LOGS ⚠️⚠️⚠️');
        console.error('📋 Full error details:', result);
        console.error('💾 Logs saved to localStorage - Type: localStorage.getItem("registration_debug_logs")');

        // CRITICAL: Do NOT call any navigation, onSuccess, onClose, or window.location
        // This prevents page refresh
        console.error('🛑 [DEBUG] NOT calling onClose, onSuccess, or any navigation');
        console.error('🛑 [DEBUG] NOT setting loading to false yet to prevent any re-render issues');

        // Show error toast but DON'T close modal or redirect
        toast.error('❌ Registration failed - Check console logs!', {
          description: result.message || 'Please check your credentials and try again.',
          duration: 10000 // Show for 10 seconds
        });

        // Keep modal open by NOT calling onClose or onSuccess
        console.error('🛑 [AUTH MODAL] Modal staying open so you can copy the error logs above');
        console.error('🛑 [AUTH MODAL] Logs are also saved - Open console and type:');
        console.error('    JSON.parse(localStorage.getItem("registration_debug_logs"))');

        // Explicitly prevent any further execution
        setLoading(false);
        return; // STOP HERE - don't continue to finally block
      }
    } catch (error: any) {
      // EXCEPTION CASE - Save logs
      try {
        const errorLog = {
          name: error.name,
          message: error.message,
          stack: error.stack
        };
        logs.push(`💥 [AUTH MODAL] Registration error: ${JSON.stringify(errorLog)}`);
        localStorage.setItem('registration_debug_logs', JSON.stringify(logs));

        console.error('💥 [AUTH MODAL] Registration error:', errorLog);
        console.error('⚠️⚠️⚠️ UNEXPECTED ERROR - MODAL STAYING OPEN SO YOU CAN COPY LOGS ⚠️⚠️⚠️');
        console.error('💾 Logs saved to localStorage - Type: localStorage.getItem("registration_debug_logs")');

        // CRITICAL: Do NOT call any navigation, onSuccess, onClose, or window.location
        console.error('🛑 [DEBUG] NOT calling onClose, onSuccess, or any navigation');

        toast.error('❌ An error occurred - Check console logs!', {
          description: error.message || 'Please try again later.',
          duration: 10000
        });

        console.error('🛑 [AUTH MODAL] Modal staying open so you can copy the error logs above');
        console.error('🛑 [AUTH MODAL] Logs are also saved - Open console and type:');
        console.error('    JSON.parse(localStorage.getItem("registration_debug_logs"))');

        // Set loading false and STOP
        setLoading(false);
        return; // STOP HERE - prevent finally block from running
      } catch (loggingError) {
        // If even logging fails, at least show something
        console.error('CRITICAL ERROR - Even logging failed:', loggingError);
        console.error('Original error:', error);
        setLoading(false);
        return;
      }
    } finally {
      // This should only run on success now
      console.log('🏁 [AUTH MODAL] Finally block - this should only run on success');
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
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[95vh] overflow-y-auto rounded-none border-border/50 bg-background p-0 overflow-hidden shadow-2xl selection:bg-accent/30 selection:text-white group">
        {/* Progress Scanner */}
        {loading && (
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-1/2 h-[1px] bg-accent z-[60] shadow-[0_0_10px_rgba(var(--accent),0.5)]"
          />
        )}

        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-scanline opacity-[0.04] pointer-events-none z-50" />

        <div className="relative z-10 p-8 sm:p-10">
          {/* Aesthetic Session ID */}
          <div className="absolute top-8 right-8 text-[7px] font-mono text-accent opacity-20 pointer-events-none tracking-[0.2em] hidden sm:block">
            X-AUTH-SID // {Math.random().toString(16).slice(2, 8).toUpperCase()}
          </div>

          <DialogHeader className="space-y-4 mb-8 text-left">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] font-black tracking-[0.4em] uppercase text-accent/60"
            >
              {showForgotPassword
                ? 'SECURITY // RECOVERY'
                : authType === 'login'
                  ? 'COMMUNICATIONS // GATEWAY'
                  : 'NEW_ENTITY // PROTOCOL'}
            </motion.div>
            <DialogTitle className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.9]">
              {showForgotPassword ? (
                <>Reset <span className="font-serif italic text-muted-foreground/30 lowercase">Access.</span></>
              ) : authType === 'login' ? (
                <>Secure <span className="font-serif italic text-muted-foreground/30 lowercase">Access.</span></>
              ) : (
                <>Establish <span className="font-serif italic text-muted-foreground/30 lowercase">Rank.</span></>
              )}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mt-2 leading-relaxed">
              {showForgotPassword
                ? 'Authenticate identity via secure repository link.'
                : authType === 'login'
                  ? 'Dispatch credentials to synchronize your command center archive.'
                  : 'Execute initialization sequence to join the commercial force.'
              }
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {showForgotPassword ? (
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label htmlFor="reset-email" className="text-[9px] font-black tracking-widest uppercase opacity-60">Identity Link</Label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-accent opacity-30 group-focus-within/input:opacity-100 transition-opacity" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="USER@COLLECTIVE.COM"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-12 h-14 rounded-none border-border/50 bg-muted/5 focus-ring uppercase font-mono text-[11px] font-bold tracking-widest"
                    />
                  </div>
                </div>

                <Button
                  className="w-full btn-premium h-14 rounded-none text-[10px] font-black tracking-[0.4em] uppercase"
                  disabled={loading || !resetEmail}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const supabase = await import('@/lib/supabase/client').then(m => m.createClient());
                      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                        redirectTo: `${window.location.origin}/auth/reset-password`,
                      });

                      if (error) throw error;

                      toast.success('Manifest Dispatched', {
                        description: 'Check your restricted access inbox.'
                      });
                      setShowForgotPassword(false);
                      setResetEmail('');
                    } catch (error: any) {
                      toast.error('Dispatch Failed');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? 'Transmitting...' : 'Dispatch Reset Sequence'}
                </Button>

                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                  }}
                  className="w-full flex items-center justify-center gap-2 text-[9px] font-black tracking-widest uppercase opacity-30 hover:opacity-100 transition-all mt-4 group/back"
                >
                  <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                  Return to Gateway
                </button>
              </motion.div>
            ) : authType === 'login' ? (
              <Form {...loginForm}>
                <motion.form
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-5">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[9px] font-black tracking-widest uppercase opacity-60">Manifest Identifier</FormLabel>
                          <FormControl>
                            <div className="relative group/input">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent opacity-30 group-focus-within/input:opacity-100 transition-opacity" />
                              <Input placeholder="USER@COLLECTIVE.COM" {...field} className="pl-12 h-14 rounded-none border-border/50 bg-muted/5 focus-ring uppercase font-mono text-[11px] font-bold tracking-widest" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[9px] uppercase font-black text-destructive tracking-widest mt-1" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[9px] font-black tracking-widest uppercase opacity-60">Security Sequence</FormLabel>
                          <FormControl>
                            <div className="relative group/input">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent opacity-30 group-focus-within/input:opacity-100 transition-opacity" />
                              <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} className="pl-12 pr-12 h-14 rounded-none border-border/50 bg-muted/5 focus-ring font-mono text-[11px] font-bold tracking-widest" />
                              <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-[9px] uppercase font-black text-destructive tracking-widest mt-1" />
                        </FormItem>
                      )}
                    />

                    {/* System Access Override */}
                    <AnimatePresence>
                      {showAdminAccess && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 overflow-hidden"
                        >
                          <div className="p-4 border border-accent/30 bg-accent/5 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-[8px] font-black tracking-[0.3em] uppercase text-accent">Authority Core // Detected</div>
                              <Terminal className="h-3 w-3 text-accent animate-pulse" />
                            </div>
                            <FormField
                              control={loginForm.control}
                              name="role"
                              render={({ field }) => (
                                <button
                                  type="button"
                                  onClick={() => field.onChange(field.value === 'admin' ? undefined : 'admin')}
                                  className={`w-full flex items-center justify-between p-3 border transition-all ${field.value === 'admin'
                                    ? 'border-accent bg-accent text-white shadow-[0_0_15px_rgba(var(--accent),0.3)]'
                                    : 'border-white/10 opacity-40 hover:opacity-100'
                                    }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="text-[9px] font-black tracking-widest uppercase">Elevate to Admin</span>
                                  </div>
                                  {field.value === 'admin' && <div className="text-[8px] font-mono">ACTIVE</div>}
                                </button>
                              )}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-between py-3 border-y border-border/10">
                    <div className="flex items-center space-x-3 group/check">
                      <Checkbox id="remember" className="rounded-none border-border/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent" />
                      <Label htmlFor="remember" className="text-[9px] font-black tracking-widest uppercase opacity-40 group-hover/check:opacity-100 cursor-pointer transition-opacity">Persistent Link</Label>
                    </div>
                    <button
                      type="button"
                      className="text-[9px] font-black tracking-widest uppercase text-accent/60 hover:text-accent transition-colors"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Sequence Recovery?
                    </button>
                  </div>

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      className="w-full btn-premium h-16 rounded-none text-[12px] font-black tracking-[0.4em] uppercase"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 border-[1.5px] border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Synchronizing...</span>
                        </div>
                      ) : (
                        'Initialize Session'
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setShowAdminAccess(!showAdminAccess)}
                      className="w-full text-center text-[8px] font-black tracking-[0.2em] uppercase opacity-20 hover:opacity-100 hover:text-accent transition-all py-2"
                    >
                      {showAdminAccess ? '[ Deactivate Terminal ]' : '[ System Command? ]'}
                    </button>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 rounded-none border-border/50 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-accent/5 transition-colors"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const { createClient } = await import('@/lib/supabase/client');
                          const supabase = createClient();
                          const { error } = await supabase.auth.signInWithOAuth({
                            provider: 'google',
                            options: { redirectTo: `${window.location.origin}/auth/callback` }
                          });
                          if (error) throw error;
                        } catch (error: any) {
                          toast.error('OAuth Failed');
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                    >
                      <svg className="h-4 w-4 mr-3" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" opacity="0.4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" opacity="0.4" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google Authentication
                    </Button>
                  </div>

                  <div className="pt-8 text-center">
                    <button
                      type="button"
                      className="text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 hover:text-accent transition-all duration-300"
                      onClick={() => {
                        resetForm();
                        setAuthType('register');
                      }}
                    >
                      New Entity? <span className="underline underline-offset-4 decoration-accent/30 italic ml-1">Establish Rank →</span>
                    </button>
                  </div>
                </motion.form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                  {step === 1 && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between border-b border-border/10 pb-4">
                        <div className="text-[10px] font-black tracking-[0.3em] uppercase text-accent">Phase 01 // Identity Vector</div>
                        <div className="text-[8px] font-mono opacity-20 hidden sm:block uppercase">Selection Core Necessary</div>
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormControl>
                              <div className="grid grid-cols-1 gap-2">
                                {userTypes.map((userType) => (
                                  <button
                                    key={userType.value}
                                    type="button"
                                    onClick={() => field.onChange(userType.value)}
                                    className={`relative flex flex-col sm:flex-row items-center sm:items-center text-left gap-6 p-6 border transition-all group/role overflow-hidden ${field.value === userType.value
                                      ? 'border-accent bg-accent/5 ring-1 ring-accent/20'
                                      : 'border-border/50 hover:border-accent/30 opacity-40 hover:opacity-100'
                                      }`}
                                  >
                                    <div className={`p-4 rounded-none bg-muted/5 group-hover/role:bg-accent/5 transition-colors`}>
                                      <userType.icon className={`h-6 w-6 transition-transform group-hover/role:scale-110 ${field.value === userType.value ? 'text-accent' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-xs font-black tracking-widest uppercase mb-1">{userType.label}</div>
                                      <div className="text-[10px] font-bold tracking-tight uppercase opacity-50 italic">
                                        {userType.description}
                                      </div>
                                    </div>
                                    {field.value === userType.value && (
                                      <motion.div
                                        layoutId="activeRole"
                                        className="absolute top-2 right-2 flex gap-1"
                                      >
                                        {[1, 2, 3].map(i => (
                                          <div key={i} className="w-[2px] h-3 bg-accent/40" />
                                        ))}
                                      </motion.div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Button
                        onClick={() => setStep(2)}
                        className="w-full btn-premium h-16 rounded-none text-[12px] font-black tracking-[0.4em] uppercase shadow-lg shadow-accent/5"
                        disabled={!registerForm.watch('role')}
                      >
                        Proceed to Phase 02
                      </Button>

                      <div className="pt-4 text-center">
                        <button
                          type="button"
                          className="text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 hover:text-accent transition-all duration-300"
                          onClick={() => {
                            resetForm();
                            setAuthType('login');
                          }}
                        >
                          Existing Entity? <span className="underline underline-offset-4 decoration-accent/30 italic ml-1">Secure Access →</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <motion.form
                      onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        registerForm.handleSubmit(onRegisterSubmit)(e);
                      }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-border/10 pb-4 mb-2">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase opacity-30 hover:opacity-100 transition-all hover:-translate-x-1"
                        >
                          <ArrowLeft className="h-3 w-3" />
                          Phase 01
                        </button>
                        <div className="text-[10px] font-black tracking-[0.3em] uppercase text-accent">Phase 02 // Credentials</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[9px] font-black tracking-widest uppercase opacity-60">Legal Forename</FormLabel>
                              <FormControl>
                                <Input placeholder="IDENTITY" {...field} className="h-12 rounded-none border-border/50 bg-muted/5 focus-ring uppercase font-mono text-[11px] font-bold tracking-widest" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[9px] font-black tracking-widest uppercase opacity-60">Legal Surname</FormLabel>
                              <FormControl>
                                <Input placeholder="COLLECTIVE" {...field} className="h-12 rounded-none border-border/50 bg-muted/5 focus-ring uppercase font-mono text-[11px] font-bold tracking-widest" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[9px] font-black tracking-widest uppercase opacity-60">Manifest Identifier</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="USER@COLLECTIVE.COM" {...field} className="h-12 rounded-none border-border/50 bg-muted/5 focus-ring uppercase font-mono text-[11px] font-bold tracking-widest" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[9px] font-black tracking-widest uppercase opacity-60">Contact Terminal</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+254 --- --- ---" {...field} className="h-12 rounded-none border-border/50 bg-muted/5 focus-ring font-mono text-[11px] font-bold tracking-widest" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[9px] font-black tracking-widest uppercase opacity-60">Regional Sector</FormLabel>
                            <FormControl>
                              <div className="relative group/select">
                                <select
                                  {...field}
                                  className="w-full h-12 rounded-none border border-border/50 bg-muted/5 focus-ring uppercase font-mono text-[11px] font-bold tracking-widest px-4 appearance-none cursor-pointer"
                                >
                                  <option value="" className="bg-background text-muted-foreground">SELECT REGION</option>
                                  {kenyanCounties.map((county) => (
                                    <option key={county} value={county}>{county.toUpperCase()}</option>
                                  ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">▼</div>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[9px] font-black tracking-widest uppercase opacity-60">Sequence</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} className="h-12 rounded-none border-border/50 bg-muted/5 focus-ring font-mono text-[11px] font-bold tracking-widest" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[9px] font-black tracking-widest uppercase opacity-60">Verify</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} className="h-12 rounded-none border-border/50 bg-muted/5 focus-ring font-mono text-[11px] font-bold tracking-widest" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 pt-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} id="terms" className="mt-1 rounded-none border-border/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent" />
                            </FormControl>
                            <Label htmlFor="terms" className="text-[9px] font-black tracking-widest uppercase opacity-30 leading-relaxed cursor-pointer hover:opacity-100 italic">
                              Accept <span className="text-accent underline underline-offset-2 decoration-accent/30">System Protocols</span> and Privacy Manifest.
                            </Label>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full btn-premium h-16 rounded-none text-[12px] font-black tracking-[0.4em] uppercase mt-4"
                        disabled={loading}
                      >
                        {loading ? 'Initializing Entity...' : 'Establish Profile'}
                      </Button>
                    </motion.form>
                  )}
                </motion.div>
              </Form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}