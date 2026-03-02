# M-Pesa Daraja API Integration Report
### For a Fashion & Clothing E-Commerce Node.js Application
**Prepared:** March 2026 | **Platform:** Safaricom Daraja 3.0

---

## 1. Executive Summary

M-Pesa is Kenya's dominant mobile money platform, serving over 66 million customers across East Africa. For a Kenyan fashion e-commerce store selling clothing, shoes, and accessories, integrating M-Pesa is not optional — it is essential. This report covers the Daraja API ecosystem, the recommended integration path for your Node.js stack, a critique of the available options, and a practical roadmap from sandbox to production.

**Recommended immediate approach:** M-Pesa Express (STK Push) using a personal M-Pesa number as recipient (Send Money flow) for rapid launch, with a clear migration path to a registered Paybill or Buy Goods (Till) number for professional operations.

---

## 2. The Daraja API Platform — What It Is

Daraja (Swahili for "bridge") is Safaricom's official developer portal at **https://developer.safaricom.co.ke**. It provides REST APIs that allow web and mobile applications to integrate M-Pesa payment flows. The current version is **Daraja 3.0**.

### Key API Products Available

| API | Purpose | Use for Fashion Shop |
|---|---|---|
| **M-Pesa Express (STK Push)** | Push a payment prompt to customer's phone | ✅ Primary checkout flow |
| **C2B (Customer to Business)** | Customer pays paybill/till manually | Future — requires registered shortcode |
| **B2C (Business to Customer)** | Send money to customer | Refunds, cashback |
| **Transaction Status** | Query status of any transaction | Reconciliation |
| **Account Balance** | Query business wallet balance | Accounting |
| **Reversals** | Reverse a transaction | Refunds |

---

## 3. The Sandbox Environment

Daraja provides a **full sandbox environment** at `https://sandbox.safaricom.co.ke` that mirrors production without touching real money.

### Sandbox Credentials (Free, No Expiry)
After registering at developer.safaricom.co.ke and creating an app with **Lipa na M-Pesa Sandbox** selected, you receive:

- **Consumer Key** — identifies your application
- **Consumer Secret** — used with Consumer Key for OAuth token generation
- **Business Shortcode** — sandbox shortcode (e.g., `174379`)
- **Passkey** — used to generate the Base64 password for STK Push

### How Sandbox Differs from Production
- URLs use `sandbox.safaricom.co.ke` instead of `api.safaricom.co.ke`
- No real money moves
- Callbacks require a **publicly accessible URL** even in sandbox (use **ngrok** for local development)
- Sandbox keys do not expire

---

## 4. The Recommended Flow: M-Pesa Express (STK Push)

When a customer clicks "Pay with M-Pesa" on your fashion store:

1. Your Node.js backend calls Daraja to initiate an STK Push
2. Daraja sends a **PIN prompt directly to the customer's phone** via SIM toolkit
3. The customer enters their M-Pesa PIN
4. M-Pesa sends a **callback** to your server with the result
5. You update the order status accordingly

### Authentication Flow

```
POST https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials
Authorization: Basic base64(ConsumerKey:ConsumerSecret)
→ Returns: { access_token, expires_in: 3600 }
```

### STK Push Request

```json
POST https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest

{
  "BusinessShortCode": "174379",
  "Password": "base64(ShortCode + Passkey + Timestamp)",
  "Timestamp": "20241201120000",
  "TransactionType": "CustomerPayBillOnline",
  "Amount": 2500,
  "PartyA": "254712345678",
  "PartyB": "174379",
  "PhoneNumber": "254712345678",
  "CallBackURL": "https://yourshop.com/api/mpesa/callback",
  "AccountReference": "ORDER-001",
  "TransactionDesc": "Payment for Dress - StyleHub"
}
```

### Callback Payload (Success)

