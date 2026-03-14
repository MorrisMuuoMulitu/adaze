"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only show if user hasn't dismissed it recently
      const dismissedAt = localStorage.getItem('pwa-dismissed-at');
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      if (!dismissedAt || parseInt(dismissedAt) < oneWeekAgo) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-dismissed-at', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[100]"
      >
        <div className="bg-background border border-accent/30 shadow-2xl p-6 relative rounded-none">
          <button 
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 opacity-40 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex gap-4 items-start pr-6">
            <div className="p-3 bg-accent text-white rounded-none shrink-0">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-widest">Install ADAZE App</h3>
              <p className="text-[10px] text-muted-foreground font-mono uppercase leading-relaxed">
                Add to your home screen for faster access and offline browsing.
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button 
              onClick={handleInstall}
              className="flex-1 btn-premium h-12 rounded-none text-[10px] font-black uppercase tracking-widest"
            >
              <Download className="mr-2 h-4 w-4" /> Install Now
            </Button>
            <Button 
              variant="outline"
              onClick={handleDismiss}
              className="h-12 rounded-none border-border/50 text-[9px] font-black uppercase tracking-widest"
            >
              Later
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
