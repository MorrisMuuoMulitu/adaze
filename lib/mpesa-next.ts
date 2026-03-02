interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortcode: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
}

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

class MpesaServiceNext {
  private config: MpesaConfig;
  private baseUrl: string;

  constructor() {
    // Get config from environment variables
    const callbackUrl = process.env.NEXT_PUBLIC_MPESA_CALLBACK_URL || 
                       process.env.MPESA_CALLBACK_URL ||
                       this.getDefaultCallbackUrl();
    
    this.config = {
      consumerKey: process.env.NEXT_PUBLIC_MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      passkey: process.env.MPESA_PASSKEY || '',
      shortcode: process.env.NEXT_PUBLIC_MPESA_SHORTCODE || '174379',
      callbackUrl,
      environment: (process.env.NEXT_PUBLIC_MPESA_ENV as 'sandbox' | 'production') || 'sandbox',
    };

    this.baseUrl = this.config.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  private getDefaultCallbackUrl(): string {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}/api/mpesa/callback`;
    }
    return 'https://adazeconnect.com/api/mpesa/callback';
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`
    ).toString('base64');

    const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: 'no-store', // Important for Next.js to not cache this
    });

    if (!response.ok) {
      throw new Error('Failed to get M-Pesa access token');
    }

    const data = await response.json();
    return data.access_token;
  }

  private generatePassword(): { password: string; timestamp: string } {
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);

    const password = Buffer.from(
      `${this.config.shortcode}${this.config.passkey}${timestamp}`
    ).toString('base64');

    return { password, timestamp };
  }

  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    } else if (cleaned.startsWith('+254')) {
      cleaned = cleaned.slice(1);
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      cleaned = '254' + cleaned;
    }
    return cleaned;
  }

  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    const accessToken = await this.getAccessToken();
    const { password, timestamp } = this.generatePassword();
    const phoneNumber = this.formatPhoneNumber(request.phoneNumber);

    const payload = {
      BusinessShortCode: this.config.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(request.amount),
      PartyA: phoneNumber,
      PartyB: this.config.shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: this.config.callbackUrl,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc,
    };

    const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errorMessage || 'STK Push failed');
    }

    return await response.json();
  }

  /**
   * Save payment transaction to Neon via Prisma
   */
  async saveTransaction(data: {
    orderId: string;
    userId: string; // Auth.js User ID
    amount: number;
    phoneNumber: string;
    checkoutRequestId: string;
    merchantRequestId: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'; // Matches Prisma Enum
    mpesaReceiptNumber?: string;
  }) {
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.mpesaTransaction.create({
        data: {
          orderId: data.orderId,
          userId: data.userId,
          amount: data.amount,
          phoneNumber: data.phoneNumber,
          checkoutRequestId: data.checkoutRequestId,
          merchantRequestId: data.merchantRequestId,
          status: data.status,
          mpesaReceiptNumber: data.mpesaReceiptNumber,
        },
      });
    } catch (error) {
      console.error('Error saving transaction to Neon:', error);
      throw error;
    }
  }

  async updateTransactionStatus(
    checkoutRequestId: string,
    status: 'COMPLETED' | 'FAILED' | 'CANCELLED',
    mpesaReceiptNumber?: string
  ) {
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.mpesaTransaction.update({
        where: { checkoutRequestId },
        data: {
          status,
          mpesaReceiptNumber,
        },
      });
    } catch (error) {
      console.error('Error updating transaction in Neon:', error);
      throw error;
    }
  }
}

export const mpesaServiceNext = new MpesaServiceNext();
