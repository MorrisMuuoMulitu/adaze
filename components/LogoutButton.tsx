"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  className?: string;
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'default',
  showIcon = true,
  className = '' 
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Show success message
      toast.success('Logged out successfully', {
        description: 'Come back soon!'
      });
      
      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to homepage
      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to logout', {
        description: error.message || 'Please try again'
      });
      setIsLoggingOut(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={className}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              {showIcon && <LogOut className="h-4 w-4 mr-2" />}
              Logout
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be redirected to the homepage. You can log back in anytime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Logging out...
              </>
            ) : (
              'Yes, logout'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
