/**
 * M-Pesa Daraja API Integration for ADAZE Kenya
 * 
 * This service handles:
 * - STK Push (Lipa Na M-Pesa Online)
 * - Payment status queries
 * - Transaction validation
 * 
 * Documentation: https://developer.safaricom.co.ke/docs
 */

import { createClient } from '@/lib/supabase/client';

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

interface PaymentStatus {
  ResultCode: string;
  ResultDesc: string;
  CheckoutRequestID?: string;
  Amount?: number;
  MpesaReceiptNumber?: string;
  TransactionDate?: string;
  PhoneNumber?: string;
}

class MpesaService {
  private config: MpesaConfig;
  private baseUrl: string;
  private supabase = createClient();

  constructor() {
    // Get config from environment variables
    const callbackUrl = process.env.NEXT_PUBLIC_MPESA_CALLBACK_URL || 
                       process.env.MPESA_CALLBACK_URL ||
                       this.getDefaultCallbackUrl();
    
    this.config = {
      consumerKey: process.env.NEXT_PUBLIC_MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      passkey: process.env.MPESA_PASSKEY || '',
      shortcode: process.env.NEXT_PUBLIC_MPESA_SHORTCODE || '174379', // Sandbox default
      callbackUrl,
      environment: (process.env.NEXT_PUBLIC_MPESA_ENV as 'sandbox' | 'production') || 'sandbox',
    };

    this.baseUrl = this.config.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  /**
   * Get default callback URL based on environment
   */
  private getDefaultCallbackUrl(): string {
    // For deployed production
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return `${process.env.NEXT_PUBLIC_SITE_URL}/api/mpesa/callback`;
    }
    
    // For Vercel/Netlify (auto-detected)
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}/api/mpesa/callback`;
    }
    if (process.env.URL) {
      return `${process.env.URL}/api/mpesa/callback`;
    }
    
    // Fallback to new domain for production if not configured
    return 'https://adazeconnect.com/api/mpesa/callback';
  }

  /**
   * Get OAuth access token from M-Pesa API
   */
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`
    ).toString('base64');

    const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get M-Pesa access token');
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Generate password for STK Push
   */
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

  /**
   * Format phone number to M-Pesa format (254XXXXXXXXX)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Handle different formats
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    } else if (cleaned.startsWith('254')) {
      // Already in correct format
    } else if (cleaned.startsWith('+254')) {
      cleaned = cleaned.slice(1);
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      cleaned = '254' + cleaned;
    }

    return cleaned;
  }

  /**
   * Initiate STK Push payment
   */
  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    const accessToken = await this.getAccessToken();
    const { password, timestamp } = this.generatePassword();
    const phoneNumber = this.formatPhoneNumber(request.phoneNumber);

    const payload = {
      BusinessShortCode: this.config.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(request.amount), // M-Pesa only accepts whole numbers
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
   * Query STK Push payment status
   */
  async queryPaymentStatus(checkoutRequestId: string): Promise<PaymentStatus> {
    const accessToken = await this.getAccessToken();
    const { password, timestamp } = this.generatePassword();

    const payload = {
      BusinessShortCode: this.config.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to query payment status');
    }

    return await response.json();
  }

  /**
   * Save payment transaction to database
   */
  async saveTransaction(data: {
    orderId: string;
    userId: string;
    amount: number;
    phoneNumber: string;
    checkoutRequestId: string;
    merchantRequestId: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    mpesaReceiptNumber?: string;
  }) {
    const { error } = await this.supabase.from('mpesa_transactions').insert([
      {
        order_id: data.orderId,
        user_id: data.userId,
        amount: data.amount,
        phone_number: data.phoneNumber,
        checkout_request_id: data.checkoutRequestId,
        merchant_request_id: data.merchantRequestId,
        status: data.status,
        mpesa_receipt_number: data.mpesaReceiptNumber,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    checkoutRequestId: string,
    status: 'completed' | 'failed' | 'cancelled',
    mpesaReceiptNumber?: string
  ) {
    const { error } = await this.supabase
      .from('mpesa_transactions')
      .update({
        status,
        mpesa_receipt_number: mpesaReceiptNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('checkout_request_id', checkoutRequestId);

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  /**
   * Get user's payment history
   */
  async getUserTransactions(userId: string) {
    const { data, error } = await this.supabase
      .from('mpesa_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    return data;
  }

  /**
   * Validate callback from M-Pesa
   */
  validateCallback(callbackData: any): boolean {
    // Add validation logic here
    // Check signature, timestamp, etc.
    return true;
  }
}

// Export singleton instance
export const mpesaService = new MpesaService();

// Export types
export type { STKPushRequest, STKPushResponse, PaymentStatus, MpesaConfig };
