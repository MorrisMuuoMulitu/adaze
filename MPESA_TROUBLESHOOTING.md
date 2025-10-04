# M-Pesa Payment Troubleshooting

## Sandbox Test Number Not Working?

### Check These:

1. **Environment Variables Set?**
   ```bash
   # In Netlify, check these exist:
   NEXT_PUBLIC_MPESA_CONSUMER_KEY
   MPESA_CONSUMER_SECRET
   MPESA_PASSKEY
   NEXT_PUBLIC_MPESA_SHORTCODE=174379
   NEXT_PUBLIC_MPESA_ENV=sandbox
   NEXT_PUBLIC_MPESA_CALLBACK_URL
   ```

2. **Correct Sandbox Number?**
   - Use: `254708374149` (with country code)
   - Or: `0708374149` (local format)

3. **Check Browser Console:**
   - F12 → Console tab
   - Look for errors from `/api/mpesa/initiate`

4. **Check Netlify Logs:**
   - Go to Netlify → Functions
   - Check for M-Pesa API errors

### Common Issues:

**"Invalid Access Token"**
- Consumer Key/Secret wrong
- Credentials not from sandbox app

**"Invalid Shortcode"**
- Must be 174379 for sandbox
- Check NEXT_PUBLIC_MPESA_SHORTCODE

**"Request failed"**
- Passkey incorrect
- Should be: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

**"Callback URL unreachable"**
- Must be HTTPS
- Should be: https://adaze.netlify.app/api/mpesa/callback

### Test Manually:

```bash
# Test callback URL is accessible:
curl https://adaze.netlify.app/api/mpesa/callback

# Should return: {"message":"M-Pesa callback endpoint"}
```

## For Production Testing:

If sandbox fails, you can:
1. Get real Paybill from Safaricom
2. Use production credentials
3. Test with your real M-Pesa number
