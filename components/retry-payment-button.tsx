"use client";

import { useState } from 'react';
import { MpesaPaymentButton } from '@/components/mpesa-payment-button';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

interface RetryPaymentButtonProps {
  orderId: string;
  amount: number;
  orderStatus: string;
  paymentStatus: string;
  onPaymentSuccess?: () => void;
}

export function RetryPaymentButton({
  orderId,
  amount,
  orderStatus,
  paymentStatus,
  onPaymentSuccess,
}: RetryPaymentButtonProps) {
  const [showPayment, setShowPayment] = useState(false);
  const supabase = createClient();

  // Only show retry for pending payments
  if (paymentStatus === 'paid' || orderStatus === 'cancelled') {
    return null;
  }

  const handleRetryClick = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    // Update order status to confirmed
    try {
      await supabase
        .from('orders')
        .update({ 
          status: 'confirmed',
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      toast.success('Payment completed! Order confirmed.');
      onPaymentSuccess?.();
      setShowPayment(false);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  if (showPayment) {
    return (
      <div className="space-y-3">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800 font-medium">💳 Complete Payment</p>
          <p className="text-xs text-amber-600 mt-1">
            Complete payment for Order #{orderId.slice(0, 8)}
          </p>
        </div>
        
        <MpesaPaymentButton
          orderId={orderId}
          amount={amount}
          onSuccess={handlePaymentSuccess}
          onError={(error) => {
            toast.error('Payment failed', { description: error });
          }}
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPayment(false)}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRetryClick}
      className="flex items-center gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      Complete Payment
    </Button>
  );
}
