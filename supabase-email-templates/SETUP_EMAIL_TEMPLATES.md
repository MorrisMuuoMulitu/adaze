# 📧 Setup Beautiful Email Templates in Supabase

## 🎯 Templates Available

We have **4 beautiful email templates** ready for you:

1. **Confirmation Email** (`confirmation-email.html`) - For new signups
2. **Invite Email** (`invite-email.html`) - For inviting new users
3. **Change Email** (`change-email.html`) - For email address changes
4. **Reset Password** (`reset-password.html`) - For password resets

---

## 📧 Template 1: Confirmation Email

### **Step 1: Copy the Email Template**

1. Open `confirmation-email.html` in this folder
2. Copy **ALL the code** (Ctrl+A, Ctrl+C)

### **Step 2: Add to Supabase**

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Email Templates**
3. Find **"Confirm signup"** template
4. **Paste** the entire HTML code
5. Click **Save** ✅

---

## 💌 Template 2: Invite Email

### **Step 1: Copy the Invite Template**

1. Open `invite-email.html` in this folder
2. Copy **ALL the code** (Ctrl+A, Ctrl+C)

### **Step 2: Add to Supabase**

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Email Templates**
3. Find **"Invite user"** template
4. **Paste** the entire HTML code
5. Click **Save** ✅

---

## 📋 Available Variables

These Supabase variables work in the template:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{ .ConfirmationURL }}` | Confirmation link | `https://your-app.com/auth/callback?token=...` |
| `{{ .SiteURL }}` | Your app URL | `https://your-app.com` |
| `{{ .Email }}` | User's email | `user@example.com` |
| `{{ .Token }}` | Confirmation token | `abc123...` |

---

## 🎨 Customization Options

### **Change Brand Colors**

In the template, replace these color codes:

**Primary Green (Buttons, Header):**
```css
background: linear-gradient(135deg, #16a34a 0%, #059669 100%);
```

**Change to your brand color:**
```css
background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR2 100%);
```

---

### **Change Logo Text**

Find this line:
```html
<h1 class="logo">ADAZE</h1>
```

Or add an image logo:
```html
<img src="https://your-site.com/logo.png" alt="ADAZE" style="height: 50px;">
```

---

### **Change Tagline**

Find:
```html
<p class="tagline">Kenya's Premier Mitumba Marketplace</p>
```

Change to your own tagline!

---

### **Modify Features List**

Find the `<ul class="features">` section and edit:
```html
<ul class="features">
  <li>Your feature 1</li>
  <li>Your feature 2</li>
  <li>Your feature 3</li>
</ul>
```

---

## 💼 Template 3: Change Email

### **Step 1: Copy the Template**

1. Open `change-email.html` in this folder
2. Copy **ALL the code** (Ctrl+A, Ctrl+C)

### **Step 2: Add to Supabase**

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Email Templates**
3. Find **"Change Email Address"** template
4. **Paste** the entire HTML code
5. Click **Save** ✅

---

## 🔒 Template 4: Reset Password

### **Step 1: Copy the Template**

1. Open `reset-password.html` in this folder
2. Copy **ALL the code** (Ctrl+A, Ctrl+C)

### **Step 2: Add to Supabase**

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Email Templates**
3. Find **"Reset Password"** template
4. **Paste** the entire HTML code
5. Click **Save** ✅

---

## 🎨 Template Comparison

### **Confirmation Email Features:**
- ✅ "Karibu to ADAZE!" greeting
- ✅ Large confirmation button
- ✅ Features list (5 items)
- ✅ 24-hour expiration notice
- ✅ Security message
- ✅ Clean, professional design

### **Invite Email Features:**
- ✅ "You're Invited!" greeting with emoji
- ✅ Special invitation badge (orange)
- ✅ Invitation card (green gradient)
- ✅ Benefits section (gold gradient)
- ✅ "Why ADAZE" features
- ✅ 7-day expiration notice
- ✅ More engaging, celebratory design

### **Change Email Features:**
- ✅ "Confirm Email Change" greeting
- ✅ Security badge (blue)
- ✅ Email comparison card (old → new)
- ✅ Multiple security warnings
- ✅ "What happens next" list
- ✅ 24-hour expiration notice
- ✅ Professional, security-focused design

### **Reset Password Features:**
- ✅ "Reset Your Password" greeting
- ✅ Password reset badge (purple)
- ✅ Key icon 🔑
- ✅ Red/orange urgent design
- ✅ Password tips section (green box)
- ✅ 60-minute expiration notice
- ✅ "Didn't request?" warning
- ✅ Helpful, action-oriented design

