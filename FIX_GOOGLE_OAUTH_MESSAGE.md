# Fix Google OAuth Login Message

## Issue
When logging in with Google, users see:
> "You're signing back in to jvpqalrnfyzsnqmtnqlf.supabase.co"

Even though the app name is already set to "ADAZE" in Google Console!

This happens because the **Authorized domains** are not configured.

---

## Solution: Add Authorized Domains in OAuth Consent Screen

### Step 1: Go to Google Cloud Console

1. Open https://console.cloud.google.com/
2. Select your **ADAZE** project
3. Verify you're in the correct project at the top

---

### Step 2: Go to OAuth Consent Screen

1. In the left sidebar, click **APIs & Services**
2. Click **OAuth consent screen**

---

### Step 3: Add Authorized Domains (CRITICAL!)

1. Click **EDIT APP** button (at the top)
2. Scroll down to **Authorized domains** section
3. Click **+ ADD DOMAIN**
4. Add these domains one by one:
   ```
   supabase.co
   adaze.netlify.app
   ```
   
   If you have a custom domain:
   ```
   adaze.com
   ```

5. Make sure to press Enter after typing each domain
6. Scroll down and click **SAVE AND CONTINUE**
7. Continue through the remaining steps (Scopes, Test users) - no changes needed
8. Click **BACK TO DASHBOARD**

---

### Step 4: Verify Changes (Optional)

1. Go to **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Verify the **Authorized redirect URIs** include:
   ```
   https://jvpqalrnfyzsnqmtnqlf.supabase.co/auth/v1/callback
   https://adaze.netlify.app/auth/callback
   https://adaze.com/auth/callback
   ```

---

## Result

After adding authorized domains, when users log in with Google, they will see:
> "Continue to ADAZE" or "Sign in to ADAZE"

Instead of:
> "You're signing back in to jvpqalrnfyzsnqmtnqlf.supabase.co"

Much better! ✅

---

## Why This Happens

Even though your app name is set to "ADAZE", Google shows the callback URL domain (`jvpqalrnfyzsnqmtnqlf.supabase.co`) because:

1. **Supabase acts as your auth provider** - OAuth callbacks go through Supabase's domain
2. **Authorized domains not configured** - Google doesn't recognize `supabase.co` as an authorized domain for your app
3. **Security fallback** - When domains aren't whitelisted, Google shows the actual redirect URL for security transparency

By adding `supabase.co` to your authorized domains, you tell Google: "Yes, it's normal for my app to redirect through Supabase - show my app name instead of the domain."

---

## Propagation Time

- Changes take effect **immediately** for most users
- You might need to **clear browser cookies** or use incognito mode to see the change right away
- Existing sessions won't change until users log out and back in

---

## Additional Branding (Optional)

While in the OAuth consent screen, you can also add:

1. **App logo**: Upload your Adaze logo (120x120px)
2. **App domain**: `adaze.netlify.app`
3. **Support email**: Your support email
4. **Developer contact information**: Your email

This makes the login screen look more professional and trustworthy.

---

## Testing

After making changes:

1. **Log out** of your app completely
2. **Clear browser cookies** (or use incognito mode)
3. Try logging in with Google again
4. You should now see: "Sign in to Adaze" or "Continue to Adaze"

---

## Troubleshooting

### If you still see the old message:

1. **Clear browser cache and cookies**
2. **Wait 5-10 minutes** for Google's cache to update
3. Try in a different browser or incognito mode
4. Make sure you clicked **SAVE AND CONTINUE** in Google Console

### If you can't find OAuth consent screen:

1. Make sure you're in the correct Google Cloud project
2. Check that OAuth 2.0 credentials exist in **APIs & Services** → **Credentials**
3. You need appropriate permissions (Owner or Editor role)

---

## Summary

✅ **Not a Supabase setting** - This is controlled by Google Cloud Console  
✅ **Add authorized domains** - Add `supabase.co` and your app domains  
✅ **App name already correct** - "ADAZE" is already set  
✅ **Changes take effect immediately** (might need to clear cookies)  
✅ **Optional:** Add logo and branding for professional look  

---

## Quick Reference

**Where:** Google Cloud Console → APIs & Services → OAuth consent screen  
**What to change:** Authorized domains → Add `supabase.co`, `adaze.netlify.app`  
**Why:** Tells Google that Supabase redirect is authorized for your app  
**Time to propagate:** Immediate (may need to clear cookies)  
**What users will see:** "Sign in to ADAZE" instead of the Supabase domain ✅
