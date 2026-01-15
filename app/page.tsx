"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
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
  const supabase = createClient();
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const { user } = useAuth();
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

  // Redirect logged-in users based on role
  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
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
        else router.push('/marketplace'); // Fallback
      } catch (error) {
        console.error('Role check error:', error);
        setIsLoading(false);
      }
    };

    if (user !== undefined) {
      checkRoleAndRedirect();
    }
  }, [user, router, supabase]);

  const handleAuthSuccess = () => {
    setAuthModal(null);
  };

  if (isLoading || (user && !isLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-[100px]"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8 relative z-10"
        >
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"
            ></motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black tracking-tighter bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer"
              style={{ backgroundSize: '200% auto' }}
            >
              ADAZE
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground font-medium"
            >
              {user ? 'Preparing your personalized experience...' : 'Crafting excellence...'}
            </motion.p>
          </div>
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