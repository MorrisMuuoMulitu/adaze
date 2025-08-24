"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  ShoppingBag, 
  Store, 
  Truck, 
  Search,
  Heart,
  MessageCircle,
  Wallet,
  Star,
  MapPin,
  Clock
} from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  userRole?: 'buyer' | 'trader' | 'transporter';
}

const tourSteps = {
  buyer: [
    {
      title: "Welcome to ADAZE! 🎉",
      description: "You're now part of Africa's largest mitumba marketplace. Let's show you around!",
      icon: ShoppingBag,
      color: "from-blue-500 to-purple-500"
    },
    {
      title: "Discover Amazing Products",
      description: "Browse thousands of quality second-hand items from verified traders across Africa.",
      icon: Search,
      color: "from-purple-500 to-pink-500",
      features: ["Advanced search filters", "Price comparison", "Quality verification", "Size recommendations"]
    },
    {
      title: "Smart Shopping Features",
      description: "Save favorites, track prices, and get notified when items go on sale.",
      icon: Heart,
      color: "from-pink-500 to-red-500",
      features: ["Wishlist management", "Price drop alerts", "Similar item suggestions", "Review system"]
    },
    {
      title: "Secure Payments & Delivery",
      description: "Pay safely with M-Pesa, Stripe, or PayPal. Track your orders in real-time.",
      icon: Wallet,
      color: "from-red-500 to-orange-500",
      features: ["Multiple payment options", "Escrow protection", "Real-time tracking", "Delivery confirmation"]
    },
    {
      title: "Community & Support",
      description: "Connect with traders, ask questions, and share your finds with the community.",
      icon: MessageCircle,
      color: "from-orange-500 to-yellow-500",
      features: ["Live chat support", "Community forums", "Trader ratings", "24/7 customer service"]
    }
  ],
  trader: [
    {
      title: "Welcome, Trader! 🏪",
      description: "Ready to grow your mitumba business? Let's get you set up for success!",
      icon: Store,
      color: "from-green-500 to-teal-500"
    },
    {
      title: "List Your Products",
      description: "Upload high-quality photos, set competitive prices, and reach thousands of buyers.",
      icon: ShoppingBag,
      color: "from-teal-500 to-blue-500",
      features: ["Bulk upload tools", "Dynamic pricing", "Inventory management", "Quality verification"]
    },
    {
      title: "Time-Slot Booking",
      description: "Set your availability and let customers book viewing slots. Maximize your earnings!",
      icon: Clock,
      color: "from-blue-500 to-purple-500",
      features: ["Flexible scheduling", "Peak hour pricing", "Auto-booking", "Calendar integration"]
    },
    {
      title: "Grow Your Business",
      description: "Access analytics, manage orders, and build your reputation with customer reviews.",
      icon: Star,
      color: "from-purple-500 to-pink-500",
      features: ["Sales analytics", "Customer insights", "Review management", "Referral program"]
    },
    {
      title: "Get Paid Instantly",
      description: "Receive payments directly to your M-Pesa or bank account. Track all transactions.",
      icon: Wallet,
      color: "from-pink-500 to-red-500",
      features: ["Instant payments", "Transaction history", "Tax reporting", "Revenue analytics"]
    }
  ],
  transporter: [
    {
      title: "Welcome, Transporter! 🚛",
      description: "Join our delivery network and start earning money by connecting buyers and traders!",
      icon: Truck,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Set Your Coverage Area",
      description: "Define your delivery zones and working hours to get matched with nearby orders.",
      icon: MapPin,
      color: "from-red-500 to-pink-500",
      features: ["Geofenced zones", "Flexible hours", "Route optimization", "Distance-based pricing"]
    },
    {
      title: "Accept Delivery Jobs",
      description: "Get notified of new deliveries, bid on jobs, or get auto-assigned based on proximity.",
      icon: Clock,
      color: "from-pink-500 to-purple-500",
      features: ["Smart job matching", "Competitive bidding", "Auto-assignment", "Job preferences"]
    },
    {
      title: "Track & Deliver",
      description: "Use GPS tracking, update delivery status, and provide proof of delivery to customers.",
      icon: Star,
      color: "from-purple-500 to-blue-500",
      features: ["GPS tracking", "Status updates", "Photo proof", "Customer communication"]
    },
    {
      title: "Earn & Grow",
      description: "Get paid per delivery, track your earnings, and build your reputation for more jobs.",
      icon: Wallet,
      color: "from-blue-500 to-green-500",
      features: ["Per-delivery payments", "Earnings tracking", "Performance metrics", "Bonus opportunities"]
    }
  ]
};

export function OnboardingTour({ isOpen, onComplete, userRole = 'buyer' }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = tourSteps[userRole];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-md">
            <CardHeader className="relative p-4 sm:p-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 p-0 mobile-button"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pr-8">
                <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${currentStepData.color} flex-shrink-0 w-fit`}>
                  <currentStepData.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg sm:text-2xl mb-2">{currentStepData.title}</CardTitle>
                  <p className="text-muted-foreground text-sm sm:text-lg">{currentStepData.description}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {currentStepData.features && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentStepData.features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Progress indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>Step {currentStep + 1} of {steps.length}</span>
                  <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% complete</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2 h-10 sm:h-12 mobile-button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex space-x-1 sm:space-x-2">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-colors mobile-button ${
                        index === currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={nextStep}
                  className="african-gradient text-white flex items-center space-x-2 h-10 sm:h-12 mobile-button"
                >
                  <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Skip option */}
              <div className="text-center pt-2">
                <Button variant="link" onClick={skipTour} className="text-muted-foreground text-sm mobile-button">
                  Skip tour and explore on my own
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}