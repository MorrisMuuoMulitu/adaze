import { NextRequest, NextResponse } from 'next/server';
import { mpesaService } from '@/lib/mpesa';
import { createClient } from '@/lib/supabase/server';

/**
 * Query M-Pesa Payment Status
 * 
 * GET /api/mpesa/status?checkoutRequestId=xxx
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutRequestId = searchParams.get('checkoutRequestId');

    if (!checkoutRequestId) {
      return NextResponse.json(
        { error: 'Missing checkoutRequestId' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // First check our database
    const { data: transaction } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .eq('checkout_request_id', checkoutRequestId)
      .single();

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // If already completed or failed, return from database
    if (transaction.status === 'completed' || transaction.status === 'failed') {
      return NextResponse.json({
        status: transaction.status,
        mpesaReceiptNumber: transaction.mpesa_receipt_number,
        amount: transaction.amount,
      });
    }

    // Query M-Pesa API for pending transactions
    try {
      const status = await mpesaService.queryPaymentStatus(checkoutRequestId);
      
      // Update our database based on M-Pesa response
      if (status.ResultCode === '0') {
        await mpesaService.updateTransactionStatus(
          checkoutRequestId,
          'completed',
          status.MpesaReceiptNumber
        );

        return NextResponse.json({
          status: 'completed',
          mpesaReceiptNumber: status.MpesaReceiptNumber,
          amount: status.Amount,
        });
      } else {
        await mpesaService.updateTransactionStatus(checkoutRequestId, 'failed');
        
        return NextResponse.json({
          status: 'failed',
          message: status.ResultDesc,
        });
      }
    } catch (apiError) {
      console.error('M-Pesa status query error:', apiError);
      
      // Return database status if API call fails
      return NextResponse.json({
        status: transaction.status,
        message: 'Payment is being processed',
      });
    }
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check status' },
      { status: 500 }
    );
  }
}
