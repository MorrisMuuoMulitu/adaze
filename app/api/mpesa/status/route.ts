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

        // Also update the order status
        if (transaction.order_id) {
          // Fetch order details for notification and auto-assignment
          const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', transaction.order_id)
            .single();

          if (order) {
            // 1. Mark order as paid
            await supabase
              .from('orders')
              .update({
                status: 'confirmed',
                payment_status: 'paid',
                updated_at: new Date().toISOString(),
              })
              .eq('id', transaction.order_id);
            
            // 2. Clear cart
            await supabase
              .from('cart')
              .delete()
              .eq('user_id', order.buyer_id);

            // 3. Attempt Auto-Assignment of Transporter
            try {
              const { data: transporters } = await supabase
                .from('profiles')
                .select('id, full_name, location')
                .eq('role', 'transporter')
                .eq('is_suspended', false);

              if (transporters && transporters.length > 0) {
                const assignedTransporter = transporters[Math.floor(Math.random() * transporters.length)];
                
                await supabase
                  .from('orders')
                  .update({
                    transporter_id: assignedTransporter.id,
                    status: 'confirmed',
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', order.id);
                
                await supabase.from('notifications').insert({
                  user_id: assignedTransporter.id,
                  title: 'New Delivery Available',
                  message: `You have been assigned a new delivery for order "${order.title}".`,
                  type: 'info',
                  related_order_id: order.id
                });
              }
            } catch (err) {
              console.error('Auto-assign failed in status poll:', err);
            }

            // 4. Notifications
            const notifications = [
              {
                user_id: order.buyer_id,
                title: 'Order Confirmed',
                message: `Your payment was successful. Order "${order.title}" is now being processed.`,
                type: 'success',
                related_order_id: order.id
              }
            ];

            if (order.trader_id) {
              notifications.push({
                user_id: order.trader_id,
                title: 'New Paid Order',
                message: `Payment received for "${order.title}". Please prepare the items for delivery.`,
                type: 'info',
                related_order_id: order.id
              });
            }

            await supabase.from('notifications').insert(notifications);
            console.log(`✅ Order ${transaction.order_id} confirmed and processed via status poll`);
          }
        }

        return NextResponse.json({
          status: 'completed',
          mpesaReceiptNumber: status.MpesaReceiptNumber,
          amount: status.Amount,
        });
      } else {
        await mpesaService.updateTransactionStatus(checkoutRequestId, 'failed');
        
        // Also update the order payment status to failed
        if (transaction.order_id) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', transaction.order_id);
        }
        
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
