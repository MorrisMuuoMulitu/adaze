"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  ShoppingBag,
  LayoutDashboard,
  Heart,
  Settings,
  Keyboard,
  Sparkles
} from 'lucide-react';
// import confetti from 'canvas-confetti'; // Optional - can be installed later

interface TourStep {
  title: string;
  description: string;
  icon: any;
  gradient: string;
}

const tourSteps: TourStep[] = [
  {
    title: 'Welcome to ADAZE! 🎉',
    description: 'Your premier platform for quality mitumba fashion across Kenya. Let\'s take a quick tour to get you started!',
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Explore the Marketplace 🛍️',
    description: 'Browse thousands of quality pre-loved fashion items from verified traders across all 47 counties.',
    icon: ShoppingBag,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Your Dashboard 📊',
    description: 'Track your orders, manage your profile, and view your shopping history - all in one place with beautiful analytics.',
    icon: LayoutDashboard,
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Save Your Favorites ❤️',
    description: 'Add items to your wishlist to save them for later. Never lose track of items you love!',
    icon: Heart,
    gradient: 'from-red-500 to-pink-500'
  },
  {
    title: 'Keyboard Shortcuts ⌨️',
    description: 'Navigate faster! Press ? to see all shortcuts. Try "G then M" for Marketplace, "G then D" for Dashboard.',
    icon: Keyboard,
    gradient: 'from-orange-500 to-yellow-500'
  },
  {
    title: 'Customize Your Experience ⚙️',
    description: 'Visit Settings to personalize your account, enable 2FA for security, and manage your preferences.',
    icon: Settings,
    gradient: 'from-indigo-500 to-purple-500'
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export function OnboardingTourEnhanced({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(true);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Celebrate with confetti (if canvas-confetti is installed)!
    // @ts-ignore
    if (typeof window !== 'undefined' && window.confetti) {
      // @ts-ignore
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setShow(false);
    setTimeout(() => {
      onComplete();
      localStorage.setItem('adaze-onboarding-completed', 'true');
    }, 500);
  };

  const handleSkip = () => {
    setShow(false);
    setTimeout(() => {
      onComplete();
      localStorage.setItem('adaze-onboarding-completed', 'true');
    }, 300);
  };

  const currentTour = tourSteps[currentStep];
  const Icon = currentTour.icon;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Tour Card */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto"
            >
              <Card className="w-full max-w-2xl bg-background/95 backdrop-blur-lg border-2 shadow-2xl overflow-hidden">
                {/* Progress Bar */}
                <div className="h-2 bg-muted relative overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${currentTour.gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Close Button */}
                  <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="mb-6"
                  >
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${currentTour.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-center mb-4"
                  >
                    {currentTour.title}
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground text-center text-lg mb-8 max-w-lg mx-auto"
                  >
                    {currentTour.description}
                  </motion.p>

                  {/* Step Indicators */}
                  <div className="flex items-center justify-center gap-2 mb-8">
                    {tourSteps.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStep
                            ? 'w-8 bg-primary'
                            : index < currentStep
                            ? 'w-2 bg-primary/50'
                            : 'w-2 bg-muted'
                        }`}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      />
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      variant="ghost"
                      onClick={handlePrev}
                      disabled={currentStep === 0}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <Badge variant="secondary" className="text-sm">
                      {currentStep + 1} of {tourSteps.length}
                    </Badge>

                    {currentStep === tourSteps.length - 1 ? (
                      <Button
                        onClick={handleComplete}
                        className={`gap-2 bg-gradient-to-r ${currentTour.gradient} hover:opacity-90`}
                      >
                        <Check className="h-4 w-4" />
                        Get Started
                      </Button>
                    ) : (
                      <Button onClick={handleNext} className="gap-2">
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Skip Link */}
                  <div className="text-center mt-6">
                    <button
                      onClick={handleSkip}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Skip tour
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
