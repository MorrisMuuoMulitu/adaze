import { NextRequest, NextResponse } from 'next/server';
import { mpesaService } from '@/lib/mpesa/service';
import { prisma } from '@/lib/prisma';
import { getMpesaError } from '@/lib/mpesa/errors';
import { MpesaStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mpesa/status?checkoutRequestId=xxx
 * Query payment status from DB or M-Pesa API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutRequestId = searchParams.get('checkoutRequestId');

    if (!checkoutRequestId) {
      return NextResponse.json({ error: 'Missing checkoutRequestId' }, { status: 400 });
    }

    // 1. Check local database first
    const transaction = await prisma.mpesaTransaction.findUnique({
      where: { checkoutRequestId },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // 2. If already COMPLETED or FAILED, return immediately
    if (transaction.status === MpesaStatus.COMPLETED || transaction.status === MpesaStatus.FAILED) {
      return NextResponse.json({
        status: transaction.status.toLowerCase(),
        mpesaReceiptNumber: transaction.mpesaReceiptNumber,
        amount: Number(transaction.amount),
      });
    }

    // 3. Fallback: Query M-Pesa API if status is still PENDING
    // This handles cases where the callback was lost or delayed
    try {
      const result = await mpesaService.querySTKPushStatus(checkoutRequestId);
      
      // Map ResultCode to human message
      const error = getMpesaError(result.ResultCode);

      // If the API says it's finished, update our DB
      if (result.ResultCode === '0') {
        // Note: The Query API response doesn't include metadata like MpesaReceiptNumber
        // usually, but if it does, we'd update it here.
        await prisma.mpesaTransaction.update({
          where: { checkoutRequestId },
          data: { status: MpesaStatus.COMPLETED }
        });

        return NextResponse.json({
          status: 'completed',
          message: 'Payment confirmed via query API'
        });
      } else if (result.ResultCode !== '0' && result.ResponseCode === '0') {
        // Transaction failed according to M-Pesa
        await prisma.mpesaTransaction.update({
          where: { checkoutRequestId },
          data: { status: MpesaStatus.FAILED }
        });

        return NextResponse.json({
          status: 'failed',
          message: error.customerMessage
        });
      }

      // Still pending
      return NextResponse.json({
        status: 'pending',
        message: 'Payment is being processed'
      });

    } catch (apiError) {
      // API query failed, just return current DB status
      return NextResponse.json({
        status: 'pending',
        message: 'Awaiting confirmation'
      });
    }

  } catch (error: any) {
    console.error('[API/Mpesa/Status] Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
