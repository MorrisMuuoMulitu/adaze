'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { cartService } from '@/lib/cartService';
import { useAuth } from '@/components/auth/auth-provider';
import { toast } from 'sonner';
import { AuthModal } from '@/components/auth/auth-modal';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
}

export function AddToCartButton({ productId, productName }: AddToCartButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
        try {
          await cartService.addToCart(user.id, productId, 1);
          toast.success(`${productName} added to cart!`, {
            action: {
              label: 'View Cart',
              onClick: () => window.location.href = '/cart'
            }
          });
          // Notify Navbar to refresh cart count
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        }
     catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleAddToCart}
        disabled={loading}
        className="w-full bg-black text-white hover:bg-gray-800 transition-colors rounded-lg"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <ShoppingCart className="w-4 h-4 mr-2" />
        )}
        Add to Cart
      </Button>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          handleAddToCart();
        }}
      />
    </>
  );
}
