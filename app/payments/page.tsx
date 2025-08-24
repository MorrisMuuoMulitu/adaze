
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Smartphone, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { clearCart } from '@/lib/cart';

interface CheckoutData {
  cartItems: any[]; // Define a more specific type if needed
  subtotal: number;
  shippingCost: number;
  total: number;
}

const paymentSchema = z.object({
  paymentMethod: z.enum(['card', 'mpesa', 'paypal']),
  nameOnCard: z.string().optional(),
  mpesaNumber: z.string().optional(),
  paypalEmail: z.string().email().optional(),
});

export default function PaymentsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('checkoutData');
    if (storedData) {
      setCheckoutData(JSON.parse(storedData));
    } else {
      toast.error('No checkout data found. Please go back to your cart.');
      router.push('/cart');
    }
  }, [router]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'card',
    },
  });

  const paymentMethod = watch('paymentMethod');

  const onSubmit = async (data: z.infer<typeof paymentSchema>) => {
    setIsLoading(true);
    toast.info('Processing payment...');

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, ...checkoutData }), // Send checkout data with payment details
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Payment successful!', { description: result.message });
        clearCart(); // Clear cart after successful payment
        localStorage.removeItem('checkoutData'); // Clear checkout data
        router.push('/order-confirmation'); // Redirect to a confirmation page
      } else {
        toast.error('Payment failed', { description: result.error });
      }
    } catch (error) {
      toast.error('An error occurred', { description: 'Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading checkout data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4"
      >
        <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Purchase</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkoutData.cartItems.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center">
                <span className="text-muted-foreground">{item.name} (x{item.quantity})</span>
                <span>KSh {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>KSh {checkoutData.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>KSh {checkoutData.shippingCost.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>KSh {checkoutData.total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Secure Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <RadioGroup defaultValue="card" className="grid grid-cols-3 gap-4" onValueChange={(value) => register('paymentMethod').onChange({ target: { value } })}>
                <div>
                  <RadioGroupItem value="card" id="card" className="peer sr-only" />
                  <Label
                    htmlFor="card"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <CreditCard className="mb-3 h-6 w-6" />
                    Card
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="mpesa" id="mpesa" className="peer sr-only" />
                  <Label
                    htmlFor="mpesa"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Smartphone className="mb-3 h-6 w-6" />
                    M-Pesa
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="paypal" id="paypal" className="peer sr-only" />
                  <Label
                    htmlFor="paypal"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <DollarSign className="mb-3 h-6 w-6" />
                    PayPal
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div id="stripe-card-element">{/* Stripe element will be mounted here */}</div>
                  <Input placeholder="Name on card" {...register('nameOnCard')} />
                  {errors.nameOnCard && <p className="text-red-500 text-sm">{errors.nameOnCard.message}</p>}
                </div>
              )}

              {paymentMethod === 'mpesa' && (
                <div className="space-y-4">
                  <Input placeholder="M-Pesa number (e.g. 07...)" {...register('mpesaNumber')} />
                  {errors.mpesaNumber && <p className="text-red-500 text-sm">{errors.mpesaNumber.message}</p>}
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="space-y-4">
                  <Input placeholder="PayPal email" {...register('paypalEmail')} />
                  {errors.paypalEmail && <p className="text-red-500 text-sm">{errors.paypalEmail.message}</p>}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Pay Now'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
