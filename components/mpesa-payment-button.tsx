"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Loader2, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import Image from 'next/image';

interface MpesaPaymentButtonProps {
  orderId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function MpesaPaymentButton({
  orderId,
  amount,
  onSuccess,
  onError,
}: MpesaPaymentButtonProps) {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed' | null>(null);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as: 0712 345 678 or 254712 345 678
    if (digits.startsWith('254')) {
      return digits.slice(0, 12);
    } else if (digits.startsWith('0') || digits.startsWith('7') || digits.startsWith('1')) {
      return digits.slice(0, 10);
    }
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const initiatePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setPaymentStatus('pending');

    try {
      const response = await fetch('/api/mpesa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          phoneNumber,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      setCheckoutRequestId(data.checkoutRequestId);
      toast.success('STK Push sent!', {
        description: 'Check your phone and enter M-Pesa PIN',
      });

      // Start polling for payment status
      startPolling(data.checkoutRequestId);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed', {
        description: error.message,
      });
      setPaymentStatus('failed');
      setLoading(false);
      onError?.(error.message);
    }
  };

  const startPolling = (requestId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // Poll for 2 minutes (60 * 2 seconds) - increased for sandbox

    const pollInterval = setInterval(async () => {
      attempts++;
      console.log(`Polling attempt ${attempts}/${maxAttempts} for ${requestId}`);

      try {
        const response = await fetch(`/api/mpesa/status?checkoutRequestId=${requestId}`);
        const data = await response.json();
        console.log('Status response:', data);

        if (data.status === 'completed') {
          clearInterval(pollInterval);
          setPaymentStatus('completed');
          setLoading(false);
          toast.success('Payment successful!', {
            description: `M-Pesa Receipt: ${data.mpesaReceiptNumber}`,
          });
          onSuccess?.();
          setTimeout(() => setOpen(false), 2000);
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          setPaymentStatus('failed');
          setLoading(false);
          toast.error('Payment failed', {
            description: data.message || 'Please try again',
          });
          onError?.('Payment failed');
        }

        // Stop polling after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setLoading(false);
          setPaymentStatus('failed');
          toast.error('Payment timeout', {
            description: 'Payment took too long. Check your orders page to see if it completed.',
          });
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 2000); // Poll every 2 seconds
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setPhoneNumber('');
      setCheckoutRequestId(null);
      setPaymentStatus(null);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        size="lg"
      >
        <Phone className="h-5 w-5 mr-2" />
        Pay with M-Pesa
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>M-Pesa Payment</DialogTitle>
            <DialogDescription>
              Enter your M-Pesa phone number to pay KSh {amount.toLocaleString()}.
              A prompt will be sent to your phone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {paymentStatus === null && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">M-Pesa Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0712 345 678"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the M-Pesa number to receive the payment prompt
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">How it works:</p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Enter your M-Pesa registered phone number</li>
                    <li>Click &quot;Send Payment Request&quot;</li>
                    <li>Check your phone for the STK Push prompt</li>
                    <li>Enter your M-Pesa PIN to complete payment</li>
                  </ol>
                </div>
              </>
            )}

            {paymentStatus === 'pending' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-16 w-16 text-green-600 animate-spin" />
                <div className="text-center space-y-2">
                  <p className="font-medium">Check your phone</p>
                  <p className="text-sm text-muted-foreground">
                    Enter your M-Pesa PIN to complete payment
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Waiting for confirmation...
                  </p>
                </div>
              </div>
            )}

            {paymentStatus === 'completed' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium text-green-600">Payment Successful!</p>
                  <p className="text-sm text-muted-foreground">
                    Your order has been confirmed
                  </p>
                </div>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium text-red-600">Payment Failed</p>
                  <p className="text-sm text-muted-foreground">
                    Please try again or contact support
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {paymentStatus === null && (
              <Button
                onClick={initiatePayment}
                disabled={loading || !phoneNumber}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Payment Request'
                )}
              </Button>
            )}
            {paymentStatus === 'failed' && (
              <Button
                onClick={() => {
                  setPaymentStatus(null);
                  setCheckoutRequestId(null);
                }}
                className="w-full"
              >
                Try Again
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
