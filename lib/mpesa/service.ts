/**
 * M-Pesa Daraja 3.0 Service Client
 * 
 * RESEARCH FINDINGS (March 2026):
 * - OAuth URL: /oauth/v1/generate?grant_type=client_credentials (GET)
 * - STK Push URL: /mpesa/stkpush/v1/processrequest (POST)
 * - STK Query URL: /mpesa/stkpushquery/v1/query (POST)
 * - Access Token: Valid for 3600 seconds.
 * - ResultCode 0: Success.
 * - Phone Format: 254XXXXXXXXX
 */

import axios, { AxiosInstance } from 'axios';
import NodeCache from 'node-cache';
import { 
  generateTimestamp, 
  generatePassword, 
  getBaseUrl, 
  formatPhoneNumber,
  maskPhoneNumber 
} from './helpers';
import { getMpesaError } from './errors';
import { MpesaStatus } from '@prisma/client';

// Cache for OAuth tokens (TTL slightly less than 3600s)
const tokenCache = new NodeCache({ stdTTL: 3540, checkperiod: 60 });

export interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortCode: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
  transactionType: 'CustomerPayBillOnline' | 'CustomerBuyGoodsOnline';
}

export interface STKPushOptions {
  phoneNumber: string;
  amount: number;
  orderId: string;
  description: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface STKQueryResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

export class MpesaService {
  private config: MpesaConfig;
  private client: AxiosInstance;

  constructor(config?: Partial<MpesaConfig>) {
    this.config = {
      consumerKey: process.env.MPESA_CONSUMER_KEY || process.env.NEXT_PUBLIC_MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      passkey: process.env.MPESA_PASSKEY || '',
      shortCode: process.env.MPESA_SHORTCODE || process.env.NEXT_PUBLIC_MPESA_SHORTCODE || '174379',
      callbackUrl: process.env.MPESA_CALLBACK_URL || process.env.NEXT_PUBLIC_MPESA_CALLBACK_URL || '',
      environment: (process.env.MPESA_ENV || process.env.NEXT_PUBLIC_MPESA_ENV || 'sandbox') as 'sandbox' | 'production',
      transactionType: (process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline') as any,
      ...config
    };

    const baseURL = getBaseUrl(this.config.environment);
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Refreshes or retrieves the OAuth access token
   */
  async getAccessToken(): Promise<string> {
    const cacheKey = `mpesa_token_${this.config.consumerKey}`;
    const cachedToken = tokenCache.get<string>(cacheKey);

    if (cachedToken) {
      return cachedToken;
    }

    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');

    try {
      console.log(`[MpesaService] Refreshing access token for ${this.config.environment} environment...`);
      const response = await this.client.get('/oauth/v1/generate?grant_type=client_credentials', {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      const { access_token, expires_in } = response.data;
      
      // Cache the token
      const ttl = parseInt(expires_in, 10) - 60;
      tokenCache.set(cacheKey, access_token, ttl);

      return access_token;
    } catch (error: any) {
      console.error('[MpesaService] OAuth Error:', error.response?.data || error.message);
      throw new Error('Failed to retrieve M-Pesa access token.');
    }
  }

  /**
   * Initiates an STK Push (Lipa Na M-Pesa Online)
   */
  async initiateSTKPush(options: STKPushOptions): Promise<STKPushResponse> {
    const { phoneNumber, amount, orderId, description } = options;

    // 1. Validation
    if (!phoneNumber) throw new Error('Phone number is required');
    if (amount <= 0) throw new Error('Amount must be greater than zero');
    if (!orderId) throw new Error('Order ID is required');

    // 2. Formatting
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const timestamp = generateTimestamp();
    const password = generatePassword(this.config.shortCode, this.config.passkey, timestamp);
    const token = await this.getAccessToken();

    // 3. Payload
    const payload = {
      BusinessShortCode: this.config.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: this.config.transactionType,
      Amount: Math.ceil(amount), // M-Pesa does not support decimals
      PartyA: formattedPhone,
      PartyB: this.config.shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: this.config.callbackUrl,
      AccountReference: orderId.substring(0, 12), // Limit to 12 chars
      TransactionDesc: description.substring(0, 20) || 'Payment',
    };

    console.log(`[MpesaService] Initiating STK Push for ${maskPhoneNumber(formattedPhone)}, Amount: ${payload.Amount}, Order: ${orderId}`);

    try {
      const response = await this.client.post('/mpesa/stkpush/v1/processrequest', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('[MpesaService] STK Push Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || 'STK Push request failed.');
    }
  }

  /**
   * Queries the status of an STK Push transaction
   */
  async querySTKPushStatus(checkoutRequestId: string): Promise<STKQueryResponse> {
    const timestamp = generateTimestamp();
    const password = generatePassword(this.config.shortCode, this.config.passkey, timestamp);
    const token = await this.getAccessToken();

    const payload = {
      BusinessShortCode: this.config.shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    try {
      const response = await this.client.post('/mpesa/stkpushquery/v1/query', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('[MpesaService] Status Query Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || 'Transaction status query failed.');
    }
  }

  /**
   * Maps internal status to Prisma MpesaStatus
   */
  mapStatus(status: string): MpesaStatus {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
      case '0':
        return MpesaStatus.COMPLETED;
      case 'failed':
      case '1':
        return MpesaStatus.FAILED;
      case 'cancelled':
      case '1032':
        return MpesaStatus.CANCELLED;
      default:
        return MpesaStatus.PENDING;
    }
  }
}

// Export singleton
export const mpesaService = new MpesaService();
