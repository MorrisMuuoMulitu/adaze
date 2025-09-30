"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { cartService } from '@/lib/cartService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/navbar';
import { AuthModal } from '@/components/auth/auth-modal';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { orderService } from '@/lib/orderService';

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  }; // Joined product data
}

const checkoutSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  shippingAddress: z.string().min(1, { message: "Shipping address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  postalCode: z.string().min(1, { message: "Postal code is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  billingAddress: z.string().optional(),
  notes: z.string().optional(),
});

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');

  const handleAuthClick = (type: 'login' | 'register') => {
    setAuthModalType(type);
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
      shippingAddress: user?.user_metadata?.location || '',
      city: '',
      postalCode: '',
      country: 'Kenya',
      billingAddress: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      // Optionally redirect to home or show a message to log in
      return;
    }

    const fetchCartItems = async () => {
      setLoading(true);
      try {
        const items = await cartService.getCartItems(user.id);
        if (items.length === 0) {
          toast.info('Your cart is empty. Please add items before checking out.');
          router.push('/marketplace');
          return;
        }
        setCartItems(items);
        setError(null);
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError('Failed to load cart items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [user, router]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0);
  const shippingCost = 0; // Placeholder for shipping cost
  const total = subtotal + shippingCost;

  const onSubmit = async (values: z.infer<typeof checkoutSchema>) => {
    if (!user) {
      toast.error('You must be logged in to place an order.');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        buyer_id: user.id,
        title: `Order from ${user.user_metadata?.full_name || user.email}`,
        description: `Order containing ${cartItems.length} items.`,
        amount: total,
        shipping_address: `${values.shippingAddress}, ${values.city}, ${values.postalCode}, ${values.country}`,
        billing_address: values.billingAddress || `${values.shippingAddress}, ${values.city}, ${values.postalCode}, ${values.country}`,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_time: item.products.price,
        })),
      };

      const newOrder = await orderService.createOrder(orderData);
      
      // Clear the cart after successful order creation
      await cartService.clearCart(user.id);
      window.dispatchEvent(new CustomEvent('cartUpdated')); // Notify Navbar

      toast.success('Order placed successfully! Redirecting to payment...');
      router.push(`/payment?orderId=${newOrder.id}&amount=${total}`);
    } catch (err) {
      console.error('Error placing order:', err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar onAuthClick={handleAuthClick} />
        <main className="flex-grow flex items-center justify-center">
          <div>Loading cart for checkout...</div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar onAuthClick={handleAuthClick} />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={handleCloseAuthModal} 
          initialType={authModalType} 
          onSuccess={handleCloseAuthModal}
        />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Checkout</CardTitle>
              <CardDescription>Please log in to proceed with checkout.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ShoppingCartIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="mb-4">Log in to complete your purchase.</p>
              <Button onClick={() => handleAuthClick('login')}>Log In</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar onAuthClick={handleAuthClick} />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Error</CardTitle>
              <CardDescription>Failed to load your cart for checkout.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onAuthClick={handleAuthClick} />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleCloseAuthModal} 
        initialType={authModalType} 
        onSuccess={handleCloseAuthModal}
      />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Shipping Information */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-xl">Shipping Information</CardTitle>
                      <CardDescription>Enter your delivery details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john.doe@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+254712345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shippingAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipping Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Nairobi" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="00100" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Kenya">Kenya</SelectItem>
                                {/* Add more countries as needed */}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="e.g., Leave at the front desk" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Order Summary */}
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-xl">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center space-x-2">
                              <div className="w-10 h-10 flex-shrink-0">
                                {item.products.image_url ? (
                                  <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover rounded-md" />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <span>{item.products.name} x {item.quantity}</span>
                            </div>
                            <span>KSh {(item.products.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>KSh {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>KSh {shippingCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>KSh {total.toFixed(2)}</span>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full african-gradient text-white hover:opacity-90 h-12"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Proceed to Payment'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </form>
            </Form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}