```json
{
  "Body": {
    "stkCallback": {
      "ResultCode": 0,
      "CheckoutRequestID": "ws_CO_...",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 2500 },
          { "Name": "MpesaReceiptNumber", "Value": "QKL9NB..." },
          { "Name": "TransactionDate", "Value": 20241201120132 },
          { "Name": "PhoneNumber", "Value": 254712345678 }
        ]
      }
    }
  }
}
```

`ResultCode: 0` = success. Any other code = failure or cancellation.

---

## 5. The "Send Money" Option — For Immediate Launch

Since you do not yet have a registered Paybill or Till number, use a **payment aggregator** for instant real-money acceptance:

| Provider | Notes |
|---|---|
| **IntaSend** | Kenyan-built, developer-friendly, instant setup |
| **Pesapal** | Very popular in Kenya, plugin-rich |
| **Flutterwave** | Pan-African, supports M-Pesa Kenya |
| **DPO Pay** | Strong enterprise options |

These require no Safaricom shortcode registration — they provide credentials to integrate immediately with M-Pesa STK Push backed by their own licensed Paybill.

---

## 6. Critique of Integration Options

### Option A: Direct Daraja Integration (Best Long-Term)
**Pros:** Full control, lowest fees, direct access to all APIs
**Cons:** Requires Till/Paybill registration (1–4 weeks), callback URL must be public HTTPS

### Option B: NPM Libraries (mpesa-node, daraja-js)
**Pros:** Token caching, password gen handled for you
**Cons:** Dependency risk, may lag Daraja updates
**Verdict:** Build your own thin service wrapper — Daraja is simple enough

### Option C: Payment Aggregator (Best Immediate Option)
**Pros:** Instant merchant account, no shortcode needed, handles compliance
**Cons:** Higher fees (2–3.5%), third-party dependency
**Verdict:** Use NOW, migrate to direct Daraja when Till/Paybill approved

---

## 7. Node.js Architecture

```
/src
  /payments
    mpesa.service.js      ← Daraja API calls (auth + STK push)
    mpesa.controller.js   ← Express routes
    mpesa.callback.js     ← Webhook receiver
    mpesa.helpers.js      ← Password gen, timestamp, token cache
    mpesa.errors.js       ← ResultCode → human message map
/middleware
  mpesaIpWhitelist.js     ← Verify callback source IPs
  idempotency.js          ← Prevent duplicate processing
```

### Environment Variables (.env)
```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourshop.ngrok.io/api/mpesa/callback
MPESA_ENV=sandbox
MPESA_TRANSACTION_TYPE=CustomerPayBillOnline
```

---

## 8. Critical Implementation Notes

1. **Cache OAuth tokens** — tokens expire in 1 hour; don't fetch per-request
2. **Return 200 OK immediately** on callback before processing — Safaricom has tight timeout requirements
3. **Implement idempotency** — store CheckoutRequestID and skip duplicate callbacks
4. **Never trust client-sent amounts** — always fetch order amount from your database using orderId
5. **Use ngrok during development** — Safaricom cannot reach localhost
6. **Implement Transaction Status API** — callbacks can fail; always have a fallback

---

## 9. Going Live — The Till/Paybill Path

| Phase | Action |
|---|---|
| **Week 1** | Register on Daraja, get sandbox credentials, build and test with ngrok |
| **Week 1–2** | Sign up for IntaSend/Pesapal for real payments now |
| **Month 1** | Register a Buy Goods Till at any Safaricom shop (requires business/personal ID + KRA PIN) |
| **Month 2** | Click "Go Live" on Daraja, upload test evidence, receive live credentials in 24–72h |

**Buy Goods (Till) is recommended** over Paybill for fashion retail — customers just enter your Till number with no account reference needed.

---
---

# PART 2: Gemini Implementation Prompt

---

## Ultra-Enhanced Gemini Prompt for M-Pesa Integration

> **Copy this entire block and provide it to Gemini with Conductor MCP and web dev tools enabled.**

---

