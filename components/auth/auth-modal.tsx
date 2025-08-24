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
import { toast } from 'sonner';

interface AuthModalProps {
  type: 'login' | 'register' | null;
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

export function AuthModal({ type, isOpen, onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    userType: 'buyer',
    agreeToTerms: false
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        name: type === 'register' ? `${formData.firstName} ${formData.lastName}` : 'John Doe',
        email: formData.email,
        role: formData.userType,
        avatar: null,
        location: formData.location || 'Nairobi, Kenya',
        isVerified: true,
        wallet: {
          balance: 0,
          currency: 'KSh'
        },
        preferences: {
          notifications: true,
          language: 'en',
          theme: 'system'
        }
      };

      onSuccess(userData);
      toast.success(`${type === 'login' ? 'Karibu tena!' : 'Account created successfully!'}`, {
        description: type === 'register' ? 'Your ADAZE journey in Kenya begins now.' : 'Great to see you again.'
      });
    } catch (error) {
      toast.error('Something went wrong', {
        description: 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      location: '',
      userType: 'buyer',
      agreeToTerms: false
    });
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
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10 h-12 focus-ring"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-12 h-12 focus-ring"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
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
              </div>

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
                Don't have an account?{' '}
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-primary hover:text-primary/80"
                  onClick={() => setFormData({...formData, email: '', password: ''})}
                >
                  Sign up
                </Button>
              </p>
            </motion.form>
          ) : (
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
                      Select how you'd like to use ADAZE across Kenya
                    </p>
                  </div>

                  <RadioGroup
                    value={formData.userType}
                    onValueChange={(value) => setFormData({...formData, userType: value})}
                    className="space-y-3"
                  >
                    {userTypes.map((userType) => (
                      <div key={userType.value} className="relative">
                        <RadioGroupItem
                          value={userType.value}
                          id={userType.value}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={userType.value}
                          className={`flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md mobile-button ${
                            formData.userType === userType.value
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
                      </div>
                    ))}
                  </RadioGroup>

                  <Button 
                    onClick={() => setStep(2)}
                    className="w-full african-gradient text-white hover:opacity-90 h-12 mobile-button"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        className="h-12 focus-ring"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        className="h-12 focus-ring"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 h-12 focus-ring"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+254 700 123 456"
                        className="pl-10 h-12 focus-ring"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">County/Location in Kenya</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <select
                        id="location"
                        className="w-full pl-10 pr-4 h-12 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        required
                      >
                        <option value="">Select your county</option>
                        {kenyanCounties.map((county) => (
                          <option key={county} value={county}>{county}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        className="pl-10 pr-12 h-12 focus-ring"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                      />
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="h-12 focus-ring"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox 
                      id="terms" 
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, agreeToTerms: checked as boolean})
                      }
                      className="mt-1 focus-ring"
                      required
                    />
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
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full african-gradient text-white hover:opacity-90 h-12 mobile-button"
                    disabled={loading || !formData.agreeToTerms}
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
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}