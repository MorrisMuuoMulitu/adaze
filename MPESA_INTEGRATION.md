# M-Pesa Daraja 3.0 Integration Guide
### Adaze Marketplace | Kenya

This document outlines the production-grade M-Pesa integration implemented in March 2026.

## 1. Quick Start (Sandbox)

1.  **Get Credentials:** Create an account at [Safaricom Daraja](https://developer.safaricom.co.ke/) and create an app with "Lipa na M-Pesa Sandbox".
2.  **Configure Env:** Add the keys to your `.env` (see section below).
3.  **Setup ngrok:** M-Pesa requires a public HTTPS URL for callbacks.
    ```bash
    ngrok http 3000
    ```
4.  **Update Callback:** Set `MPESA_CALLBACK_URL` to `https://your-ngrok-id.ngrok.io/api/mpesa/callback`.
5.  **Test Checkout:** Use the sandbox test number `254708374149` and any PIN (e.g., `1234`) when prompted on the simulator.

## 2. STK Push Flow (ASCII)

```text
Buyer          Adaze App          M-Pesa API (Daraja)
  |                |                      |
  |-- Click Pay -->|                      |
  |                |-- Initiate STK Push -->|
  |                |                      |-- PIN Prompt on Phone --|
  |                |<-- Success Response ---|                         |
  |-- Enter PIN ---|--------------------------------------------------|
  |                |                      |
  |                |                      |-- Webhook Callback ---->|
  |                |<-- Update Order Status |                         |
  |-- View Status -|                      |                         |
```

## 3. Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `MPESA_CONSUMER_KEY` | Daraja App Key | `xx...xx` |
| `MPESA_CONSUMER_SECRET` | Daraja App Secret | `yy...yy` |
| `MPESA_SHORTCODE` | Paybill or Till Number | `174379` (Sandbox) |
| `MPESA_PASSKEY` | LNM Online Passkey | `bfb...19` |
| `MPESA_CALLBACK_URL` | Your public webhook URL | `https://site.com/api/mpesa/callback` |
| `MPESA_ENV` | `sandbox` or `production` | `sandbox` |
| `MPESA_TRANSACTION_TYPE` | `CustomerPayBillOnline` | `CustomerPayBillOnline` |

## 4. API Endpoints (Internal)

- **`POST /api/mpesa/initiate`**: Starts the payment process. Returns `checkoutRequestId`.
- **`GET /api/mpesa/status?checkoutRequestId=xxx`**: Polls the status of a payment.
- **`POST /api/mpesa/callback`**: Internal webhook receiver for Safaricom.

## 5. Security & Resilience

- **IP Whitelisting:** The callback endpoint verifies that requests originate from Safaricom IP ranges.
- **Idempotency:** `checkoutRequestId` is tracked to prevent duplicate processing of the same payment.
- **Polling Fallback:** If the webhook is delayed, the status endpoint queries the M-Pesa API directly as a fallback.
- **Amount Integrity:** The system fetches the order amount from the database using the `orderId` instead of trusting the client-sent amount.

## 6. Going Live Checklist

1. [ ] Register a **Buy Goods Till** (recommended) or **Paybill** at Safaricom.
2. [ ] Click "Go Live" on Daraja Portal and complete the verification steps.
3. [ ] Update `.env` with live credentials and set `MPESA_ENV=production`.
4. [ ] Ensure your production URL is using **HTTPS**.

## 7. Immediate Production (Aggregator Path)

If you need to accept real money **today** without waiting for Safaricom registration, integrate an aggregator like **IntaSend**:
- Fees: ~2% - 3.5%
- Setup: Instant
- Compatibility: Our architecture is designed to swap the service layer in `lib/mpesa/service.ts` with minimal changes to the controllers.
