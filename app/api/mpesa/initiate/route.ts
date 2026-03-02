import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { mpesaService } from '@/lib/mpesa/service';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/mpesa/initiate
 * Body: { phone, orderId }
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, orderId } = await request.json();

    // 1. Validation
    if (!phone) return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });

    // 2. Fetch Order from DB (Never trust amount from client)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized access to this order' }, { status: 403 });
    }

    // 3. Initiate STK Push
    const result = await mpesaService.initiateSTKPush({
      phoneNumber: phone,
      amount: Number(order.amount),
      orderId: order.id,
      description: `Payment for ${order.title}`,
    });

    // 4. Save Transaction to DB
    await prisma.mpesaTransaction.create({
      data: {
        orderId: order.id,
        userId: session.user.id,
        amount: order.amount,
        phoneNumber: phone,
        checkoutRequestId: result.CheckoutRequestID,
        merchantRequestId: result.MerchantRequestID,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: result.CustomerMessage,
      checkoutRequestId: result.CheckoutRequestID,
    });

  } catch (error: any) {
    console.error('[API/Mpesa/Initiate] Error:', error.message);
    return NextResponse.json({ 
      error: error.message || 'Failed to initiate payment' 
    }, { status: 500 });
  }
}
