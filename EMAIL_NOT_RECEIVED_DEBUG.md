# 📧 Email Not Received - Complete Troubleshooting Guide

## 🔍 Why Confirmation Emails Aren't Being Sent

Based on your logs showing `needsConfirmation: true`, the user was created but no email arrived. Here's how to fix it:

---

## ✅ Quick Fix Options

### **Option A: Disable Email Confirmation (Immediate Fix)**

**Best for:** Development, testing, getting unblocked NOW

**Steps:**
1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll to **"Email"** section
3. Find **"Enable email confirmations"**
4. **Toggle it OFF** (disable it)
5. Click **Save** (if there's a save button)

**Result:** New users can sign up and login immediately without email confirmation

**OR Alternative:**
1. In the same section, find **"Enable email confirmations"**
2. Keep it ON, but find **"Enable automatic confirmation"** or **"Auto Confirm Users"**
3. **Toggle it ON**
4. Save

**Result:** Users are auto-confirmed, no email needed

---

### **Option B: Configure SMTP (Proper Solution)**

**Best for:** Production, professional deployment

Supabase's built-in email service has **limits**:
- ⚠️ Only sends a few emails per hour
- ⚠️ Low rate limits for free tier
- ⚠️ May not deliver consistently
- ⚠️ Often goes to spam

**You need to set up custom SMTP:**

---

## 🔧 Configure Custom SMTP (Recommended)

### **Step 1: Choose an Email Provider**

Pick one (all have free tiers):

1. **SendGrid** (Recommended)
   - Free: 100 emails/day
   - Easy setup
   - Great deliverability
   - Sign up: https://sendgrid.com

2. **Mailgun**
   - Free: 5,000 emails/month (first 3 months)
   - Good for developers
   - Sign up: https://mailgun.com

3. **AWS SES**
   - Very cheap ($0.10 per 1,000 emails)
   - Requires AWS account
   - More complex setup

4. **Gmail/Google Workspace**
   - Use your Gmail account
   - Limited to ~500 emails/day
   - Simple but not scalable

---

### **Step 2: Get SMTP Credentials**

After signing up with your provider, you'll need:

- **SMTP Host** (e.g., smtp.sendgrid.net)
- **SMTP Port** (usually 587 or 465)
- **SMTP Username** (often "apikey" or your email)
- **SMTP Password** (API key or app password)
- **From Email** (e.g., noreply@adaze.com)

---

### **Step 3: Add SMTP to Supabase**

1. Go to **Supabase Dashboard** → **Project Settings** → **Auth**
2. Scroll to **"SMTP Settings"** section
3. Click **"Enable Custom SMTP"**
4. Fill in the credentials:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP Username: apikey
   SMTP Password: [your SendGrid API key]
   From Email: noreply@adaze.com
   From Name: ADAZE Kenya
   ```
5. Click **Save**
6. Click **"Send Test Email"** to verify

---

## 📋 SendGrid Setup (Step-by-Step)

Since SendGrid is most popular, here's the detailed setup:

### **1. Create SendGrid Account:**
1. Go to https://sendgrid.com/free
2. Sign up (free tier: 100 emails/day)
3. Verify your email
4. Complete onboarding

### **2. Create API Key:**
1. Go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Name it "ADAZE-Supabase"
4. Choose **"Full Access"** (or "Mail Send" permission)
5. Click **Create & View**
6. **Copy the API key** (you won't see it again!)

### **3. Verify Sender Identity:**
1. Go to **Settings** → **Sender Authentication**
2. Click **"Single Sender Verification"**
3. Add your email (e.g., noreply@adaze.com or your Gmail)
4. Fill in details:
   - From Name: ADAZE Kenya
   - From Email: your email
   - Reply To: support@adaze.com
5. Click **Create**
6. Check your email and **verify**

### **4. Add to Supabase:**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: [paste your API key]
From Email: [your verified email]
From Name: ADAZE Kenya
```

### **5. Test:**
1. Click "Send Test Email" in Supabase
2. Check your inbox
3. Should receive email within seconds!

---

## 🧪 Verify Current Settings

Run this checklist to see what's wrong:

### **Check 1: Email Confirmation Status**

Go to **Supabase Dashboard** → **Authentication** → **Settings**

Look for:
```
Email
├── Enable email confirmations: ON or OFF?
├── Enable automatic confirmation: ON or OFF?
└── Confirm email: Required or Optional?
```

**What you should see:**
- If "Enable email confirmations" is **ON** → You MUST have SMTP configured
- If "Enable automatic confirmation" is **ON** → Users auto-confirmed, no email sent
- If both are **OFF** → Users don't need confirmation

---

### **Check 2: SMTP Configuration**

Go to **Supabase Dashboard** → **Project Settings** → **Auth**

Scroll to **"SMTP Settings"**:

**Option A: Using Supabase Email Service**
```
Custom SMTP: Disabled
Status: Using Supabase built-in email service
Rate Limit: Limited emails per hour
```

**Option B: Using Custom SMTP**
```
Custom SMTP: Enabled
Host: smtp.sendgrid.net (or other)
Port: 587
Username: ****
From Email: noreply@adaze.com
Status: Connected / Disconnected
```

---

### **Check 3: Email Templates**

Go to **Authentication** → **Email Templates**

Check if **"Confirm signup"** template:
- Has content (not blank)
- Has `{{ .ConfirmationURL }}` variable
- Is enabled

---

### **Check 4: Recent Logs**

Go to **Dashboard** → **Logs** → **Auth Logs**

Look for:
- Recent signup events
- Email sent events
- Any errors related to email delivery

---

## 🎯 Most Common Issues

### **Issue 1: Email Confirmation ON But No SMTP**

**Symptoms:**
- User created successfully
- `needsConfirmation: true`
- No email received
- Can't login

**Cause:**
- Email confirmations are enabled
- But no SMTP configured (or using Supabase's limited service)
- Supabase trying to send but failing silently

**Fix:**
- **Quick:** Disable email confirmations
- **Proper:** Set up custom SMTP (SendGrid, Mailgun, etc.)

---

### **Issue 2: Supabase Built-in Email Rate Limit**

**Symptoms:**
- First email was sent
- Subsequent emails not received
- Hit hourly limit

**Cause:**
- Supabase's free email service has very low rate limits
- After a few emails, it stops sending

**Fix:**
- Wait an hour and try again
- OR set up custom SMTP (no rate limits)

---

### **Issue 3: Emails Going to Spam**

**Symptoms:**
- Email was sent
- Not in inbox
- Check spam/junk folder

**Cause:**
- Email content triggers spam filters
- Sender reputation low
- No SPF/DKIM configured

**Fix:**
- Check spam folder
- Add sender to contacts
- Use custom SMTP with verified domain
- Use the anti-spam email templates we just created

---

### **Issue 4: Wrong Email Template**

**Symptoms:**
- Email sent but broken
- No confirmation link
- Template is blank

**Cause:**
- Email template not set up
- Missing `{{ .ConfirmationURL }}` variable

**Fix:**
- Go to Authentication → Email Templates
- Set up "Confirm signup" template
- Use the beautiful template we created!

---

## 🚀 Recommended Solution

### **For Development (Now):**
1. **Disable email confirmations** in Supabase Auth Settings
2. Users can sign up and login immediately
3. Test your app and iterate fast
4. No email setup needed

### **For Production (Later):**
1. **Sign up for SendGrid** (free tier)
2. **Create API key** and verify sender
3. **Configure SMTP** in Supabase
4. **Enable email confirmations**
5. **Add beautiful email templates**
6. Test email delivery
7. Launch! 🚀

---

## 🧪 Test Email Delivery

After setting up SMTP, test it:

### **Test 1: Send Test Email from Supabase**
1. Supabase → Project Settings → Auth → SMTP Settings
2. Click "Send Test Email"
3. Check your inbox (should arrive in seconds)

### **Test 2: Register New User**
1. Sign up on your app with a real email
2. Check inbox for confirmation email
3. Click confirmation link
4. Should be able to login

### **Test 3: Check Logs**
1. Supabase → Logs → Auth Logs
2. Look for "email.sent" events
3. Check for any errors

---

## 📊 Quick Decision Matrix

| Situation | Solution | Time | Cost |
|-----------|----------|------|------|
| **Testing app** | Disable email confirmation | 1 min | Free |
| **Small launch** | SendGrid free tier | 15 min | Free |
| **Growing app** | SendGrid paid ($15/mo for 40k emails) | 15 min | $15/mo |
| **Large scale** | AWS SES | 30 min | $0.10/1000 |
| **Enterprise** | Custom email server | Hours | Variable |

---

## 🎯 Immediate Action Plan

**Do this RIGHT NOW:**

1. **Check Supabase Auth Settings**
   - Is "Enable email confirmations" ON?
   - Is SMTP configured?

2. **Choose Quick Fix or Proper Fix:**
   - **Quick:** Disable email confirmations (1 minute)
   - **Proper:** Set up SendGrid SMTP (15 minutes)

3. **Test Registration:**
   - Sign up with new email
   - Should work immediately (if disabled confirmation)
   - OR receive email (if SMTP configured)

---

## 📞 Next Steps

Tell me:
1. **Current settings:** Is "Enable email confirmations" ON or OFF?
2. **SMTP status:** Using Supabase built-in or custom SMTP?
3. **What you want:** Quick fix (disable) or proper fix (SMTP)?

Then I'll guide you through the exact steps! 🚀

---

**The reason you're not getting emails is likely: Email confirmations are ON but you don't have SMTP configured. Let's fix it now!**
