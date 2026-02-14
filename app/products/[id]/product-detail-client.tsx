'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { productService, Product } from '@/lib/productService';
import { cartService } from '@/lib/cartService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter, useParams } from 'next/navigation';
import { Package, MapPin, DollarSign, ShoppingCart, Star, Heart, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { reviewService } from '@/lib/reviewService';
import { createClient } from '@/lib/supabase/client';
import { wishlistService } from '@/lib/wishlistService';
import { ProductReviews } from '@/components/reviews/product-reviews';

import { Navbar } from '@/components/layout/navbar';
import { AuthModal } from '@/components/auth/auth-modal';

export default function ProductDetailClient({ product: initialProduct }: { product: Product }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const productId = Array.isArray(id) ? id[0] : id;

  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [traderInfo, setTraderInfo] = useState<{ name: string; averageRating: number | null } | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');

  const handleAuthClick = (type: 'login' | 'register') => {
    setAuthModalType(type);
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  useEffect(() => {
    if (!product) return;
    // ... existing code ...
    const fetchExtraData = async () => {
      // Fetch trader info
      const supabase = createClient();
      const { data: traderProfile, error: traderError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', product.trader_id)
        .single();

      if (traderError) {
        console.error('Error fetching trader profile:', traderError);
      } else if (traderProfile) {
        const avgRating = await reviewService.getAverageRating(product.trader_id);
        setTraderInfo({ name: traderProfile.full_name, averageRating: avgRating });
      }

      // Check wishlist status
      if (user) {
        const inWishlist = await wishlistService.isInWishlist(user.id, product.id);
        setIsWishlisted(inWishlist);
      }
    };

    fetchExtraData();
  }, [product, user]);

  useEffect(() => {
    if (!user) return;

    const fetchCartCount = async () => {
      try {
        const count = await cartService.getCartCount(user.id);
        setCartCount(count);
      } catch (error) {
        console.error('Error fetching cart count:', error);
      }
    };

    fetchCartCount();
  }, [user]);

  const addToCart = async () => {
    if (!user) {
      handleAuthClick('login');
      return;
    }

    if (!product) return;

    try {
      await cartService.addToCart(user.id, product.id, quantity);
      toast.success(`${quantity} ${product.name} added to cart!`);

      // Update cart count
      const count = await cartService.getCartCount(user.id);
      setCartCount(count);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user || !product) {
      handleAuthClick('login');
      return;
    }
    // ... existing code ...
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(user.id, product.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist!');
      } else {
        await wishlistService.addToWishlist(user.id, product.id);
        setIsWishlisted(true);
        toast.success('Added to wishlist!');
      }
      // Notify Navbar to update wishlist count
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist.');
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-white pb-32">
      {/* Scanline Effect */}
      <div className="fixed inset-0 bg-scanline opacity-[0.03] pointer-events-none z-50" />

      <Navbar onAuthClick={handleAuthClick} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        initialType={authModalType}
        onSuccess={handleCloseAuthModal}
      />

      <main className="container mx-auto px-6 pt-32 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => router.back()}
            className="group mb-12 flex items-center gap-3 text-[10px] font-black tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
            Return to Collective
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Visual Documentation (5 cols) */}
            <div className="lg:col-span-6 space-y-12">
              <div className="aspect-[3/4] bg-muted relative overflow-hidden ring-1 ring-border/50">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-24 w-24 text-accent/20" />
                  </div>
                )}

                {/* Status Overlays */}
                <div className="absolute top-8 left-8 flex flex-col gap-3">
                  <div className="bg-background/90 backdrop-blur-md px-4 py-2 text-[10px] font-black tracking-widest uppercase border border-border/50">
                    {product.category}
                  </div>
                  {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                    <div className="bg-accent px-4 py-2 text-[10px] font-black tracking-widest uppercase text-white animate-pulse">
                      Low Stock: {product.stock_quantity}
                    </div>
                  )}
                </div>
              </div>

              {/* Interaction Bar */}
              <div className="flex items-center gap-4 py-6 border-y border-border/20">
                <Button
                  variant="outline"
                  className="flex-1 rounded-none border-border/50 text-[10px] font-black tracking-widest uppercase h-14"
                  onClick={handleToggleWishlist}
                >
                  <Heart className={`h-4 w-4 mr-3 ${isWishlisted ? 'fill-accent text-accent' : ''}`} />
                  {isWishlisted ? 'Archived' : 'Add to Wishlist'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-none border-border/50 text-[10px] font-black tracking-widest uppercase h-14"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Manifest link copied');
                  }}
                >
                  Share Manifest
                </Button>
              </div>
            </div>

            {/* Technical Specifications (7 cols) */}
            <div className="lg:col-span-6 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-accent">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={`h-3 w-3 ${i <= Math.round(product.rating) ? 'fill-current' : 'opacity-20'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Verified Piece</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
                  {product.name}
                </h1>

                <div className="text-4xl font-black tracking-tighter text-accent font-mono mt-8">
                  KSH {product.price.toLocaleString()}
                </div>
              </div>

              <div className="p-8 bg-muted/5 border border-border/20 space-y-4">
                <div className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">Archive Description</div>
                <p className="text-lg text-muted-foreground/80 font-medium tracking-tight leading-relaxed uppercase">
                  {product.description}
                </p>
              </div>

              {/* Source Verification */}
              <div className="border border-accent/30 p-8 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 -rotate-45 translate-x-12 -translate-y-12" />
                <div className="space-y-1">
                  <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Archive Source</div>
                  <div className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                    {traderInfo?.name || 'Verifying...'}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-accent/20">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase opacity-40">Source Rep</span>
                    <span className="text-[11px] font-black uppercase text-accent">{traderInfo?.averageRating?.toFixed(1) || 'N/A'} Rating</span>
                  </div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-[10px] font-black tracking-widest uppercase hover:text-accent"
                    onClick={() => router.push(`/marketplace?trader=${product.trader_id}`)}
                  >
                    View Repository →
                  </Button>
                </div>
              </div>

              {/* Acquisition Tools */}
              <div className="space-y-8 pt-12 border-t border-border/20">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Quantity Minimalist */}
                  <div className="flex items-center border border-border/50 h-14 w-full sm:w-48">
                    <button
                      onClick={decrementQuantity}
                      className="flex-1 h-full hover:bg-muted/50 transition-colors text-lg font-black disabled:opacity-20"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <div className="w-16 h-full flex items-center justify-center font-mono font-black border-x border-border/50">
                      {quantity.toString().padStart(2, '0')}
                    </div>
                    <button
                      onClick={incrementQuantity}
                      className="flex-1 h-full hover:bg-muted/50 transition-colors text-lg font-black disabled:opacity-20"
                      disabled={quantity >= product.stock_quantity}
                    >
                      +
                    </button>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex justify-between text-[10px] font-black tracking-widest uppercase opacity-40">
                      <span>Total Acquisition</span>
                      <span className="font-mono text-accent">KSH {(product.price * quantity).toLocaleString()}</span>
                    </div>
                    <div className="h-0.5 bg-border/20 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        className="h-full bg-accent"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    className="h-16 rounded-none border-none bg-foreground text-background hover:bg-foreground/90 text-[11px] font-black tracking-[0.2em] uppercase transition-all"
                    onClick={addToCart}
                    disabled={product.stock_quantity <= 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-3" />
                    Place into Cart
                  </Button>
                  <Button
                    className="btn-premium h-16 rounded-none text-[11px] font-black tracking-[0.2em] uppercase"
                    onClick={() => {
                      addToCart();
                      router.push('/cart');
                    }}
                    disabled={product.stock_quantity <= 0}
                  >
                    Secure Acquisition
                  </Button>
                </div>
              </div>

              {/* Logistics Manifest */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/50 border border-border/50">
                <div className="bg-background p-6 space-y-2">
                  <div className="text-[9px] font-black tracking-[0.2em] uppercase opacity-40 flex items-center gap-2">
                    <Truck className="w-3 h-3 text-accent" />
                    Logistics
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-tight">Express Regional Dispatch</p>
                </div>
                <div className="bg-background p-6 space-y-2">
                  <div className="text-[9px] font-black tracking-[0.2em] uppercase opacity-40 flex items-center gap-2">
                    <Package className="w-3 h-3 text-accent" />
                    Authentication
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-tight">Certified Pre-Owned Manifest</p>
                </div>
              </div>
            </div>
          </div>

          {/* Peer Reviews Section */}
          <div className="mt-32 pt-32 border-t border-border/50">
            <div className="flex items-center justify-between mb-16">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">Peer <span className="text-muted-foreground/30 not-italic">Dialogue.</span></h2>
              <div className="h-px flex-grow mx-12 bg-border/20" />
            </div>
            <ProductReviews
              productId={product.id}
              traderId={product.trader_id}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
