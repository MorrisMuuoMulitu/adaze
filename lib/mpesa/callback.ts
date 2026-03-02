/**
 * M-Pesa Callback Processor
 */

import { prisma } from '@/lib/prisma';
import { orderService } from '@/lib/orderService';
import { cartService } from '@/lib/cartService';
import { notificationService } from '@/lib/notificationService';
import { MpesaStatus, OrderStatus } from '@prisma/client';
import { getMpesaError } from './errors';

export interface CallbackPayload {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: any;
        }>;
      };
    };
  };
}

/**
 * Processes the M-Pesa STK Push callback asynchronously
 */
export async function processMpesaCallback(payload: CallbackPayload) {
  const { stkCallback } = payload.Body;
  const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

  console.log(`[MpesaCallback] Processing callback for ${CheckoutRequestID}, ResultCode: ${ResultCode}`);

  try {
    // 1. Find the transaction in our database
    const transaction = await prisma.mpesaTransaction.findUnique({
      where: { checkoutRequestId: CheckoutRequestID },
      include: { order: true }
    });

    if (!transaction) {
      console.error(`[MpesaCallback] Transaction not found for CheckoutRequestID: ${CheckoutRequestID}`);
      return;
    }

    // 2. Idempotency: Skip if already processed
    if (transaction.status === MpesaStatus.COMPLETED || transaction.status === MpesaStatus.FAILED) {
      console.log(`[MpesaCallback] Transaction ${CheckoutRequestID} already processed. Skipping.`);
      return;
    }

    // 3. Extract Metadata on success
    let mpesaReceiptNumber = '';
    let amount = 0;
    let transactionDate = '';
    let phoneNumber = '';

    if (ResultCode === 0 && CallbackMetadata) {
      CallbackMetadata.Item.forEach(item => {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value;
        if (item.Name === 'Amount') amount = item.Value;
        if (item.Name === 'TransactionDate') transactionDate = String(item.Value);
        if (item.Name === 'PhoneNumber') phoneNumber = String(item.Value);
      });
    }

    // 4. Update Transaction Status
    const status = ResultCode === 0 ? MpesaStatus.COMPLETED : MpesaStatus.FAILED;
    
    await prisma.mpesaTransaction.update({
      where: { checkoutRequestId: CheckoutRequestID },
      data: {
        status,
        mpesaReceiptNumber: mpesaReceiptNumber || null,
        // We could also update the amount if it differs, but better to trust our DB
      }
    });

    // 5. Handle Business Logic
    if (ResultCode === 0) {
      console.log(`[MpesaCallback] Payment SUCCESS for Order ${transaction.orderId}`);

      // Update Order Status
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: { status: OrderStatus.CONFIRMED }
      });

      // Clear Cart for the buyer
      await cartService.clearCart(transaction.userId);

      // Auto-assign transporter
      try {
        await orderService.autoAssignTransporter(transaction.orderId);
      } catch (err) {
        console.error('[MpesaCallback] Auto-assign failed:', err);
      }

      // Send Notifications
      await notificationService.createNotification({
        user_id: transaction.userId,
        title: 'Payment Successful',
        message: `Your payment of KES ${transaction.amount} for Order #${transaction.orderId.slice(-6)} was received.`,
        type: 'success',
        related_order_id: transaction.orderId
      });

      if (transaction.order.traderId) {
        await notificationService.createNotification({
          user_id: transaction.order.traderId,
          title: 'New Paid Order',
          message: `Payment received for Order #${transaction.orderId.slice(-6)}. Please prepare the items.`,
          type: 'info',
          related_order_id: transaction.orderId
        });
      }
    } else {
      const error = getMpesaError(ResultCode);
      console.log(`[MpesaCallback] Payment FAILED: ${error.logMessage}`);

      // Optional: Revert order status if needed or just notify
      await notificationService.createNotification({
        user_id: transaction.userId,
        title: 'Payment Failed',
        message: error.customerMessage,
        type: 'error',
        related_order_id: transaction.orderId
      });
    }

  } catch (error) {
    console.error('[MpesaCallback] Error processing callback:', error);
    // Note: We don't throw here because this runs in the background
  }
}
