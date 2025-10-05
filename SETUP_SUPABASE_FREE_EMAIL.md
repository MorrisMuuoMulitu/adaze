# 📧 Setup Supabase Free Email Service (No SMTP Needed)

## Quick Setup - Use Supabase Built-in Email

You want to use Supabase's free email service (not external SMTP). Here's how:

---

## Step 1: Enable Email Confirmations

1. **Go to Supabase Dashboard** → Your Project
2. **Authentication** → **Providers**
3. Find **"Email"** section
4. Make sure these are set:
   - ✅ **Enable email provider** - Toggle ON
   - ✅ **Confirm email** - Toggle ON (or "Enable email confirmations")
   - ❌ **Secure email change** - Can be OFF for now
5. **Save** (if there's a save button)

---

## Step 2: Configure Email Templates

You already have beautiful templates! Now upload them to Supabase:

### A. Confirmation Email (Sign Up)

1. Go to **Authentication** → **Email Templates**
2. Click on **"Confirm signup"** template
3. Replace the default content with your template from:
   `supabase-email-templates/confirmation-email.html`
4. **Make sure** it includes this variable: `{{ .ConfirmationURL }}`
5. Click **Save**

### B. Password Reset Email

1. In **Email Templates**, click **"Reset password"**
2. Replace with your template from:
   `supabase-email-templates/reset-password.html`
3. **Make sure** it includes: `{{ .ConfirmationURL }}`
4. Click **Save**

### C. Email Change

1. Click **"Change email address"** template
2. Replace with your template from:
   `supabase-email-templates/change-email.html`
3. **Make sure** it includes: `{{ .ConfirmationURL }}`
4. Click **Save**

### D. Invite Email

1. Click **"Invite user"** template
2. Replace with your template from:
   `supabase-email-templates/invite-email.html`
3. **Make sure** it includes: `{{ .ConfirmationURL }}`
4. Click **Save**

---

## Step 3: Verify Email Settings

Make sure you're **NOT using custom SMTP**:

1. Go to **Project Settings** → **Auth**
2. Scroll to **"SMTP Settings"**
3. Make sure **"Enable Custom SMTP"** is **OFF** (disabled)
4. This ensures Supabase uses its built-in email service

---

## Step 4: Test Email Delivery

### Test 1: Send from Supabase Dashboard

1. Still in **Project Settings** → **Auth**
2. Find **"Send Test Email"** button (if available)
3. Enter your email address
4. Click **Send**
5. Check your inbox (and spam folder!)

### Test 2: Register New User

1. Go to your app
2. Try registering with a **real email address**
3. Watch for the beautiful "Check Your Email" dialog
4. Check your inbox for confirmation email
5. Should arrive within **1-2 minutes**

---

## Important Notes About Free Email

### ⚠️ Limitations of Supabase Free Email:

- **Rate Limit:** ~3-4 emails per hour per project
- **Delivery:** May take 1-5 minutes to arrive
- **Spam Risk:** Higher chance of going to spam (no custom domain)
- **Reliability:** Less reliable than custom SMTP

### ✅ Good For:
- Development and testing
- Small apps with few users
- Prototype/MVP stage
- Learning and experimentation

### ❌ Not Good For:
- Production apps
- High-volume signups
- Time-sensitive emails
- Professional branding

---

## Troubleshooting

### Problem 1: Email Not Arriving

**Check:**
1. Spam/Junk folder - Supabase emails often go here
2. Wait 5 minutes - Free service can be slow
3. Check rate limit - Try again in an hour if you hit the limit
4. Verify email address - Make sure it's valid

### Problem 2: Email Goes to Spam

**Solutions:**
1. Add sender to contacts: `noreply@mail.app.supabase.io`
2. Mark as "Not Spam"
3. Check spam score (forward to mail-tester.com)
4. For production, use custom SMTP with verified domain

### Problem 3: Template Not Working

**Check:**
1. Template includes `{{ .ConfirmationURL }}` variable
2. Template is valid HTML
3. Template is saved in Supabase dashboard
4. Using the correct template (Confirm signup, not Reset password)

### Problem 4: Hit Rate Limit

**Symptoms:**
- First few emails work
- Then emails stop coming
- Error in logs about rate limit

**Solution:**
- Wait 1 hour
- OR disable email confirmation temporarily
- OR upgrade to custom SMTP (no rate limits)

---

## Quick Copy-Paste Email Templates

If you don't want to use the files, here's a simple template:

### Simple Confirmation Email

```html
<h2>Welcome to ADAZE Kenya! 🎉</h2>

<p>Hi there!</p>

<p>Thanks for signing up! Please confirm your email address to get started.</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Confirm Email Address
  </a>
</p>

<p>Or copy and paste this link:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link expires in 60 minutes.</p>

<hr>
<p style="color: #666; font-size: 12px;">
  If you didn't create an account, you can safely ignore this email.
</p>
```

---

## Testing Checklist

- [ ] Email confirmations enabled in Supabase
- [ ] Custom SMTP disabled (using Supabase built-in)
- [ ] Email template uploaded with `{{ .ConfirmationURL }}`
- [ ] Template saved in Supabase dashboard
- [ ] Test email sent successfully
- [ ] Email received (check spam!)
- [ ] Confirmation link works
- [ ] Can login after confirming

---

## What Happens Now

### User Flow:
1. User fills registration form
2. Submits → Account created
3. Beautiful dialog shows: "Check Your Email!"
4. Email arrives (1-5 minutes, check spam)
5. User clicks confirmation link
6. Account verified!
7. User can sign in

### Email Timeline:
- **Instant:** Account created
- **0-5 mins:** Email arrives (usually 1-2 mins)
- **60 mins:** Link expires
- **Can resend:** User clicks "Resend" in dialog

---

## Next Steps

1. **Enable email confirmations** in Supabase (Step 1 above)
2. **Upload confirmation template** (Step 2 above)
3. **Disable custom SMTP** if enabled (Step 3 above)
4. **Test registration** (Step 4 above)
5. **Check spam folder** if email doesn't arrive in 5 minutes

---

## When to Upgrade to SMTP

Consider custom SMTP (SendGrid/Mailgun) when:
- You're launching to real users
- You hit rate limits often
- Emails go to spam too much
- You need faster delivery
- You want professional branding (@adaze.com)

But for now, **Supabase free email is perfect for development!** 🚀

---

## Summary

✅ **What we're doing:**
- Using Supabase's built-in free email service
- Not setting up SMTP
- Using your beautiful email templates
- Perfect for development/testing

✅ **What you need to do:**
1. Enable email confirmations in Supabase
2. Upload email template to Supabase dashboard
3. Make sure custom SMTP is disabled
4. Test registration!

That's it! Simple and free. 🎉
