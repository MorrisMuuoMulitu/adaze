# 🔧 Fix SMTP Email Configuration - Quick Guide

## Problem
Email confirmations are enabled but SMTP isn't configured, so Supabase can't send emails.

## Quick Fix Option 1: Disable Email Verification (1 minute)

**For immediate testing:**

1. Go to **Supabase Dashboard** → Your Project
2. **Authentication** → **Providers** (or Settings)
3. Find **"Email"** provider section
4. Find **"Enable email confirmations"**
5. **Toggle it OFF**
6. Click **Save**

✅ **Done!** Users can now sign up and login without email verification.

---

## Proper Fix Option 2: Configure SendGrid SMTP (15 minutes)

**For production-ready email:**

### Step 1: Create SendGrid Account (Free)

1. Go to https://sendgrid.com/free
2. Sign up (100 free emails/day forever)
3. Verify your email address

### Step 2: Create API Key

1. In SendGrid dashboard, go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Name: "ADAZE-Supabase"
4. Permission: **"Full Access"** or **"Mail Send"**
5. Click **"Create & View"**
6. **COPY THE KEY** (you won't see it again!)

### Step 3: Verify Sender Email

1. Go to **Settings** → **Sender Authentication**
2. Click **"Single Sender Verification"**
3. Fill in:
   - From Name: **ADAZE Kenya**
   - From Email: **Your email** (can be Gmail for now)
   - Reply To: **support@adaze.com** (or your email)
4. Click **Create**
5. Check your email and **click the verification link**

### Step 4: Add SMTP to Supabase

1. Go to **Supabase Dashboard** → **Project Settings** → **Auth**
2. Scroll to **"SMTP Settings"**
3. Toggle **"Enable Custom SMTP"** to ON
4. Fill in:
   ```
   Host: smtp.sendgrid.net
   Port: 587 (or 465 for SSL)
   Username: apikey
   Password: [Paste your SendGrid API key]
   Sender email: [Your verified email from Step 3]
   Sender name: ADAZE Kenya
   ```
5. Click **Save**
6. Click **"Send Test Email"** to verify it works

### Step 5: Test Registration

1. Go to your app
2. Register a new account with a real email
3. Check your inbox for verification email
4. Click the link to verify
5. Sign in successfully!

---

## Which Option Should You Choose?

### Choose Option 1 (Disable) If:
- ✅ You're developing/testing
- ✅ You need to test app features now
- ✅ You'll set up proper email later

### Choose Option 2 (SMTP) If:
- ✅ You're going to production
- ✅ You need email verification for security
- ✅ You want professional email delivery

---

## Current Situation

Based on your email templates folder, you already have:
- ✅ Beautiful email templates created
- ✅ Anti-spam fixes applied
- ❌ SMTP configuration incomplete

You likely:
1. Started setting up custom SMTP
2. Didn't finish the configuration
3. Now emails aren't being sent

**Fix:** Complete the SMTP setup (Option 2) OR disable email confirmation (Option 1)

---

## After Setup

Once you choose and complete either option:

**If Option 1 (Disabled):**
- Users register instantly
- No email verification needed
- Can start using app immediately

**If Option 2 (SMTP Configured):**
- Users register → see beautiful "Check Your Email" dialog
- Receive professional email from ADAZE
- Click link to verify
- Sign in and start shopping!

---

## Need Help?

Tell me which option you want:
1. **Quick disable** - I'll guide you to the exact Supabase setting
2. **SMTP setup** - I'll walk you through SendGrid step-by-step

Both work perfectly - just depends on your needs right now! 🚀
