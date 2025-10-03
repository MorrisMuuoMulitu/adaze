import { NextRequest, NextResponse } from 'next/server';
import { mpesaService } from '@/lib/mpesa';
import { createClient } from '@/lib/supabase/server';

/**
 * Initiate M-Pesa STK Push Payment
 * 
 * POST /api/mpesa/initiate
 * Body: { orderId, phoneNumber, amount }
 */

export async function POST(request: NextRequest) {
  try {
    const { orderId, phoneNumber, amount } = await request.json();

    if (!orderId || !phoneNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, buyer_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is already paid
    if (order.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 400 }
      );
    }

    // Initiate STK Push
    const response = await mpesaService.initiateSTKPush({
      phoneNumber,
      amount,
      accountReference: `Order-${orderId.slice(0, 8)}`,
      transactionDesc: `ADAZE Order Payment`,
    });

    // Save transaction to database
    if (response.ResponseCode === '0') {
      await mpesaService.saveTransaction({
        orderId,
        userId: order.buyer_id,
        amount,
        phoneNumber,
        checkoutRequestId: response.CheckoutRequestID,
        merchantRequestId: response.MerchantRequestID,
        status: 'pending',
      });

      return NextResponse.json({
        success: true,
        message: response.CustomerMessage,
        checkoutRequestId: response.CheckoutRequestID,
      });
    } else {
      return NextResponse.json(
        { 
          error: response.ResponseDescription || 'Payment initiation failed',
          code: response.ResponseCode 
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('M-Pesa initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