---

## 🌍 Other Email Templates to Customize

### **3. Magic Link Email**
Template name: **"Magic Link"**

Use the confirmation email template, just change:
- Title: "Sign in to ADAZE"
- Button text: "Sign In Now"
- Message: "Click the button below to sign in to your account"

---

### **4. Password Reset Email**
Template name: **"Reset Password"**

Use the confirmation email template, change:
- Title: "Reset Your Password"
- Button text: "Reset Password"
- Security note: "If you didn't request this, ignore this email"

---

### **5. Email Change Confirmation**
Template name: **"Change Email Address"**

Use the confirmation email template, change:
- Title: "Confirm Your New Email"
- Message: "You requested to change your email address"

---

## 📱 Email Preview

The template is **fully responsive** and looks great on:
- ✅ Gmail (Desktop & Mobile)
- ✅ Outlook (Desktop & Mobile)
- ✅ Apple Mail (iOS & macOS)
- ✅ Yahoo Mail
- ✅ Android Email Clients

---

## 🧪 How to Test the Email

### **Method 1: Send Test Email**

In Supabase:
1. Go to **Authentication** → **Users**
2. Click **Invite User**
3. Enter a test email address
4. Check your inbox!

---

### **Method 2: Register on Your App**

1. Enable email confirmations in Supabase
2. Register with a real email
3. Check your inbox
4. See the beautiful email! 🎉

---

## 🎨 Design Features

Your new email template has:

✅ **Professional Design**
- Modern gradient header
- Clean layout
- Clear call-to-action button

✅ **Brand Elements**
- ADAZE logo and colors
- Kenya-themed messaging
- Mitumba marketplace context

✅ **User-Friendly**
- Large, clickable button
- Alternative text link (if button doesn't work)
- Clear instructions

✅ **Security**
- Expiration notice (24 hours)
- "Ignore if you didn't sign up" message
- Professional footer

✅ **Mobile Responsive**
- Looks perfect on all screen sizes
- Touch-friendly buttons
- Readable text sizes

✅ **Trust Signals**
- Contact information
- Social media links
- Copyright notice

---

## 🔧 Troubleshooting

### **Issue: Template doesn't save**
- Make sure you copied the ENTIRE template
- Check for any missing `<` or `>` characters
- Try copying in smaller sections

---

### **Issue: Styles don't appear**
- Email clients strip some styles
- The template uses inline styles (safe)
- Test in multiple email clients

---

### **Issue: Links don't work**
- Make sure `{{ .ConfirmationURL }}` is included
- Check your Site URL in Supabase settings
- Verify redirect URLs are configured

---

## 💡 Pro Tips

### **Tip 1: Brand Consistency**
Use the same colors from your website:
- Green: `#16a34a` (from your ADAZE brand)
- Match button colors to your navbar

---

### **Tip 2: Personalization**
Add user's name if available:
```html
<h2 class="greeting">Karibu, {{ .UserMetaData.first_name }}! 🎉</h2>
```

---

### **Tip 3: A/B Testing**
Try different:
- Button text ("Confirm Email" vs "Activate Account")
- Colors (Green vs Orange)
- Messages (Short vs Detailed)

---

### **Tip 4: Localization**
Add Swahili version:
```html
<p class="message">
  Asante kwa kujiunga na ADAZE! Thibitisha barua pepe yako kwa kubofya kitufe hapo chini.
</p>
```

---

## 🚀 Quick Setup Checklist

- [ ] Copy `confirmation-email.html` template
- [ ] Go to Supabase → Authentication → Email Templates
- [ ] Paste into "Confirm signup" template
- [ ] Customize logo, colors, and text
- [ ] Click Save
- [ ] Test with a real signup
- [ ] Check email inbox
- [ ] Celebrate! 🎉

---

## 📧 Result

Before:
```
Subject: Confirm your signup

Follow this link to confirm your user:
[Confirm your mail]
```

After:
```
Subject: Welcome to ADAZE - Confirm Your Email

[Beautiful, branded email with:]
- Professional header with logo
- Personalized greeting
- Large, colorful button
- Features list
- Security information
- Contact details
- Social media links
- Mobile responsive design
```

**Your confirmation emails will now look DOPE! 🔥**

---

Need help customizing? Let me know what you want to change!
