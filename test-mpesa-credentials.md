# M-Pesa Payment Debugging Checklist

## ✅ What's Working:
- RLS policies fixed
- STK Push sent (no error)
- Phone receives prompt

## ❌ What's Failing:
- Payment shows as "failed"

## 🔍 Debug Steps:

### 1. Check Netlify Environment Variables

Go to: https://app.netlify.com/sites/YOUR_SITE/settings/deploys#environment

**Verify these EXACT values:**
```
NEXT_PUBLIC_MPESA_CONSUMER_KEY = [your key from Safaricom]
MPESA_CONSUMER_SECRET = [your secret]
MPESA_PASSKEY = bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
NEXT_PUBLIC_MPESA_SHORTCODE = 174379
NEXT_PUBLIC_MPESA_ENV = sandbox
NEXT_PUBLIC_MPESA_CALLBACK_URL = https://adaze.netlify.app/api/mpesa/callback
```

### 2. Check Netlify Function Logs

1. Go to: https://app.netlify.com/sites/YOUR_SITE/functions
2. Find: `api-mpesa-initiate`
3. Click "View logs"
4. Look for errors like:
   - "Invalid Access Token"
   - "Invalid Shortcode"
   - "Invalid Phone Number"

### 3. Test Callback URL

Run this in terminal:
```bash
curl https://adaze.netlify.app/api/mpesa/callback
```

Should return: `{"message":"M-Pesa callback endpoint"}`

### 4. Check Sandbox Credentials

**From Safaricom Developer Portal:**
1. Go to: https://developer.safaricom.co.ke/
2. My Apps → Your App
3. Verify:
   - Consumer Key matches
   - Consumer Secret matches
   - App has "Lipa Na M-Pesa Sandbox" enabled

### 5. Common Issues:

**Issue: "Invalid Access Token"**
- Consumer Key/Secret wrong
- Copy-paste error (extra spaces?)

**Issue: "Invalid Shortcode"**
- Must be exactly: 174379
- Check no quotes or spaces

**Issue: "Request Timeout"**
- Callback URL unreachable
- Must be HTTPS

**Issue: "Invalid Phone Number"**
- Try: 254708374149 (with country code)
- Or: 0708374149 (local)

### 6. Test in Sandbox Mode

Sandbox should auto-confirm in 5-10 seconds.
No actual PIN needed - it's simulated.

### 7. Check Browser Console

F12 → Network tab → Filter "mpesa"
Look for:
- `/api/mpesa/initiate` response
- What error code/message?

### 8. Manual Test

Try this curl command (replace YOUR_KEY and YOUR_SECRET):

```bash
# Get access token
curl -X GET \
  'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials' \
  -H 'Authorization: Basic [BASE64_OF_KEY:SECRET]'

# If this fails, credentials are wrong
```

## 🎯 Most Likely Issues:

1. **Environment variables not set in Netlify**
   - Check they exist
   - Check no typos
   - Redeploy after adding

2. **Wrong credentials**
   - Consumer Key/Secret from wrong app
   - Not from "Lipa Na M-Pesa Sandbox"

3. **Callback URL**
   - Not HTTPS
   - Wrong domain
   - Typo in URL

## 📝 What to Check Next:

1. Share the error from Netlify function logs
2. Share Consumer Key (first/last 4 chars only)
3. Confirm MPESA_ENV=sandbox
4. Test callback URL accessibility
