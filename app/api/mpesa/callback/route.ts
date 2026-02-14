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
        // Fetch order details for notification and auto-assignment
        const { data: order } = await supabase
          .from('orders')
          .select('*, profiles:trader_id(full_name)')
          .eq('id', transaction.order_id)
          .single();

        if (order) {
          // 1. Mark as confirmed and paid
          await supabase
            .from('orders')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              updated_at: new Date().toISOString(),
            })
            .eq('id', transaction.order_id);

          console.log('Order marked as paid:', transaction.order_id);

          // 2. Clear user's cart (as a safety measure)
          await supabase
            .from('cart')
            .delete()
            .eq('user_id', order.buyer_id);

          // 3. Attempt Auto-Assignment of Transporter
          try {
            // Extract city from shipping address (simple approach)
            const shippingAddressParts = (order.shipping_address || '').split(',').map((part: string) => part.trim());
            const targetCity = shippingAddressParts[shippingAddressParts.length - 2] || shippingAddressParts[0];

            // Find available transporters
            const { data: transporters } = await supabase
              .from('profiles')
              .select('id, full_name, location')
              .eq('role', 'transporter')
              .eq('is_suspended', false);

            if (transporters && transporters.length > 0) {
              // Priority: same city, otherwise random
              const cityTransporters = transporters.filter(t => t.location?.toLowerCase() === targetCity?.toLowerCase());
              const assignedTransporter = cityTransporters.length > 0 
                ? cityTransporters[Math.floor(Math.random() * cityTransporters.length)]
                : transporters[Math.floor(Math.random() * transporters.length)];

              if (assignedTransporter) {
                await supabase
                  .from('orders')
                  .update({
                    transporter_id: assignedTransporter.id,
                    status: 'confirmed', // Still confirmed, but now has a transporter
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', order.id);
                
                // Notify Transporter
                await supabase.from('notifications').insert({
                  user_id: assignedTransporter.id,
                  title: 'New Delivery Available',
                  message: `You have been assigned a new delivery for order "${order.title}".`,
                  type: 'info',
                  related_order_id: order.id
                });
                
                console.log(`✅ Auto-assigned transporter ${assignedTransporter.full_name} to order ${order.id}`);
              }
            }
          } catch (assignError) {
            console.error('Error during transporter auto-assignment:', assignError);
          }

          // 4. Notify Buyer & Trader
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
        }
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
