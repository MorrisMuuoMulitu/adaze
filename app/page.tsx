"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { ProductGrid } from '@/components/sections/product-grid';
import { FeaturedProducts } from '@/components/sections/featured-products';
import { AuthModal } from '@/components/auth/auth-modal';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { PWAPrompt } from '@/components/pwa/pwa-prompt';
import { LiveChat } from '@/components/chat/live-chat';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { useAuth } from '@/components/auth/auth-provider';
import { ShoppingBag } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const { user, profile, loading } = useAuth();

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

  // Redirect logged-in users based on role
  useEffect(() => {
    if (loading) return;

    if (user) {
      console.log('Home: User detected, initiating redirect', { role: user.role });
      
      const role = user.role?.toLowerCase();
      
      if (role === 'admin') router.push('/admin');
      else if (role === 'buyer') router.push('/marketplace');
      else if (role === 'trader') router.push('/dashboard/trader');
      else if (role === 'transporter') router.push('/dashboard/transporter');
      else if (role === 'wholesaler') router.push('/dashboard/wholesaler');
      else {
        console.warn('Home: User has no role or unknown role, defaulting to marketplace');
        router.push('/marketplace');
      }
    }
  }, [user, loading, router]);

  const handleAuthSuccess = () => {
    setAuthModal(null);
  };

  // Only show the full-screen loading state if we are actually loading the initial session
  // or if we have a user and are waiting for the redirect to fire.
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 relative z-10"
        >
          <div className="relative w-24 h-24 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"
            ></motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">
            Establishing connection...
          </p>
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
                Welcome back, {user.name || (user.email ? user.email.split('@')[0] : 'User')}!
              </h2>
              <p className="text-muted-foreground mb-6">
                Redirecting to your dashboard...
              </p>
            </div>
          </div>
        )}
      </motion.main>

      <AuthModal
        type={authModal}
        isOpen={!!authModal}
        onClose={() => setAuthModal(null)}
        onSuccess={handleAuthSuccess}
      />

      {user && <KeyboardShortcuts />}
      <PWAPrompt />

      {user && (
        <>
          <LiveChat user={{
            id: user.id,
            name: user.name || user.email,
            email: user.email || '',
            role: user.role || 'BUYER',
            avatar: user.image,
          }} />
          <NotificationCenter user={{
            id: user.id,
            name: user.name || user.email,
            role: user.role || 'BUYER',
          }} />
        </>
      )}
    </div>
  );
}