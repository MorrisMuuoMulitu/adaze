import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cartService } from '@/lib/cartService';
import { notificationService } from '@/lib/notificationService';
import { orderService } from '@/lib/orderService';
import { MpesaStatus, OrderStatus } from '@prisma/client';

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
    
    const { Body } = body;
    
    if (!Body || !Body.stkCallback) {
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: 'Invalid callback data' },
        { status: 400 }
      );
    }

    const { stkCallback } = Body;
    const {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    console.log('Processing callback - ResultCode:', ResultCode, 'ResultDesc:', ResultDesc);

    // ResultCode 0 = Success
    if (ResultCode === 0) {
      console.log('✅ Payment SUCCESSFUL');
      
      const metadata = CallbackMetadata?.Item || [];
      const getMetadataValue = (name: string) => {
        const item = metadata.find((i: any) => i.Name === name);
        return item?.Value;
      };

      const mpesaReceiptNumber = getMetadataValue('MpesaReceiptNumber');

      // Update transaction status
      const transaction = await prisma.mpesaTransaction.update({
        where: { checkoutRequestId: CheckoutRequestID },
        data: {
          status: MpesaStatus.COMPLETED,
          mpesaReceiptNumber,
        },
      });

      // Update order status to confirmed
      if (transaction.orderId) {
        const order = await prisma.order.findUnique({
          where: { id: transaction.orderId },
        });

        if (order) {
          // 1. Mark as confirmed
          await prisma.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.CONFIRMED },
          });

          // 2. Clear user's cart
          await cartService.clearCart(order.buyerId);

          // 3. Attempt Auto-Assignment of Transporter
          try {
            await orderService.autoAssignTransporter(order.id);
          } catch (assignError) {
            console.error('Error during transporter auto-assignment:', assignError);
          }

          // 4. Notify Buyer & Trader
          await notificationService.createNotification({
            user_id: order.buyerId,
            title: 'Order Confirmed',
            message: `Your payment was successful. Order "${order.title}" is now being processed.`,
            type: 'success',
            related_order_id: order.id
          });

          if (order.traderId) {
            await notificationService.createNotification({
              user_id: order.traderId,
              title: 'New Paid Order',
              message: `Payment received for "${order.title}". Please prepare the items for delivery.`,
              type: 'info',
              related_order_id: order.id
            });
          }
        }
      }

      console.log('=== M-Pesa Callback END (Success) ===');
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
    } else {
      // Payment failed or cancelled
      await prisma.mpesaTransaction.update({
        where: { checkoutRequestId: CheckoutRequestID },
        data: { status: MpesaStatus.FAILED },
      });

      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
  } catch (error: any) {
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