```
═══════════════════════════════════════════════════════════════════════
GEMINI IMPLEMENTATION PROMPT: M-PESA DARAJA INTEGRATION
FASHION E-COMMERCE — NODE.JS APPLICATION
═══════════════════════════════════════════════════════════════════════

You are a senior full-stack engineer and payment systems architect with
deep expertise in Kenya's fintech ecosystem, Safaricom's Daraja API,
Node.js/Express, and production-grade payment infrastructure. Your task
is to implement a complete, tested, production-ready M-Pesa payment
integration for a fashion and clothing e-commerce Node.js application.

You MUST use:
  → The Conductor MCP to orchestrate all file creation, editing,
    and command execution across the codebase
  → Web dev tools to fetch live Daraja documentation from
    https://developer.safaricom.co.ke BEFORE writing any code
  → Your full reasoning capability — every edge case handled

═══════════════════════════════════════════════════════════════════════
STEP 0: RESEARCH PHASE — DO THIS BEFORE WRITING ANY CODE
═══════════════════════════════════════════════════════════════════════

Using web dev tools, fetch and verify:
  1. https://developer.safaricom.co.ke/apis
     → Confirm all current API products and endpoint URLs
  2. M-Pesa Express (STK Push) API — confirm current request/response
     schemas, especially callback payload structure
  3. OAuth endpoint — confirm token URL and expiry behaviour
  4. Full list of ResultCodes — so error handling is exhaustive

Document your findings in a comment block at the top of mpesa.service.js.
Do NOT proceed until API specs are confirmed.

═══════════════════════════════════════════════════════════════════════
STEP 1: PROJECT STRUCTURE & SETUP
═══════════════════════════════════════════════════════════════════════

Using Conductor MCP, scaffold within the existing Node.js project:

  src/payments/
    mpesa.service.js       ← Core Daraja API client
    mpesa.controller.js    ← Express route handlers
    mpesa.callback.js      ← Webhook receiver & processor
    mpesa.helpers.js       ← Token cache, password gen, timestamp utils
    mpesa.errors.js        ← ResultCode → human message + UI message map
  src/middleware/
    mpesaIpWhitelist.js    ← Validate Safaricom callback IPs
    idempotency.js         ← Prevent duplicate payment processing
  src/routes/
    payments.routes.js     ← Mount all payment endpoints
  tests/
    mpesa.service.test.js
    mpesa.callback.test.js
    mpesa.helpers.test.js
  .env.example
  MPESA_INTEGRATION.md

Install:
  npm install axios dotenv express-async-errors node-cache
  npm install --save-dev jest supertest nock

═══════════════════════════════════════════════════════════════════════
STEP 2: mpesa.helpers.js
═══════════════════════════════════════════════════════════════════════

Export:

  generateTimestamp()
    → 'YYYYMMDDHHmmss' in Africa/Nairobi timezone (UTC+3)
    → Wrong timezone causes Safaricom validation rejection

  generatePassword(shortCode, passkey, timestamp)
    → Buffer.from(shortCode + passkey + timestamp).toString('base64')

  getBaseUrl(environment)
    → 'sandbox' → 'https://sandbox.safaricom.co.ke'
    → 'production' → 'https://api.safaricom.co.ke'
    → Throw descriptive error on invalid value

  formatPhoneNumber(phone)
    → Accepts: '0712345678', '+254712345678', '254712345678', '712345678'
    → Always returns '254XXXXXXXXX' (no + prefix)
    → Validates it's a real Safaricom number format
    → Throws clear error on invalid input

  Full unit tests for all of the above.

═══════════════════════════════════════════════════════════════════════
STEP 3: mpesa.service.js
═══════════════════════════════════════════════════════════════════════

Class-based MpesaService:

  CONFIG (from .env):
    MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET
    MPESA_SHORTCODE (sandbox: 174379, production: real Till/Paybill)
    MPESA_PASSKEY
    MPESA_CALLBACK_URL (public HTTPS)
    MPESA_ENV (sandbox | production)
    MPESA_TRANSACTION_TYPE (CustomerPayBillOnline | CustomerBuyGoodsOnline)

  getAccessToken()
    → Fetch from /oauth/v1/generate?grant_type=client_credentials
    → HTTP Basic Auth: base64(consumerKey:consumerSecret)
    → Cache with node-cache: TTL = expires_in - 60 seconds
    → Return cached token if valid — never hit OAuth on every request
    → Retry up to 3 times on network error (exponential backoff)
    → Log refresh events — NEVER log the token value itself

  initiateSTKPush({ phone, amount, orderId, description })
    → Validate all inputs first
    → Format phone via formatPhoneNumber()
    → Generate fresh timestamp + password
    → POST to /mpesa/stkpush/v1/processrequest
    → Return { CheckoutRequestID, MerchantRequestID }
    → Store CheckoutRequestID → orderId mapping (injectable data layer:
      in-memory Map by default, swappable to Redis with no code change)
    → CRITICAL: Never trust client-provided amount for real orders.
      Fetch amount from your order record using orderId.
    → Timeout: axios timeout 30s on all external calls

  querySTKPushStatus(checkoutRequestId)
    → POST to /mpesa/stkpushquery/v1/query
    → Return parsed status with ResultCode mapped to human message
    → Use as fallback when callback doesn't arrive

  Full JSDoc. Every async method in try/catch with typed errors.

═══════════════════════════════════════════════════════════════════════
STEP 4: mpesa.errors.js
═══════════════════════════════════════════════════════════════════════

Exhaustive ResultCode map. Each entry must include:
  - code (number)
  - logMessage (internal)
  - customerMessage (safe for UI display — friendly, actionable)
  - retryable (boolean)
  - suggestedAction (string)

Minimum codes to include:
  0    → Success
  1    → Insufficient funds — "Top up your M-Pesa and try again"
  1032 → Cancelled by user — "Payment cancelled. Tap Pay Again if needed"
  1037 → Timeout — "Request timed out. Please try again"
  2001 → Wrong PIN — "Incorrect PIN entered"
  1001 → Unable to lock subscriber — "Try again in a moment"

Research additional codes from Daraja docs via web dev tools.

═══════════════════════════════════════════════════════════════════════
STEP 5: mpesa.callback.js
═══════════════════════════════════════════════════════════════════════

processCallback(body) — THIS IS THE MOST CRITICAL COMPONENT:

  → Parse nested structure:
      body.Body.stkCallback.ResultCode
      body.Body.stkCallback.CheckoutRequestID
      body.Body.stkCallback.CallbackMetadata.Item[]

  → Extract Amount, MpesaReceiptNumber, TransactionDate, PhoneNumber
    by searching Item[] by Name field — NOT by array index
    (Safaricom has changed array order in the past)

  → The Express handler MUST respond 200 OK to Safaricom IMMEDIATELY
    then process asynchronously — do NOT make Safaricom wait for DB ops

  → On ResultCode === 0:
      - Look up order by CheckoutRequestID
      - Mark order PAID
      - Store MpesaReceiptNumber
      - Emit fulfillment event / call order service hook

  → On ResultCode !== 0:
      - Log with full context
      - Mark order PAYMENT_FAILED
      - Map code via mpesa.errors.js for appropriate customer message

  → Idempotency: If CheckoutRequestID already processed → log + skip

═══════════════════════════════════════════════════════════════════════
STEP 6: mpesa.controller.js
═══════════════════════════════════════════════════════════════════════

  POST /api/mpesa/initiate
    Body: { phone, amount, orderId }
    → Server-side validation (phone format, amount 1–150000 KES)
    → Call initiateSTKPush()
    → Return: { success: true, message: "Check your phone for M-Pesa prompt",
                checkoutRequestId }
    → Safe error responses — no internal details exposed to client

  POST /api/mpesa/callback   ← Safaricom webhook
    → NO auth middleware (Safaricom sends no auth headers)
    → Apply IP whitelist middleware
    → Immediately: res.sendStatus(200)
    → Then: processCallback() asynchronously
    → Log every callback with timestamp

  GET /api/mpesa/status/:checkoutRequestId
    → Call querySTKPushStatus()
    → Rate limit per IP to prevent abuse

  POST /api/mpesa/simulate-callback   ← SANDBOX ONLY
    → Guard: if MPESA_ENV !== 'sandbox' return 403
    → Accept mock payload for integration testing

═══════════════════════════════════════════════════════════════════════
STEP 7: MIDDLEWARE
═══════════════════════════════════════════════════════════════════════

mpesaIpWhitelist.js:
  → Use web dev tools to find current Safaricom callback IP ranges
  → Whitelist those IPs on /api/mpesa/callback
  → In sandbox mode: allow all IPs
  → Log and reject unknown IPs with a security warning

idempotency.js:
  → Track processed CheckoutRequestIDs in a Set with TTL cleanup
  → On duplicate: return 200 OK, skip processing

═══════════════════════════════════════════════════════════════════════
STEP 8: FRONTEND INTEGRATION EXAMPLE
═══════════════════════════════════════════════════════════════════════

Create: src/payments/mpesa.frontend.example.js

Vanilla JS showing the full checkout UX:
  1. Click Pay with M-Pesa → POST /api/mpesa/initiate
  2. Show "Check your phone for M-Pesa prompt" + spinner
  3. Poll /api/mpesa/status/:checkoutRequestId every 5s (max 2 minutes)
  4. On confirmed PAID → redirect to /order-confirmation
  5. On FAILED → show friendly error from mpesa.errors.js customerMessage
  6. On timeout (2 min) → show "Payment not confirmed. Contact support."

Include comments explaining React/Vue/framework adaptation.

═══════════════════════════════════════════════════════════════════════
STEP 9: .env.example
═══════════════════════════════════════════════════════════════════════

Create fully commented .env.example:

  # ─── M-PESA DARAJA CONFIGURATION ──────────────────────────────
  # Obtain from: https://developer.safaricom.co.ke → My Apps

  MPESA_CONSUMER_KEY=your_consumer_key_here
  MPESA_CONSUMER_SECRET=your_consumer_secret_here

  # Sandbox shortcode: 174379
  # Production: Your registered Till or Paybill number
  MPESA_SHORTCODE=174379

  # Found in: Daraja Dashboard → APIs → M-Pesa Express → Simulator
  MPESA_PASSKEY=your_passkey_here

  # Must be PUBLIC HTTPS. For local dev: ngrok http 3000
  # Then use: https://xxxx.ngrok.io/api/mpesa/callback
  MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback

  # 'sandbox' for testing | 'production' when live
  MPESA_ENV=sandbox

  # Paybill: 'CustomerPayBillOnline' | Till: 'CustomerBuyGoodsOnline'
  MPESA_TRANSACTION_TYPE=CustomerPayBillOnline

═══════════════════════════════════════════════════════════════════════
STEP 10: TESTS — TARGET 90%+ COVERAGE
═══════════════════════════════════════════════════════════════════════

Write Jest tests (use nock to mock HTTP calls):

  mpesa.helpers.test.js:
    ✓ generateTimestamp() returns 14-digit string
    ✓ generatePassword() correct base64 for known input
    ✓ formatPhoneNumber() handles all valid input formats
    ✓ formatPhoneNumber() throws on invalid numbers
    ✓ getBaseUrl() correct for each environment

  mpesa.service.test.js:
    ✓ getAccessToken() returns and caches token
    ✓ Uses cached token on second call (no HTTP request)
    ✓ Refreshes after expiry
    ✓ initiateSTKPush() constructs correct payload
    ✓ Handles Daraja error responses
    ✓ Validates phone before API call
    ✓ querySTKPushStatus() returns parsed status

  mpesa.callback.test.js:
    ✓ ResultCode 0 → order marked PAID
    ✓ ResultCode 1032 → order marked PAYMENT_FAILED
    ✓ Duplicate CheckoutRequestID → ignored (idempotency)
    ✓ Missing CallbackMetadata → handled gracefully
    ✓ Item array reordered → PhoneNumber still extracted correctly

═══════════════════════════════════════════════════════════════════════
STEP 11: MPESA_INTEGRATION.md
═══════════════════════════════════════════════════════════════════════

Include:
  1. Quick Start (5 steps to sandbox working state)
  2. STK Push flow diagram (ASCII)
  3. All environment variables with descriptions
  4. ngrok setup guide for local development
  5. How to use Daraja sandbox simulator
  6. Going Live checklist (Till registration → Daraja Go Live → prod .env)
  7. Troubleshooting common errors (timeout, wrong PIN, IP issues)
  8. API endpoint reference for your own routes
  9. Security notes
  10. Aggregator path: IntaSend setup for immediate production use

═══════════════════════════════════════════════════════════════════════
STEP 12: FINAL VALIDATION — RUN THESE CHECKS
═══════════════════════════════════════════════════════════════════════

Using Conductor MCP:
  1. npm test → ALL tests must pass
  2. node -e "require('./src/payments/mpesa.service')" → no errors
  3. Grep codebase for any hardcoded keys/tokens → remove if found
  4. Confirm .env is in .gitignore
  5. Confirm .env.example is NOT in .gitignore (must be committed)
  6. Confirm no console.log exposes secrets or full phone numbers
  7. Verify axios timeout set on all external calls

═══════════════════════════════════════════════════════════════════════
NON-NEGOTIABLE QUALITY STANDARDS
═══════════════════════════════════════════════════════════════════════

  SECURITY:
    ✓ No hardcoded credentials anywhere
    ✓ Token never logged or returned to client
    ✓ Phone numbers in logs are masked (last 4 digits only)
    ✓ Amount ALWAYS fetched from DB using orderId — never from request body
    ✓ Safe error messages to client (no stack traces, no internal details)

  RESILIENCE:
    ✓ Works correctly if callback never arrives (query fallback)
    ✓ Handles Daraja downtime gracefully
    ✓ Duplicate STK pushes for same order rejected

  FASHION E-COMMERCE SPECIFICS:
    ✓ AccountReference = order number (e.g., "ORDER-1234")
    ✓ TransactionDesc = readable: "StyleHub - Floral Dress, White Sneakers"
    ✓ Amount is integer KES (M-Pesa does not support decimals)
    ✓ Customer-facing messages in clear English

═══════════════════════════════════════════════════════════════════════
BUSINESS PAYMENT CONTEXT
═══════════════════════════════════════════════════════════════════════

CURRENT (No shortcode yet):
  Use sandbox shortcode 174379 for testing.
  For live payments NOW: integrate IntaSend or Pesapal as aggregator.
  Use web dev tools to check IntaSend's Node.js SDK docs and note
  compatibility in MPESA_INTEGRATION.md.

FUTURE MIGRATION (Till/Paybill registered):
  Change only .env values:
    MPESA_SHORTCODE → real Till number
    MPESA_TRANSACTION_TYPE → CustomerBuyGoodsOnline
  ZERO code changes required — this is a hard architectural requirement.
  Buy Goods (Till) is recommended for fashion retail: customers only
  need your Till number, no account reference needed. Simpler UX.

═══════════════════════════════════════════════════════════════════════
BEGIN NOW
═══════════════════════════════════════════════════════════════════════

Start with Step 0 (web research). Confirm API specs. Then proceed
step by step using Conductor MCP. Brief progress report after each step.
Stop and explain if you find anything in the docs that affects architecture.

The end goal: a Kenyan fashion shopper can pay for their shoes, dress,
or handbag in under 30 seconds from checkout click to M-Pesa PIN entry.
Flawless. Every time.
```

---

*End of Report & Gemini Prompt*
*Researched via Safaricom Daraja 3.0 Developer Portal — March 2026*
