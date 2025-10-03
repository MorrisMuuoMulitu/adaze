"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  ShoppingBag, 
  LayoutDashboard, 
  Settings, 
  Heart, 
  ShoppingCart, 
  Package,
  Keyboard,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

export function KeyboardShortcuts() {
  const router = useRouter();
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const userRole = user?.user_metadata?.role;

  const shortcuts = [
    { key: 'G then H', action: 'Go to Home', icon: Home, path: '/' },
    { key: 'G then M', action: 'Go to Marketplace', icon: ShoppingBag, path: '/marketplace', role: 'buyer' },
    { key: 'G then D', action: 'Go to Dashboard', icon: LayoutDashboard, path: `/dashboard/${userRole}` },
    { key: 'G then S', action: 'Go to Settings', icon: Settings, path: '/settings' },
    { key: 'G then W', action: 'Go to Wishlist', icon: Heart, path: '/wishlist' },
    { key: 'G then C', action: 'Go to Cart', icon: ShoppingCart, path: '/cart', role: 'buyer' },
    { key: 'G then O', action: 'Go to Orders', icon: Package, path: '/orders' },
    { key: '/', action: 'Focus Search', icon: Search, special: 'search' },
    { key: '?', action: 'Show Shortcuts', icon: Keyboard, special: 'help' },
  ];

  useEffect(() => {
    let buffer = '';
    let bufferTimeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Show shortcuts dialog
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setShowDialog(true);
        return;
      }

      // Focus search
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          toast.success('Search focused', { description: 'Type to search...' });
        }
        return;
      }

      // Handle G + key shortcuts
      buffer += e.key.toLowerCase();
      
      clearTimeout(bufferTimeout);
      bufferTimeout = setTimeout(() => {
        buffer = '';
      }, 1000);

      // Check for command
      if (buffer === 'gh') {
        e.preventDefault();
        router.push('/');
        toast.success('Navigating to Home');
        buffer = '';
      } else if (buffer === 'gm' && userRole === 'buyer') {
        e.preventDefault();
        router.push('/marketplace');
        toast.success('Navigating to Marketplace');
        buffer = '';
      } else if (buffer === 'gd') {
        e.preventDefault();
        router.push(`/dashboard/${userRole}`);
        toast.success('Navigating to Dashboard');
        buffer = '';
      } else if (buffer === 'gs') {
        e.preventDefault();
        router.push('/settings');
        toast.success('Navigating to Settings');
        buffer = '';
      } else if (buffer === 'gw') {
        e.preventDefault();
        router.push('/wishlist');
        toast.success('Navigating to Wishlist');
        buffer = '';
      } else if (buffer === 'gc' && userRole === 'buyer') {
        e.preventDefault();
        router.push('/cart');
        toast.success('Navigating to Cart');
        buffer = '';
      } else if (buffer === 'go') {
        e.preventDefault();
        router.push('/orders');
        toast.success('Navigating to Orders');
        buffer = '';
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearTimeout(bufferTimeout);
    };
  }, [router, userRole]);

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Navigate faster with keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {shortcuts.map((shortcut, index) => {
            // Skip role-specific shortcuts if not applicable
            if (shortcut.role && shortcut.role !== userRole) {
              return null;
            }

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-md">
                    <shortcut.icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{shortcut.action}</span>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {shortcut.key}
                </Badge>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>💡 Pro Tip:</strong> Press <Badge variant="secondary" className="mx-1 font-mono">?</Badge> anytime to view this list again.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
