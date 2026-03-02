import { NextRequest, NextResponse } from 'next/server';
import { mpesaService } from '@/lib/mpesa';
import { prisma } from '@/lib/prisma';

/**
 * Initiate M-Pesa STK Push Payment
 * 
 * POST /api/mpesa/initiate
 * Body: { orderId, phoneNumber, amount }
 */

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { orderId, phoneNumber, amount } = await request.json();

    if (!orderId || !phoneNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get order details from Prisma
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is already paid (status check)
    // In our schema, status is OrderStatus enum (PENDING, CONFIRMED, etc.)
    // We might need a paymentStatus field or just check if it's already being processed
    // For now, let's just proceed or check against a custom logic if we have one.

    // Initiate STK Push
    const response = await mpesaService.initiateSTKPush({
      phoneNumber,
      amount,
      accountReference: `Order-${orderId.slice(0, 8)}`,
      transactionDesc: `ADAZE Order Payment`,
    });

    // Save transaction to database via mpesaService (which now uses Prisma)
    if (response.ResponseCode === '0') {
      await mpesaService.saveTransaction({
        orderId,
        userId: order.buyerId,
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
