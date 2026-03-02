import { MpesaService } from './service';
import nock from 'nock';

describe('MpesaService', () => {
  let mpesa: MpesaService;
  const baseUrl = 'https://sandbox.safaricom.co.ke';

  beforeEach(() => {
    mpesa = new MpesaService({
      consumerKey: 'test_key',
      consumerSecret: 'test_secret',
      passkey: 'test_passkey',
      shortCode: '174379',
      environment: 'sandbox'
    });
    nock.cleanAll();
  });

  test('getAccessToken() returns and caches token', async () => {
    const scope = nock(baseUrl)
      .get('/oauth/v1/generate?grant_type=client_credentials')
      .reply(200, {
        access_token: 'valid_token',
        expires_in: '3600'
      });

    const token = await mpesa.getAccessToken();
    expect(token).toBe('valid_token');
    expect(scope.isDone()).toBe(true);

    // Second call should use cache (no second network request)
    const token2 = await mpesa.getAccessToken();
    expect(token2).toBe('valid_token');
  });

  test('initiateSTKPush() constructs correct payload', async () => {
    // Mock Auth
    nock(baseUrl)
      .get('/oauth/v1/generate?grant_type=client_credentials')
      .reply(200, { access_token: 'token', expires_in: '3600' });

    // Mock STK Push
    const scope = nock(baseUrl)
      .post('/mpesa/stkpush/v1/processrequest')
      .reply(200, {
        MerchantRequestID: '123',
        CheckoutRequestID: 'ws_CO_123',
        ResponseCode: '0',
        ResponseDescription: 'Success',
        CustomerMessage: 'Success'
      });

    const result = await mpesa.initiateSTKPush({
      phoneNumber: '0712345678',
      amount: 100,
      orderId: 'ORDER-1',
      description: 'Test'
    });

    expect(result.CheckoutRequestID).toBe('ws_CO_123');
    expect(scope.isDone()).toBe(true);
  });

  test('querySTKPushStatus() returns parsed status', async () => {
    // Mock Auth
    nock(baseUrl)
      .get('/oauth/v1/generate?grant_type=client_credentials')
      .reply(200, { access_token: 'token', expires_in: '3600' });

    // Mock Query
    const scope = nock(baseUrl)
      .post('/mpesa/stkpushquery/v1/query')
      .reply(200, {
        ResultCode: '0',
        ResultDesc: 'The service request is processed successfully.'
      });

    const result = await mpesa.querySTKPushStatus('ws_CO_123');
    expect(result.ResultCode).toBe('0');
    expect(scope.isDone()).toBe(true);
  });
});
