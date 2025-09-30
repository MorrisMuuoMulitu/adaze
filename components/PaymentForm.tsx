'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { paymentService, PaymentResult } from '@/lib/paymentService';
import { toast } from 'sonner';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';

interface PaymentFormProps {
  orderId: string;
  amount: number;
  onSuccess: (result: PaymentResult) => void;
}

export default function PaymentForm({ orderId, amount, onSuccess }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, you would:
      // 1. Use a payment provider's front-end library (like Stripe Elements) to securely collect card details
      // 2. Create a payment method on the client side
      // 3. Send the payment method to your backend
      // 4. Process the payment securely on the backend
      
      // For this demo, I'll simulate the process
      const result = await paymentService.createPaymentIntent({
        orderId,
        amount,
        currency: 'usd',
        description: `Payment for order #${orderId}`
      });

      if (result.success) {
        // Simulate payment confirmation
        const confirmResult = await paymentService.confirmPayment(result.paymentIntentId!);
        
        if (confirmResult.success) {
          setPaymentComplete(true);
          toast.success('Payment successful!');
          onSuccess(confirmResult);
        } else {
          toast.error(confirmResult.error || 'Payment failed');
        }
      } else {
        toast.error(result.error || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An error occurred during payment processing');
    } finally {
      setLoading(false);
    }
  };

  if (paymentComplete) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-xl mt-4">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment of ${amount} for order #{orderId} has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            You will receive a confirmation email shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription>
          Complete your payment for order #{orderId} - Total: <strong>${amount}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Cardholder Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                required
                maxLength={19}
              />
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                required
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
                required
                maxLength={4}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing...' : `Pay $${amount}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}