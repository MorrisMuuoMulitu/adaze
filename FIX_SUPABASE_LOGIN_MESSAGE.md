# Fix Supabase Login Message

## Current Issue
When logging in with Google, users see:
> "You're signing back in to jvpqalrnfyzsnqmtnqlf.supabase.co"

This should show "Adaze" or your custom domain instead.

---

## Solution: Update Site URL in Supabase

### Step 1: Go to Supabase Dashboard

1. Open https://supabase.com/dashboard
2. Select your **ADAZE** project
3. Go to **Settings** (left sidebar)
4. Click **Authentication**

---

### Step 2: Update Site URL

Find the **"Site URL"** field and update it to your production URL:

**Option 1 - If using custom domain:**
```
https://adaze.com
```

**Option 2 - If using Netlify subdomain:**
```
https://adaze.netlify.app
```

**For Development (optional):**
```
http://localhost:3000
```

---

### Step 3: Verify Additional Redirect URLs

Make sure these are in **"Additional Redirect URLs"** section:

```
http://localhost:3000
http://localhost:3000/auth/callback
https://adaze.netlify.app
https://adaze.netlify.app/auth/callback
https://adaze.com
https://adaze.com/auth/callback
```

---

### Step 4: Save Changes

1. Scroll to bottom
2. Click **Save**
3. Wait 2-3 minutes for changes to propagate

---

## Result

After updating, when users log in with Google, they will see:
> "You're signing in to adaze.com" 

or

> "You're signing in to adaze.netlify.app"

Much better! ✅

---

## Why This Happens

Supabase uses the **Site URL** setting as the primary domain identifier for OAuth flows. By default, it shows the Supabase project URL, but you can customize it to your own domain.

---

## Note

- This change affects **all authentication flows** (Google, email, etc.)
- It's purely a display change for better user experience
- No code changes needed in your app
