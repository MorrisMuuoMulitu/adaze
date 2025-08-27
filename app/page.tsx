"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { FeaturedProducts } from '@/components/sections/featured-products';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Stats } from '@/components/sections/stats';
import { Testimonials } from '@/components/sections/testimonials';
import { WhyChooseUs } from '@/components/sections/why-choose-us';
import { CTA } from '@/components/sections/cta';
import { Footer } from '@/components/layout/footer';
import { AuthModal } from '@/components/auth/auth-modal';
import { OnboardingTour } from '@/components/onboarding/onboarding-tour';
import { PWAPrompt } from '@/components/pwa/pwa-prompt';
import { LiveChat } from '@/components/chat/live-chat';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { User, Product } from '@/types';
import { UserDashboard } from '@/components/sections/user-dashboard';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const { user, login, logout, isLoading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading and check for existing user session
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Check if user is first time visitor
      const hasVisited = localStorage.getItem('adaze-visited');
      if (!hasVisited && !user) {
        setShowOnboarding(true);
        localStorage.setItem('adaze-visited', 'true');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        setProductsError('Failed to fetch products.');
        console.error('Failed to fetch products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAuthSuccess = (userData: User) => {
    login(userData);
    setAuthModal(null);
    
    // Show onboarding for new users
    if (!localStorage.getItem(`adaze-onboarded-${userData.id}`)) {
      setShowOnboarding(true);
    }
  };

  const handleLogout = () => {
    logout();
    // In a real app, you would also clear any tokens from localStorage/cookies
    // and potentially make an API call to invalidate the session on the server.
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (user) {
      localStorage.setItem(`adaze-onboarded-${user.id}`, 'true');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            ADAZE
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-sm sm:text-base"
          >
            Loading your marketplace experience...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAuthClick={setAuthModal} user={user} onLogout={handleLogout} />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {user ? (
          <UserDashboard user={user} products={products} loading={productsLoading} error={productsError} />
        ) : (
          <>
            <Hero onGetStarted={() => setAuthModal('register')} />
            <Stats />
            <FeaturedProducts products={products} loading={productsLoading} error={productsError} />
            <WhyChooseUs />
            <HowItWorks />
            <Testimonials />
            <CTA />
          </>
        )}
      </motion.main>

      <Footer />
      
      {/* Modals and Overlays */}
      <AuthModal 
        type={authModal} 
        isOpen={!!authModal} 
        onClose={() => setAuthModal(null)}
        onSuccess={handleAuthSuccess}
      />
      
      {showOnboarding && (
        <OnboardingTour 
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          userRole={user?.role}
        />
      )}
      
      <PWAPrompt />
      
      {user && (
        <>
          <LiveChat user={user} />
          <NotificationCenter user={user} />
        </>
      )}
    </div>
  );
}