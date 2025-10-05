# Google OAuth - Authorized Domains to Add

## Current Status
You have 3 empty authorized domain slots in Google OAuth consent screen.

---

## ✅ Domains to Add

Fill in these **exact values** (without http:// or https://):

### **Authorized domain 1:**
```
supabase.co
```

### **Authorized domain 2:**
```
adaze.netlify.app
```

### **Authorized domain 3:**
```
netlify.app
```
(or if you have a custom domain: `adaze.com`)

---

## 📝 Step-by-Step

1. In Google Cloud Console → OAuth consent screen → **EDIT APP**
2. Scroll to **Authorized domains** section
3. In the **"Authorized domain 1"** field, type: `supabase.co`
4. Press **Tab** or click to the next field
5. In the **"Authorized domain 2"** field, type: `adaze.netlify.app`
6. Press **Tab** or click to the next field
7. In the **"Authorized domain 3"** field, type: `netlify.app`
8. Scroll down and click **SAVE AND CONTINUE**
9. Continue through remaining steps
10. Click **BACK TO DASHBOARD**

---

## ⚠️ Important Notes

### Format:
- ✅ **Correct:** `supabase.co` (domain only)
- ❌ **Wrong:** `https://supabase.co` (no protocol)
- ❌ **Wrong:** `jvpqalrnfyzsnqmtnqlf.supabase.co` (no subdomain)

### Why These Domains:

**1. `supabase.co`**
- Your OAuth flow redirects through Supabase's authentication system
- The callback URL is: `https://jvpqalrnfyzsnqmtnqlf.supabase.co/auth/v1/callback`
- Adding the parent domain `supabase.co` authorizes ALL Supabase subdomains
- **This is the critical one** that fixes the login message

**2. `adaze.netlify.app`**
- Your production app domain
- Where users actually interact with your app
- Good practice to authorize your own domain

**3. `netlify.app`**
- Parent domain for Netlify sites
- Authorizes any Netlify subdomain you might use
- Useful for staging/preview deployments

---

## 🎯 Expected Result

**Before (without authorized domains):**
> "You're signing back in to jvpqalrnfyzsnqmtnqlf.supabase.co"

**After (with authorized domains):**
> "Continue to ADAZE"

---

## 🧪 Testing After Adding

1. **Click SAVE AND CONTINUE** in Google Console
2. **Wait 1-2 minutes** for changes to propagate
3. **Log out** of your app completely
4. **Clear browser cookies** (or use incognito mode)
5. Try **logging in with Google** again
6. Should now show: **"Continue to ADAZE"** ✅

---

## 🔍 Verification

To verify domains were added correctly:

1. Go back to **OAuth consent screen**
2. Scroll to **Authorized domains** section
3. You should see:
   - ✅ supabase.co
   - ✅ adaze.netlify.app
   - ✅ netlify.app

---

## 💡 If You Have a Custom Domain

If you've set up `adaze.com` (custom domain):

**Replace "Authorized domain 3" with:**
```
adaze.com
```

**Or add a 4th domain if Google allows:**
```
adaze.com
```

---

## ❓ Common Questions

### Q: Why do I need supabase.co?
**A:** Because your OAuth callback goes through Supabase's server (`jvpqalrnfyzsnqmtnqlf.supabase.co`). Without authorizing the parent domain, Google shows the full URL as a security warning.

### Q: Can I use the full subdomain?
**A:** Google only accepts the **parent domain** (e.g., `supabase.co`, not `jvpqalrnfyzsnqmtnqlf.supabase.co`). This is intentional - it authorizes all subdomains under that parent.

### Q: How long until changes take effect?
**A:** Usually **immediate**, but Google recommends waiting 2-5 minutes. Clear cookies or use incognito to see changes right away.

### Q: What if I still see the Supabase URL?
**A:** 
1. Make sure you clicked **SAVE AND CONTINUE**
2. Wait 5 minutes
3. Clear all browser cookies
4. Try in a different browser or incognito mode
5. Verify domains were actually saved (check OAuth consent screen again)

---

## ✅ Quick Checklist

- [ ] Open Google Cloud Console
- [ ] Go to APIs & Services → OAuth consent screen
- [ ] Click EDIT APP
- [ ] Scroll to Authorized domains
- [ ] Add `supabase.co` in domain 1
- [ ] Add `adaze.netlify.app` in domain 2
- [ ] Add `netlify.app` in domain 3
- [ ] Click SAVE AND CONTINUE
- [ ] Wait 2-5 minutes
- [ ] Test login with Google
- [ ] Confirm message shows "ADAZE" ✅

---

## 🎉 You're All Set!

Once you add these domains and save, your Google login will show your app name "ADAZE" instead of the Supabase technical URL. This makes it much more professional and trustworthy for your users!
