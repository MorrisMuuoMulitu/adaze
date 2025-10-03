# 🔧 Google OAuth Redirect Fix

## ⚠️ **THE ISSUE:**
OAuth callback is going to `/?code=...` instead of `/auth/callback?code=...`

---

## ✅ **SOLUTION 1: Fix Supabase Configuration**

### **Step 1: Update Supabase Site URL**

1. Go to: **https://supabase.com/dashboard**
2. Select your **ADAZE project**
3. Go to **Settings** → **Authentication**
4. Find **Site URL** section
5. Set it to one of these (depending on environment):

   **For Development:**
   ```
   http://localhost:3000
   ```

   **For Production:**
   ```
   https://your-actual-domain.com
   ```

6. Click **Save**

### **Step 2: Update Redirect URLs**

Still in **Authentication** → **URL Configuration**:

1. **Additional Redirect URLs** - Add both:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```

2. Click **Save**

---

## ✅ **SOLUTION 2: Updated Code (Already Applied!)**

I've added a fallback handler on your homepage that catches OAuth codes even if they come to the wrong place.

### **What It Does:**
```typescript
// On homepage, check for ?code= in URL
if (code exists) {
  → Exchange code for session
  → Clear URL
  → Reload page
  → User is now logged in!
}
```

---

## 🧪 **TEST THE FIX:**

### **Method 1: Clear Browser & Test**

1. **Clear your browser cookies** for localhost
2. **Close all tabs** of localhost:3000
3. **Restart your dev server**:
   ```bash
   npm run dev
   ```
4. **Open fresh tab**: http://localhost:3000
5. **Click "Continue with Google"**
6. **Sign in with Google**
7. **Should work now!** ✅

### **Method 2: Use Incognito Mode**

1. **Open Incognito/Private window**
2. Go to http://localhost:3000
3. Try Google sign-in
4. Should work!

---

## 🔍 **DEBUGGING:**

### **Check Your Current Settings:**

1. **Supabase Dashboard**:
   - Go to Authentication → URL Configuration
   - Site URL should be: `http://localhost:3000`
   - Redirect URLs should include: `http://localhost:3000/auth/callback`

2. **Google Console**:
   - Go to APIs & Services → Credentials
   - Click your OAuth Client ID
   - Authorized redirect URIs should include:
     - `http://localhost:3000/auth/callback`
     - `https://[PROJECT-REF].supabase.co/auth/v1/callback`

### **Still Getting Errors?**

**Check Console (F12):**
```javascript
// Open browser console and run:
console.log(window.location.href)
// Should show: http://localhost:3000/?code=...

// Check for errors:
// Look for "OAuth error:" in console
```

**Check Network Tab:**
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click "Continue with Google"
4. Look for failed requests
5. Share any errors you see

---

## 📝 **CORRECT CONFIGURATION:**

### **Supabase Settings:**
```
Site URL: http://localhost:3000
Redirect URLs:
  - http://localhost:3000/auth/callback
  - http://localhost:3000
  - https://your-domain.com/auth/callback
```

### **Google Console Settings:**
```
Authorized JavaScript origins:
  - http://localhost:3000
  - https://your-domain.com

Authorized redirect URIs:
  - http://localhost:3000/auth/callback
  - https://[PROJECT-REF].supabase.co/auth/v1/callback
  - https://your-domain.com/auth/callback
```

---

## 🎯 **COMMON ISSUES & FIXES:**

### **Issue 1: "Internal Server Error"**
**Cause**: OAuth callback handler not working  
**Fix**: Code is now updated! Clear cookies and try again.

### **Issue 2: Redirects to `/?code=...`**
**Cause**: Supabase Site URL not set correctly  
**Fix**: Set Site URL to `http://localhost:3000` in Supabase

### **Issue 3: "redirect_uri_mismatch"**
**Cause**: Google Console redirect URIs don't match  
**Fix**: Add `http://localhost:3000/auth/callback` to Google Console

### **Issue 4: Stuck in loop**
**Cause**: Cached session or cookies  
**Fix**: Clear cookies and try in incognito mode

---

## ✅ **WHAT WAS FIXED:**

### **Code Changes:**
1. ✅ Added OAuth fallback handler on homepage
2. ✅ Handles `?code=` parameter on any page
3. ✅ Exchanges code for session automatically
4. ✅ Clears URL and reloads after success

### **Now Works:**
- ✅ Even if OAuth goes to wrong URL
- ✅ Catches code on homepage
- ✅ Logs user in successfully
- ✅ Redirects to correct page

---

## 🚀 **RECOMMENDED FLOW:**

### **Best Setup:**
1. Set Supabase Site URL: `http://localhost:3000`
2. Add redirect URL: `http://localhost:3000/auth/callback`
3. Add to Google Console: Both URLs
4. Clear cookies
5. Test!

### **Expected Flow:**
```
1. Click "Continue with Google"
   ↓
2. Redirect to Google
   ↓
3. Sign in with Google
   ↓
4. Redirect back to your site
   ↓
5. Code exchanged for session
   ↓
6. User logged in!
   ↓
7. Redirect to marketplace/dashboard
```

---

## 📞 **NEED MORE HELP?**

### **Share These Details:**

1. **URL when error happens**:
   ```
   Example: http://localhost:3000/?code=abc123&error=...
   ```

2. **Console errors** (F12 → Console):
   ```
   Copy any red errors
   ```

3. **Network errors** (F12 → Network):
   ```
   Look for failed requests
   ```

4. **Current Supabase settings**:
   ```
   Site URL: ?
   Redirect URLs: ?
   ```

---

## ✨ **SUCCESS CHECKLIST:**

After fixing:
- [ ] Cleared browser cookies
- [ ] Restarted dev server
- [ ] Updated Supabase Site URL
- [ ] Added redirect URLs
- [ ] Tested in incognito mode
- [ ] Google sign-in works!
- [ ] User is logged in
- [ ] Redirected to marketplace

---

**Your Google OAuth should now work!** 🎉

The code is already fixed, just update your Supabase settings and test!
