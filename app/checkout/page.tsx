"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/components/auth/auth-provider';
import { cartService } from '@/lib/cartService';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MpesaPaymentButton } from '@/components/mpesa-payment-button';
import { Package, ArrowLeft, MapPin, Phone, User, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/navbar';
import { AuthModal } from '@/components/auth/auth-modal';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product_name: string;
  product_price: number;
  product_image_url: string | null;
}

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Delivery details
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');

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
    if (!authLoading && !user) {
      toast.error('Identity verification required for checkout');
      router.push('/?auth=login');
      return;
    }

    if (user) {
      const fetchCartItems = async () => {
        try {
          const items = await cartService.getCartItems(user.id);
          if (items.length === 0) {
            toast.error('Manifest is empty');
            router.push('/cart');
            return;
          }
          setCartItems(items);
        } catch (error) {
          console.error('Error fetching cart:', error);
          toast.error('Failed to load transaction payload');
        } finally {
          setLoading(false);
        }
      };

      fetchCartItems();
    }
  }, [user, authLoading, router]);

  const total = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);

  const handleCreateOrder = async () => {
    if (!user) return;
    if (!deliveryAddress.trim() || !phoneNumber.trim()) {
      toast.error('Logistics coordinates incomplete');
      return;
    }

    setCreatingOrder(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: deliveryAddress,
          phoneNumber,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Synchronization failure');
      }

      const result = await res.json();

      if (result.orderId) {
        setOrderId(result.orderId);
        toast.success('Protocol established. Please finalize settlement.');
      } else {
        toast.success(`${result.orders.length} protocols established.`);
        router.push('/dashboard/buyer'); // Redirect to buyer dashboard
      }
      
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error('Critical failure: ' + error.message);
    } finally {
      setCreatingOrder(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      <Navbar onAuthClick={handleAuthClick} />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        initialType={authModalType}
        onSuccess={handleCloseAuthModal}
      />

      <main className="container mx-auto px-6 py-32 max-w-7xl">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col md:flex-row justify-between items-end border-b border-border/50 pb-12 mb-12 gap-8"
        >
          <div>
            <Button 
                variant="ghost" 
                size="sm" 
                className="mb-8 -ml-2 text-[9px] font-black tracking-widest uppercase text-muted-foreground hover:text-accent transition-colors"
                onClick={() => router.push('/cart')}
            >
                <ArrowLeft className="h-3 w-3 mr-2" /> Modify Manifest
            </Button>
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-4">
              Final Synchronization
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
              Secure <span className="text-muted-foreground/30 italic">Protocol.</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-black tracking-[0.2em] uppercase text-muted-foreground/40">
            <ShieldCheck className="h-4 w-4 text-accent" /> Encrypted Transaction Channel
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* Logistics & Inventory */}
          <div className="lg:col-span-8 space-y-16">
            <section className="space-y-10">
                <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-accent" />
                    <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">Logistics Coordinates</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Label className="text-[9px] font-black tracking-widest uppercase opacity-50">Operational Number</Label>
                        <Input 
                            value={phoneNumber} 
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+254 XXX XXX XXX"
                            className="h-14 rounded-none border-border/50 bg-muted/5 font-mono text-xs tracking-widest uppercase focus:border-accent transition-all"
                            disabled={!!orderId}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-[9px] font-black tracking-widest uppercase opacity-50">Delivery Terminal (Full Address)</Label>
                    <Textarea 
                        value={deliveryAddress} 
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="SPECIFY GLOBAL COORDINATES..."
                        className="min-h-[120px] rounded-none border-border/50 bg-muted/5 font-mono text-xs tracking-widest uppercase focus:border-accent transition-all leading-relaxed"
                        disabled={!!orderId}
                    />
                </div>

                <div className="space-y-4">
                    <Label className="text-[9px] font-black tracking-widest uppercase opacity-50">Protocol Instructions (Optional)</Label>
                    <Textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="SPECIAL HANDLING PROTOCOLS..."
                        className="min-h-[80px] rounded-none border-border/50 bg-muted/5 font-mono text-xs tracking-widest uppercase focus:border-accent transition-all"
                        disabled={!!orderId}
                    />
                </div>
            </section>

            <section className="space-y-10">
                <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-accent" />
                    <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">Manifest Payload</h3>
                </div>
                
                <div className="border border-border/50 divide-y divide-border/30">
                    {cartItems.map((item) => (
                        <div key={item.id} className="p-8 flex items-center justify-between group bg-background transition-colors hover:bg-muted/5">
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-20 bg-muted/20 border border-border/50 overflow-hidden relative">
                                    {item.product_image_url && <Image src={item.product_image_url} alt={item.product_name} fill className="object-cover" />}
                                </div>
                                <div>
                                    <div className="text-[11px] font-black uppercase tracking-tight">{item.product_name}</div>
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2">UNIT: KSH {item.product_price.toLocaleString()} × {item.quantity}</div>
                                </div>
                            </div>
                            <div className="text-sm font-black font-mono tracking-tighter">KSH {(item.product_price * item.quantity).toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            </section>
          </div>

          {/* Settlement Control */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
                <div className="border border-border/50 bg-background p-10 space-y-10">
                    <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent">Financial Summary</div>
                    
                    <div className="space-y-6">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-40">
                            <span>Subtotal Manifest</span>
                            <span>KSH {total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-green-500/80">
                            <span>Global Logistics</span>
                            <span>COMPLIMENTARY</span>
                        </div>
                        <div className="pt-6 border-t border-border/30 flex justify-between items-end">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Total Value</span>
                            <span className="text-3xl font-black tracking-tighter">KSH {total.toLocaleString()}</span>
                        </div>
                    </div>

                    {!orderId ? (
                        <Button
                            className="w-full h-16 btn-premium rounded-none text-[10px] font-black tracking-[0.4em] uppercase flex items-center justify-center gap-4 group"
                            onClick={handleCreateOrder}
                            disabled={creatingOrder || !deliveryAddress || !phoneNumber}
                        >
                            {creatingOrder ? 'Synchronizing...' : (
                                <>
                                    Establish Protocol
                                    <Sparkles className="h-4 w-4 text-accent transition-transform group-hover:scale-125" />
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                             <div className="p-6 bg-accent/5 border border-accent/20 text-center space-y-2">
                                <div className="text-xs font-black uppercase tracking-widest text-accent">Protocol Success</div>
                                <div className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">Manifest #{orderId.slice(0, 8)} ready for settlement</div>
                             </div>

                             <MpesaPaymentButton
                                orderId={orderId}
                                amount={total}
                                onSuccess={() => {
                                    toast.success('Funds synchronized successfully');
                                    router.push(`/dashboard/buyer`);
                                }}
                                onError={(error) => toast.error('Settlement interrupted', { description: error })}
                            />
                            
                            <div className="flex items-center justify-center gap-2 opacity-30">
                                <CreditCard className="h-3 w-3" />
                                <span className="text-[8px] font-bold uppercase tracking-widest">Global Secure Settlement Access</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-muted/5 border border-border/50">
                    <p className="text-[9px] font-medium leading-relaxed uppercase tracking-widest opacity-40">
                        By establishing this protocol, you agree to the Adaze Collective terms of service and autonomous logistics synchronization.
                    </p>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
