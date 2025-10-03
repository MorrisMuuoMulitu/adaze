# ✅ Google Console Configured Correctly!

Your Google Console settings are perfect:

```
✓ http://localhost:3000
✓ https://adaze.netlify.app
✓ https://adaze.com

✓ http://localhost:3000/auth/callback
✓ https://adaze.com/auth/callback
✓ https://adaze.netlify.app/auth/callback
✓ https://jvpqalrnfyzsnqmtnqlf.supabase.co/auth/v1/callback
```

---

## 📋 **NOW: Configure Supabase (3 minutes)**

### **Go to Supabase:**
https://supabase.com/dashboard → Select ADAZE project → Settings → Authentication

---

## **1. Set Site URL:**

**For Production (if already deployed):**
```
https://adaze.com
```

**OR if custom domain not ready yet:**
```
https://adaze.netlify.app
```

**For Development:**
```
http://localhost:3000
```

💡 **Tip:** Use your custom domain (`adaze.com`) as Site URL if it's already connected to Netlify!

---

## **2. Add Redirect URLs:**

In the **"Additional Redirect URLs"** section, add **ALL** of these:

```
http://localhost:3000
http://localhost:3000/auth/callback
https://adaze.netlify.app
https://adaze.netlify.app/auth/callback
https://adaze.com
https://adaze.com/auth/callback
```

**How to add:**
1. Click **"Add URL"** 
2. Paste URL
3. Press Enter
4. Repeat for each URL
5. Click **Save**

---

## **3. Verify Google Provider:**

Still in **Authentication → Providers**:

1. Find **Google** in the list
2. Make sure it's **Enabled** (toggle ON)
3. Check that **Client ID** is filled in
4. Check that **Client Secret** is filled in
5. Click **Save**

---

## ✅ **Configuration Checklist:**

- [ ] **Site URL** set to `https://adaze.com` or `https://adaze.netlify.app`
- [ ] **6 redirect URLs** added (see list above)
- [ ] **Google provider** enabled
- [ ] **Client ID** from Google Console pasted
- [ ] **Client Secret** from Google Console pasted
- [ ] Clicked **Save**

---

## 🧪 **TEST IT NOW:**

### **On Localhost:**

```bash
# Make sure dev server is running
npm run dev

# Open: http://localhost:3000
# Click "Continue with Google"
# Sign in
# Should work! ✅
```

### **On Production (after deploy):**

1. Go to: **https://adaze.netlify.app** or **https://adaze.com**
2. Click **"Browse Products"** or **"Continue with Google"**
3. Sign in with Google
4. Should work! ✅

---

## 🎯 **CURRENT STATUS:**

| Setting | Status |
|---------|--------|
| ✅ Google Console | CONFIGURED |
| ⏳ Supabase | Configure now |
| ✅ Code | READY |
| ✅ Deployment | Ready to test |

---

## 🔍 **Expected URLs After Setup:**

### **Development:**
```
http://localhost:3000
  ↓ Click Google
  ↓ Sign in
  ↓ Back to: http://localhost:3000/?code=...
  ↓ Auto login
  ↓ Redirect to: http://localhost:3000/marketplace
  ✅ Success!
```

### **Production (adaze.netlify.app):**
```
https://adaze.netlify.app
  ↓ Click Google
  ↓ Sign in
  ↓ Back to: https://adaze.netlify.app/?code=...
  ↓ Auto login
  ↓ Redirect to: https://adaze.netlify.app/marketplace
  ✅ Success!
```

### **Production (adaze.com):**
```
https://adaze.com
  ↓ Click Google
  ↓ Sign in
  ↓ Back to: https://adaze.com/?code=...
  ↓ Auto login
  ↓ Redirect to: https://adaze.com/marketplace
  ✅ Success!
```

---

## ⚠️ **IMPORTANT NOTES:**

### **Site URL Priority:**

Set Supabase Site URL to your **primary domain**:
- If `adaze.com` is live → Use `https://adaze.com`
- If only Netlify → Use `https://adaze.netlify.app`
- For testing → Use `http://localhost:3000`

### **Why 6 Redirect URLs?**

You need all combinations:
1. `localhost` (dev testing)
2. `localhost/auth/callback` (dev OAuth)
3. `netlify.app` (staging/fallback)
4. `netlify.app/auth/callback` (staging OAuth)
5. `adaze.com` (production)
6. `adaze.com/auth/callback` (production OAuth)

---

## 🎊 **YOU'RE ALMOST DONE!**

Just configure Supabase (3 minutes) and test! Everything else is ready.

---

## 📞 **IF YOU NEED HELP:**

**After configuring, if Google sign-in doesn't work:**

1. Open browser console (F12)
2. Try signing in
3. Share any error messages
4. Check if redirect URLs match exactly

**Most common fix:** 
- Wait 2-5 minutes after saving Supabase settings
- Clear browser cookies
- Try in incognito mode

---

## ✨ **NEXT STEPS:**

1. **Configure Supabase** (use checklist above)
2. **Test on localhost** 
3. **Test on production** (https://adaze.netlify.app or https://adaze.com)
4. **Celebrate!** 🎉

Your Google OAuth will work on **all three domains**! 🚀
