# 🔧 Registration Issue - Complete Fix Guide

## 🐛 Problem Identified

Users cannot create new accounts. The issue is a **missing INSERT policy** on the `profiles` table.

**Root Cause:**
- When users sign up, Supabase auth creates a user in `auth.users`
- A trigger function `handle_new_user()` tries to insert a profile into `public.profiles`
- But there's NO INSERT policy allowing this insert, even though the function has SECURITY DEFINER
- Result: Registration fails silently or with permission error

---

## ✅ Solution: Quick Fix

### Step 1: Run the SQL Fix

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file: `fix-registration-policies.sql`
3. Copy all the SQL and paste it into the editor
4. Click **Run** or press `Ctrl+Enter` / `Cmd+Enter`

**What it does:**
- Adds missing INSERT policy for profiles table
- Verifies trigger function exists
- Shows all current policies
- Tests database setup

**Expected Output:**
```
✅ handle_new_user function exists
✅ on_auth_user_created trigger exists
✅ New INSERT policy created
```

---

### Step 2: Check Supabase Auth Settings

**Important:** If email confirmation is required but not set up, users can't complete registration.

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**

2. **Check Email Confirmation:**
   - Look for "Enable email confirmations"
   - **Option A (Recommended for Development):**
     - ❌ Disable email confirmations
     - OR ✅ Enable "Auto Confirm Users"
   - **Option B (For Production):**
     - ✅ Enable email confirmations
     - ✅ Set up SMTP settings (email provider)
     - Configure email templates

3. **Check Email Provider:**
   - **Development:** Use Supabase's built-in (limited emails per day)
   - **Production:** Set up custom SMTP:
     - Gmail
     - SendGrid
     - AWS SES
     - Mailgun
     - etc.

4. **Check Site URL:**
   - Should match your deployment URL
   - Example: `https://adaze.netlify.app` or `http://localhost:3000`

---

### Step 3: Test Registration

1. **Open your app** in a browser
2. Click **"Get Started"** or **"Sign Up"**
3. Fill in the registration form:
   - Choose account type (Buyer/Trader/Transporter)
   - Enter all required fields
   - Agree to terms
4. Click **"Create Account"**

**Expected Behavior:**
- ✅ Success toast: "Account created successfully!"
- ✅ Redirects to `/dashboard`
- ✅ User is logged in

**If Still Fails:**
- Check browser console (F12 → Console tab)
- Check Network tab (F12 → Network tab) for API errors
- Check Supabase Logs (Dashboard → Logs → Postgres Logs)

---

## 🔍 Troubleshooting

### Error: "New row violates row-level security policy"

**Problem:** INSERT policy not created correctly

**Fix:**
1. Run `fix-registration-policies.sql` again
2. Check output - should see "✅ Allow profile creation on signup"
3. Verify with this query:
```sql
SELECT policyname FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'INSERT';
```

Should return: `Allow profile creation on signup`

---

### Error: "Email already registered" or "User already exists"

**Problem:** Email address was already used in a failed registration attempt

**Fix Option 1 (Recommended):**
- Try a different email address

**Fix Option 2 (Delete the user):**
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find the user with that email
3. Delete the user
4. Try registering again

---

### Error: "Check your email to confirm"

**Problem:** Email confirmation is enabled but email not sent

**Fix:**
1. **For Development:**
   - Disable email confirmation in Auth Settings
   - OR enable "Auto Confirm Users"

2. **For Production:**
   - Set up proper SMTP in Auth Settings
   - Configure email templates
   - Test email delivery

---

### No Error, Just Nothing Happens

**Problem:** JavaScript error or API not responding

**Fix:**
1. Open browser console (F12 → Console)
2. Look for red error messages
3. Check Network tab for failed API calls
4. Common issues:
   - Supabase URL/keys incorrect in `.env.local`
   - API route not working
   - CORS issues

---

## 📋 Complete Checklist

Run through this checklist to ensure everything is set up:

### Database Setup:
- [ ] `supabase-setup.sql` has been run
- [ ] `handle_new_user()` function exists
- [ ] `on_auth_user_created` trigger exists
- [ ] `fix-registration-policies.sql` has been run
- [ ] INSERT policy exists on profiles table

### Supabase Auth Settings:
- [ ] Email confirmation is disabled (dev) OR properly configured (prod)
- [ ] Auto-confirm users is enabled (optional for dev)
- [ ] Site URL matches your deployment
- [ ] SMTP is configured (if email confirmation enabled)

