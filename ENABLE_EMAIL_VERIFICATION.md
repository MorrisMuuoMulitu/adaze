# Enable Email Verification in Supabase

## Steps to Enable Email Confirmation

1. **Go to Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard

2. **Open Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "Providers"
   - Scroll to "Email" provider

3. **Enable Email Confirmations**
   - Toggle ON "Enable email confirmations"
   - This requires users to verify their email before they can sign in

4. **Configure Email Templates (Optional but Recommended)**
   - Go to Authentication → Email Templates
   - Customize the "Confirm signup" template
   - You can add your branding and customize the message

5. **Test the Flow**
   - Register a new account on your site
   - You should see the beautiful email verification dialog
   - Check your email for the verification link
   - Click the link to verify
   - Sign in with your verified account

## What Happens Now

✅ **After Sign Up:**
- User fills out the registration form
- Account is created in Supabase
- Beautiful dialog shows: "Check Your Email!"
- Clear 3-step instructions displayed
- Option to resend verification email

✅ **Email Verification:**
- User receives email from ADAZE
- Clicks verification link
- Account is confirmed
- User can now sign in

✅ **User Experience:**
- Clear, step-by-step guidance
- Professional email verification dialog
- Resend button if email wasn't received
- Spam folder reminder

## Email Template Customization (Optional)

You can customize the verification email in Supabase:

1. Go to Authentication → Email Templates
2. Select "Confirm signup"
3. Customize the HTML/text
4. Add your logo and branding
5. Save changes

## Production Considerations

**Important:** For production, make sure to:
1. Set up a custom SMTP server (not Supabase's default)
2. Use your own domain email (e.g., noreply@adaze.co.ke)
3. Configure SPF, DKIM, and DMARC records
4. Test email deliverability

This prevents emails from going to spam and builds trust with users.
