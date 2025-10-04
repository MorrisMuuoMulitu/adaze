import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * M-Pesa Callback Handler
 * 
 * This endpoint receives payment confirmations from Safaricom
 * Documentation: https://developer.safaricom.co.ke/Documentation
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('=== M-Pesa Callback START ===');
    console.log('Full callback body:', JSON.stringify(body, null, 2));

    const { Body } = body;
    
    if (!Body || !Body.stkCallback) {
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: 'Invalid callback data' },
        { status: 400 }
      );
    }

    const { stkCallback } = Body;
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    const supabase = await createClient();

    console.log('Processing callback - ResultCode:', ResultCode, 'ResultDesc:', ResultDesc);

    // ResultCode 0 = Success
    if (ResultCode === 0) {
      console.log('✅ Payment SUCCESSFUL');
      
      // Extract payment details from CallbackMetadata
      const metadata = CallbackMetadata?.Item || [];
      const getMetadataValue = (name: string) => {
        const item = metadata.find((i: any) => i.Name === name);
        return item?.Value;
      };

      const amount = getMetadataValue('Amount');
      const mpesaReceiptNumber = getMetadataValue('MpesaReceiptNumber');
      const transactionDate = getMetadataValue('TransactionDate');
      const phoneNumber = getMetadataValue('PhoneNumber');

      console.log('Payment details:', {
        CheckoutRequestID,
        mpesaReceiptNumber,
        amount,
        phoneNumber,
        transactionDate,
      });

      // Update transaction status
      const { error: updateError } = await supabase
        .from('mpesa_transactions')
        .update({
          status: 'completed',
          mpesa_receipt_number: mpesaReceiptNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('checkout_request_id', CheckoutRequestID);

      if (updateError) {
        console.error('Error updating transaction:', updateError);
        return NextResponse.json(
          { ResultCode: 1, ResultDesc: 'Database error' },
          { status: 500 }
        );
      }

      // Get the transaction to find the order ID
      const { data: transaction } = await supabase
        .from('mpesa_transactions')
        .select('order_id')
        .eq('checkout_request_id', CheckoutRequestID)
        .single();

      // Update order status to confirmed
      if (transaction?.order_id) {
        await supabase
          .from('orders')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            updated_at: new Date().toISOString(),
          })
          .eq('id', transaction.order_id);

        console.log('Order confirmed:', transaction.order_id);
      }

      console.log('=== M-Pesa Callback END (Success) ===');
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: 'Success',
      });
    } else {
      // Payment failed or cancelled
      console.log('❌ Payment FAILED');
      console.log('Failure reason:', ResultDesc);
      console.log('Failure code:', ResultCode);

      await supabase
        .from('mpesa_transactions')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('checkout_request_id', CheckoutRequestID);

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: 'Accepted',
      });
    }
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: 'Internal server error' },
      { status: 500 }
    );
  }
}

// M-Pesa also sends validation requests
export async function GET() {
  return NextResponse.json({ message: 'M-Pesa callback endpoint' });
}
