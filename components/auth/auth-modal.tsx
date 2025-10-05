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
  Zap,
  Heart
} from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  role: z.enum(["buyer", "trader", "transporter"]),
});

const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  role: z.enum(["buyer", "trader", "transporter"]),
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
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "buyer",
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
          needsConfirmation: result.needsConfirmation,
          profile: result.profile
        });
        
        // Check if email verification is needed
        if (result.needsConfirmation) {
          addLog('📧 [AUTH MODAL] Email confirmation required');
          setRegisteredEmail(data.email);
          setShowEmailVerification(true);
          setLoading(false);
          return;
        }
        
        onSuccess(result.user);
        toast.success('Account created successfully!', {
          description: 'Welcome to ADAZE!',
          duration: 5000
        });
        
        addLog('🔄 [AUTH MODAL] Waiting 2 seconds before redirect (so you can see logs)...');
        // Wait 2 seconds so user can see the success logs
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        addLog('🔄 [AUTH MODAL] Redirecting to /dashboard...');
        // Redirect to marketplace after successful registration
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
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-center text-xl sm:text-2xl">
            {showForgotPassword ? 'Reset Your Password' : authType === 'login' ? 'Karibu Back to ADAZE' : 'Join ADAZE Kenya'}
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            {showForgotPassword 
              ? 'Enter your email and we\'ll send you a link to reset your password'
              : authType === 'login' 
                ? 'Sign in to your account to continue shopping in Kenya'
                : 'Create your account and start your mitumba journey across Kenya'
            }
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {showForgotPassword ? (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <Button
                className="w-full african-gradient text-white hover:opacity-90 h-12"
                disabled={loading || !resetEmail}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const supabase = await import('@/lib/supabase/client').then(m => m.createClient());
                    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                      redirectTo: `${window.location.origin}/auth/reset-password`,
                    });
                    
                    if (error) throw error;
                    
                    toast.success('Check your email!', {
                      description: 'We\'ve sent you a password reset link'
                    });
                    setShowForgotPassword(false);
                    setResetEmail('');
                  } catch (error: any) {
                    toast.error('Failed to send reset email', {
                      description: error.message
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </motion.div>
          ) : authType === 'login' ? (
            <Form {...loginForm}>
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="your@email.com" {...field} className="pl-10 h-12 focus-ring" />
                        </div>
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" {...field} className="pl-10 pr-12 h-12 focus-ring" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-10 w-10 p-0 mobile-button"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Login as</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          {userTypes.map(userType => (
                            <FormItem key={userType.value} className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value={userType.value} id={`login-${userType.value}`} />
                              </FormControl>
                              <FormLabel htmlFor={`login-${userType.value}`}>{userType.label}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" className="focus-ring" />
                    <Label htmlFor="remember" className="text-sm">Remember me</Label>
                  </div>
                  <Button 
                    type="button"
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-primary hover:text-primary/80"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full african-gradient text-white hover:opacity-90 transition-all duration-300 h-12 mobile-button"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <p className="text-center text-sm text-muted-foreground">Or continue with</p>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-2"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const { createClient } = await import('@/lib/supabase/client');
                        const supabase = createClient();
                        
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'google',
                          options: {
                            redirectTo: `${window.location.origin}/auth/callback`,
                            queryParams: {
                              access_type: 'offline',
                              prompt: 'consent',
                            }
                          }
                        });
                        
                        if (error) throw error;
                        
                        toast.info('Redirecting to Google...', {
                          description: 'You\'ll be redirected back after signing in'
                        });
                      } catch (error: any) {
                        toast.error('Failed to sign in with Google', {
                          description: error.message
                        });
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    aria-label="Sign in with Google"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                </div>

                <Separator className="my-4" />

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Button 
                    type="button"
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-primary hover:text-primary/80"
                    onClick={() => {
                      resetForm();
                      setAuthType('register');
                    }}
                  >
                    Sign up
                  </Button>
                </p>
              </motion.form>
            </Form>
          ) : (
            <Form {...registerForm}>
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold">Choose Your Account Type</h3>
                      <p className="text-sm text-muted-foreground">
                        Select the option that best describes you
                      </p>
                      <div className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        Step 1 of 2
                      </div>
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              {userTypes.map((userType) => (
                                <FormItem key={userType.value} className="relative">
                                  <FormControl>
                                    <RadioGroupItem
                                      value={userType.value}
                                      id={userType.value}
                                      className="sr-only"
                                      aria-label={`Select ${userType.label} account`}
                                    />
                                  </FormControl>
                                  <Label
                                    htmlFor={userType.value}
                                    className={`flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md mobile-button ${
                                      field.value === userType.value
                                        ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                  >
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${userType.color} flex-shrink-0`}>
                                      <userType.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-base sm:text-lg">{userType.label}</div>
                                      <div className="text-sm text-muted-foreground mb-2">
                                        {userType.description}
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {userType.features.map((feature, index) => (
                                          <span 
                                            key={index}
                                            className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium"
                                          >
                                            {index === 0 && <Heart className="h-3 w-3 mr-1" />}
                                            {index === 1 && <Shield className="h-3 w-3 mr-1" />}
                                            {index === 2 && <Zap className="h-3 w-3 mr-1" />}
                                            {feature}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </Label>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      onClick={() => setStep(2)}
                      className="w-full african-gradient text-white hover:opacity-90 h-12 mobile-button"
                    >
                      Continue
                    </Button>

                    <div className="relative my-4">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                        OR
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-2"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const { createClient } = await import('@/lib/supabase/client');
                          const supabase = createClient();
                          
                          const { error } = await supabase.auth.signInWithOAuth({
                            provider: 'google',
                            options: {
                              redirectTo: `${window.location.origin}/auth/callback`,
                              queryParams: {
                                access_type: 'offline',
                                prompt: 'consent',
                              }
                            }
                          });
                          
                          if (error) throw error;
                          
                          toast.info('Redirecting to Google...', {
                            description: 'Sign up instantly with your Google account'
                          });
                        } catch (error: any) {
                          toast.error('Failed to sign up with Google', {
                            description: error.message
                          });
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      aria-label="Quick sign up with Google"
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign up with Google
                    </Button>
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
                    <div className="flex items-center space-x-2 mb-6">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep(1)}
                        className="p-2 mobile-button"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div>
                        <h3 className="font-semibold text-lg">Account Details</h3>
                        <p className="text-sm text-muted-foreground">
                          Fill in your information for Kenya
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} className="h-12 focus-ring" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} className="h-12 focus-ring" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="email" placeholder="your@email.com" {...field} className="pl-10 h-12 focus-ring" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="tel" placeholder="+254 700 123 456" {...field} className="pl-10 h-12 focus-ring" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>County/Location in Kenya</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <select {...field} className="w-full pl-10 pr-4 h-12 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                                <option value="">Select your county</option>
                                {kenyanCounties.map((county) => (
                                  <option key={county} value={county}>{county}</option>
                                ))}
                              </select>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" {...field} className="pl-10 pr-12 h-12 focus-ring" />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1 h-10 w-10 p-0 mobile-button"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} className="h-12 focus-ring" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2 pt-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} id="terms" className="mt-1 focus-ring" />
                          </FormControl>
                          <Label htmlFor="terms" className="text-sm leading-relaxed">
                            I agree to the{' '}
                            <Button variant="link" size="sm" className="p-0 h-auto text-primary hover:text-primary/80">
                              Terms of Service
                            </Button>
                            {' '}and{' '}
                            <Button variant="link" size="sm" className="p-0 h-auto text-primary hover:text-primary/80">
                              Privacy Policy
                            </Button>
                            {' '}for Kenya operations
                          </Label>
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full african-gradient text-white hover:opacity-90 h-12 mobile-button"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>

                    <div className="relative my-6">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                        OR
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-2"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const { createClient } = await import('@/lib/supabase/client');
                          const supabase = createClient();
                          
                          const { error } = await supabase.auth.signInWithOAuth({
                            provider: 'google',
                            options: {
                              redirectTo: `${window.location.origin}/auth/callback`,
                              queryParams: {
                                access_type: 'offline',
                                prompt: 'consent',
                              }
                            }
                          });
                          
                          if (error) throw error;
                          
                          toast.info('Redirecting to Google...', {
                            description: 'You\'ll be redirected back after signing in'
                          });
                        } catch (error: any) {
                          toast.error('Failed to sign up with Google', {
                            description: error.message
                          });
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      aria-label="Sign up with Google"
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>

                    <Separator className="my-6" />

                    <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <Button 
                        type="button"
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-primary hover:text-primary/80"
                        onClick={() => {
                          resetForm();
                          setAuthType('login');
                        }}
                      >
                        Sign in
                      </Button>
                    </p>
                  </motion.form>
                )}
              </motion.div>
            </Form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>

      {/* Email Verification Success Dialog */}
      <Dialog open={showEmailVerification} onOpenChange={(open) => {
        if (!open) {
          setShowEmailVerification(false);
          handleClose();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">Check Your Email!</DialogTitle>
            <DialogDescription className="text-center text-base">
              We've sent a verification link to
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-center font-semibold text-lg break-all">{registeredEmail}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="mt-0.5">
                  <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                </div>
                <div>
                  <p className="font-medium text-sm">Check your inbox</p>
                  <p className="text-xs text-muted-foreground">Look for an email from ADAZE</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="mt-0.5">
                  <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                </div>
                <div>
                  <p className="font-medium text-sm">Click the verification link</p>
                  <p className="text-xs text-muted-foreground">This confirms your email address</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="mt-0.5">
                  <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                </div>
                <div>
                  <p className="font-medium text-sm">Sign in to your account</p>
                  <p className="text-xs text-muted-foreground">Return here to start shopping</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Can't find the email?</strong> Check your spam folder or contact support.
              </p>
            </div>

            <Button
              onClick={() => {
                setShowEmailVerification(false);
                handleClose();
              }}
              className="w-full h-12 african-gradient text-white"
            >
              Got it, I'll check my email
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                if (!registeredEmail) return;
                
                try {
                  const { createClient } = await import('@/lib/supabase/client');
                  const supabase = createClient();
                  
                  const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email: registeredEmail,
                  });
                  
                  if (error) throw error;
                  
                  toast.success('Verification email resent!', {
                    description: 'Please check your inbox again'
                  });
                } catch (error: any) {
                  toast.error('Failed to resend email', {
                    description: error.message
                  });
                }
              }}
              className="w-full"
            >
              Resend Verification Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
}