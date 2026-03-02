import { NextRequest, NextResponse } from 'next/server';
import { mpesaService } from '@/lib/mpesa';
import { prisma } from '@/lib/prisma';
import { orderService } from '@/lib/orderService';
import { cartService } from '@/lib/cartService';
import { notificationService } from '@/lib/notificationService';
import { MpesaStatus, OrderStatus } from '@prisma/client';

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

    // First check our database via Prisma
    const transaction = await prisma.mpesaTransaction.findUnique({
      where: { checkoutRequestId },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // If already completed or failed, return from database
    if (transaction.status === MpesaStatus.COMPLETED || transaction.status === MpesaStatus.FAILED) {
      return NextResponse.json({
        status: transaction.status.toLowerCase(),
        mpesaReceiptNumber: transaction.mpesaReceiptNumber,
        amount: Number(transaction.amount),
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

        // Also update the order status
        if (transaction.orderId) {
          const order = await prisma.order.findUnique({
            where: { id: transaction.orderId },
          });

          if (order) {
            // 1. Mark order as confirmed (since it's paid)
            await prisma.order.update({
              where: { id: transaction.orderId },
              data: {
                status: OrderStatus.CONFIRMED,
              },
            });
            
            // 2. Clear cart
            await cartService.clearCart(order.buyerId);

            // 3. Attempt Auto-Assignment of Transporter using our service
            try {
              await orderService.autoAssignTransporter(order.id);
            } catch (err) {
              console.error('Auto-assign failed in status poll:', err);
            }

            // 4. Notifications
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

            console.log(`✅ Order ${transaction.orderId} confirmed and processed via status poll`);
          }
        }

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
      return NextResponse.json({
        status: transaction.status.toLowerCase(),
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
