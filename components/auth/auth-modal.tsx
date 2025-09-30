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
  const [authType, setAuthType] = useState(initialType || type || 'login'); // Use initialType or type
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
        // Redirect to marketplace after successful login
        window.location.href = '/marketplace';
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
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        onSuccess(result.user);
        toast.success('Account created successfully!', {
          description: result.message || 'Please check your email to confirm your account.'
        });
        // Redirect to marketplace after successful registration
        window.location.href = '/marketplace';
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
            {type === 'login' ? 'Karibu Back to ADAZE' : 'Join ADAZE Kenya'}
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            {type === 'login' 
              ? 'Sign in to your account to continue shopping in Kenya'
              : 'Create your account and start your mitumba journey across Kenya'
            }
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {type === 'login' ? (
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
                  <Button variant="link" size="sm" className="p-0 h-auto text-primary hover:text-primary/80">
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

                <Separator className="my-6" />

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-primary hover:text-primary/80"
                    onClick={() => {
                      resetForm();
                      // A bit of a hack to switch to register view
                      onClose();
                      setTimeout(() => {
                        const getStartedButton = document.querySelector('#get-started-button');
                        if (getStartedButton) {
                          (getStartedButton as HTMLButtonElement).click();
                        }
                      }, 100);
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
                    <div className="text-center">
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">Choose Your Role in Kenya</h3>
                      <p className="text-sm text-muted-foreground">
                        Select how you&apos;d like to use ADAZE across Kenya
                      </p>
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
                                    />
                                  </FormControl>
                                  <Label
                                    htmlFor={userType.value}
                                    className={`flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md mobile-button ${
                                      field.value === userType.value
                                        ? 'border-primary bg-primary/5 shadow-md'
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
                  </div>
                )}

                {step === 2 && (
                  <motion.form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
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

                    <Separator className="my-6" />

                    <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-primary hover:text-primary/80"
                        onClick={() => {
                          resetForm();
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
  );
}