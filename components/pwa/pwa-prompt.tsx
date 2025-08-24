"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has dismissed the prompt before
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed && !standalone) {
        // Show prompt after a delay
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show manual install instructions
    if (iOS && !standalone) {
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96"
      >
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              
              <div className="flex-1 space-y-2 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base">Install ADAZE App</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {isIOS 
                    ? (
                      <span>
                        Add ADAZE to your home screen for the best experience. 
                        <br className="hidden sm:block" />
                        Tap <Share className="inline h-3 w-3 mx-1" /> and select 'Add to Home Screen'.
                      </span>
                    )
                    : "Install ADAZE for faster access, offline browsing, and push notifications."
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                  {!isIOS && deferredPrompt && (
                    <Button
                      size="sm"
                      onClick={handleInstall}
                      className="african-gradient text-white text-xs h-8 sm:h-9 mobile-button"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Install
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDismiss}
                    className="text-xs h-8 sm:h-9 mobile-button"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="w-6 h-6 p-0 flex-shrink-0 mobile-button"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}