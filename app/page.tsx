"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { ProductGrid } from '@/components/sections/product-grid';
import { FeaturedProducts } from '@/components/sections/featured-products';
import { Footer } from '@/components/layout/footer';
import { AuthModal } from '@/components/auth/auth-modal';
import { OnboardingTourEnhanced } from '@/components/onboarding-tour-enhanced';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { PWAPrompt } from '@/components/pwa/pwa-prompt';
import { LiveChat } from '@/components/chat/live-chat';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { useAuth } from '@/components/auth/auth-provider';

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for suspension/deletion error in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (error === 'account_suspended') {
      import('sonner').then(({ toast }) => {
        toast.error('Account Suspended', {
          description: 'Your account has been suspended. Please contact support for assistance.',
          duration: 8000,
        });
      });
      window.history.replaceState({}, '', '/');
    } else if (error === 'account_deleted') {
      import('sonner').then(({ toast }) => {
        toast.error('Account Not Found', {
          description: 'This account has been deleted. Please create a new account if you wish to continue.',
          duration: 8000,
        });
      });
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('OAuth error:', error);
            router.push('/?error=auth_failed');
          } else {
            window.history.replaceState({}, '', '/');
            window.location.reload();
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
        }
      }
    };
    handleOAuthCallback();
  }, [router, supabase.auth]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      const hasCompletedOnboarding = localStorage.getItem('adaze-onboarding-completed');
      if (!hasCompletedOnboarding && !user) {
        setShowOnboarding(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [user]);

  // Redirect logged-in users based on role
  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role;

      if (role === 'admin') router.push('/admin');
      else if (role === 'buyer') router.push('/marketplace');
      else if (role === 'trader') router.push('/dashboard/trader');
      else if (role === 'transporter') router.push('/dashboard/transporter');
      else if (role === 'wholesaler') router.push('/dashboard/wholesaler');
    };

    checkRoleAndRedirect();
  }, [user, router, supabase]);

  const handleAuthSuccess = () => {
    setAuthModal(null);
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
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAuthClick={setAuthModal} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {!user ? (
          <>
            <Hero onGetStarted={() => setAuthModal('register')} />
            <FeaturedProducts />
            <ProductGrid />
          </>
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user.user_metadata.full_name || (user.email ? user.email.split('@')[0] : 'User')}!
              </h2>
              <p className="text-muted-foreground mb-6">
                Redirecting to your dashboard...
              </p>
            </div>
          </div>
        )}
      </motion.main>

      <Footer />

      <AuthModal
        type={authModal}
        isOpen={!!authModal}
        onClose={() => setAuthModal(null)}
        onSuccess={handleAuthSuccess}
      />

      {showOnboarding && (
        <OnboardingTourEnhanced
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      {user && <KeyboardShortcuts />}
      <PWAPrompt />

      {user && (
        <>
          <LiveChat user={{
            id: user.id,
            name: user.user_metadata.full_name || user.email,
            email: user.email || '',
            role: user.user_metadata.role || 'buyer',
            avatar: user.user_metadata.avatar_url,
          }} />
          <NotificationCenter user={{
            id: user.id,
            name: user.user_metadata.full_name || user.email,
            role: user.user_metadata.role || 'buyer',
          }} />
        </>
      )}
    </div>
  );
}