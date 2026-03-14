import { processMpesaCallback } from '@/lib/mpesa/callback';
import { isSafaricomIp, isDuplicateRequest } from '@/lib/mpesa/middleware';
import { NextResponse } from 'next/server';
import { mpesaCallbackRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/mpesa/callback
 * Safaricom Webhook Receiver
 */
export async function POST(request: Request) {
  try {
    // 1. IP Whitelisting (Security)
    const forwardHeader = request.headers.get('x-forwarded-for');
    const ip = forwardHeader ? forwardHeader.split(',')[0] : 'unknown';
    
    if (!isSafaricomIp(ip)) {
      console.warn(`[API/Mpesa/Callback] Rejected request from unauthorized IP: ${ip}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const checkoutRequestId = body.Body?.stkCallback?.CheckoutRequestID;

    // 2. Rate Limiting (Prevent abuse)
    const rateLimitIdentifier = checkoutRequestId || ip;
    const rateLimitResult = await mpesaCallbackRateLimit(rateLimitIdentifier);
    if (!rateLimitResult.success) {
      console.warn(`[API/Mpesa/Callback] Rate limit exceeded for ${rateLimitIdentifier}`);
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 3. Idempotency Check
    if (checkoutRequestId && isDuplicateRequest(checkoutRequestId)) {
      console.log(`[API/Mpesa/Callback] Duplicate request received for ${checkoutRequestId}. Skipping.`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Duplicate accepted" });
    }
    
    // Log the received callback
    console.log(`[API/Mpesa/Callback] Received callback for ${checkoutRequestId} at:`, new Date().toISOString());
    
    // 4. Asynchronously process the callback
    // We don't await this because Safaricom has a strict timeout (usually < 5s)
    // and expects a 200 OK response immediately.
    processMpesaCallback(body).catch(err => {
      console.error('[API/Mpesa/Callback] Async processing error:', err);
    });

    // 5. Respond to Safaricom immediately
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted successfully"
    });

  } catch (error: any) {
    console.error('[API/Mpesa/Callback] Parsing error:', error.message);
    // Even on error, we return 200 to Safaricom to stop retries if the payload was valid JSON
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted with parsing error"
    });
  }
}