### Frontend:
- [ ] Auth modal opens when clicking "Get Started"
- [ ] All form fields are required
- [ ] Terms checkbox is required
- [ ] Password validation works (min 6 characters)
- [ ] Password confirmation matches

### Environment Variables:
- [ ] `.env.local` has correct NEXT_PUBLIC_SUPABASE_URL
- [ ] `.env.local` has correct NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] No quotes around values in `.env.local`

---

## 🧪 Testing

### Test Case 1: New User Registration
1. Use a NEW email address (not used before)
2. Fill all required fields
3. Select account type (Buyer/Trader/Transporter)
4. Agree to terms
5. Click "Create Account"

**Expected:**
- Success message appears
- Redirect to dashboard
- User is logged in
- Profile created in database

### Test Case 2: Check Database
After successful registration:
```sql
-- Check if user was created
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 1;

-- Check if profile was created
SELECT id, full_name, role, created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 1;
```

Both queries should show the new user.

### Test Case 3: Duplicate Email
1. Try registering with the SAME email again

**Expected:**
- Error message: "User already exists" or similar
- Registration blocked

---

## 🚀 Quick Start Commands

### 1. Run the SQL Fix:
```bash
# Copy this file's contents:
cat fix-registration-policies.sql

# Go to Supabase Dashboard > SQL Editor
# Paste and run
```

### 2. Check Logs (if still failing):
```bash
# In Supabase Dashboard:
# Logs > Postgres Logs
# Look for "permission denied" or "policy violation"
```

### 3. Test Registration:
```bash
# Open your app
# Click "Get Started"
# Fill form and submit
```

---

## 📊 Database Policies Reference

After running the fix, your `profiles` table should have these policies:

| Policy Name | Command | Description |
|------------|---------|-------------|
| Users can view own profile | SELECT | Users can see their own profile |
| Service role can view all profiles | SELECT | Admin can see all profiles |
| Users can update own profile | UPDATE | Users can edit their profile |
| Service role can update any profile | UPDATE | Admin can edit any profile |
| **Allow profile creation on signup** | **INSERT** | **Trigger can create new profiles** ✅ |

---

## 🔐 Security Notes

**Why we need the INSERT policy:**

Even though `handle_new_user()` has `SECURITY DEFINER` (which should bypass RLS), PostgreSQL still requires proper policies for audit and security compliance.

**The INSERT policy:**
```sql
CREATE POLICY "Allow profile creation on signup" ON public.profiles
  FOR INSERT 
  WITH CHECK (true);
```

This is safe because:
1. Only the trigger function can insert (controlled server-side)
2. Regular users can't call this policy directly
3. The trigger validates all data before insert
4. RLS still protects SELECT, UPDATE, DELETE operations

---

## ✅ Success Indicators

After the fix, you should see:

### In Supabase Dashboard:
- ✅ New users appear in Authentication > Users
- ✅ New profiles appear in Table Editor > profiles
- ✅ No errors in Logs > Postgres Logs

### In Your App:
- ✅ Registration form submits successfully
- ✅ Success toast notification appears
- ✅ Redirect to dashboard works
- ✅ User is logged in
- ✅ User data displays correctly

### In Browser Console:
- ✅ No red error messages
- ✅ API calls return 200 status
- ✅ No CORS errors
- ✅ No authentication errors

---

## 📞 Still Not Working?

If registration still fails after trying everything above:

1. **Check Exact Error Message:**
   - Browser console (F12)
   - Network tab (look for failed API calls)
   - Supabase Logs (Dashboard > Logs)

2. **Share Error Details:**
   - Exact error message
   - Screenshots if possible
   - Steps to reproduce

3. **Common Overlooked Issues:**
   - `.env.local` file not loaded (restart dev server)
   - Wrong Supabase URL/keys
   - Ad blocker blocking requests
   - Browser extensions interfering
   - Cache issues (hard refresh: Ctrl+Shift+R / Cmd+Shift+R)

---

## 🎯 Summary

**The Fix:**
1. ✅ Run `fix-registration-policies.sql` in Supabase SQL Editor
2. ✅ Disable email confirmation (or set up SMTP)
3. ✅ Test registration with a new email
4. ✅ Verify user and profile created in database

**Time Required:** 2-5 minutes

**Result:** Users can now successfully create accounts! 🎉

---

**After fixing, your registration flow should be:**
1. User fills registration form
2. API calls `/api/auth/register`
3. Supabase creates user in `auth.users`
4. Trigger `on_auth_user_created` fires
5. Function `handle_new_user()` inserts profile into `public.profiles` ✅ (now with INSERT policy!)
6. Success response returned
7. User logged in and redirected

**Problem solved!** 🚀
