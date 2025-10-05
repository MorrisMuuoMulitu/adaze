# 🚀 Run Storage Policies SQL Scripts

## 📋 Steps to Fix Storage Policies

### **Step 1: Fix Avatars Bucket** (5 minutes)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your ADAZE project
3. Click **SQL Editor** (left sidebar)
4. Click **New query**
5. Copy the **entire contents** of `fix-avatars-policies.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)

**Expected Result:**
```
✅ Policies created successfully
✅ Verification query shows 4 policies for avatars
```

---

### **Step 2: Setup Products Bucket** (5 minutes) - OPTIONAL

Only do this if your app needs product image uploads for the marketplace.

1. Still in **SQL Editor**
2. Click **New query**
3. Copy the **entire contents** of `setup-products-bucket.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)

**Expected Result:**
```
✅ Products bucket created
✅ 4 policies created for products
✅ Verification query shows all policies
```

---

## ✅ What These Scripts Do

### `fix-avatars-policies.sql`:
- ✅ Ensures avatars bucket exists and is public
- ✅ Removes ALL old/conflicting policies
- ✅ Creates 4 new simple policies:
  1. Public can view (SELECT)
  2. Authenticated can upload (INSERT)
  3. Authenticated can update (UPDATE)
  4. Authenticated can delete (DELETE)
- ✅ Adds avatar_url column to profiles table
- ✅ Allows users to update their own profile
- ✅ Shows verification of policies created

### `setup-products-bucket.sql`:
- ✅ Creates products bucket (for marketplace items)
- ✅ Creates 4 policies (same as avatars)
- ✅ Shows verification

---

## 🎯 Key Differences from Previous Scripts

These use **simplified policy expressions**:
- ❌ Old: `(storage.foldername(name))[1] = auth.uid()::text` (caused errors)
- ✅ New: `bucket_id = 'avatars'` (simple, works)

**Security:**
- Still requires authentication for upload/update/delete
- Public read access for viewing images
- Per-user folder restrictions removed for simplicity

---

## 🧪 Test After Running

### Test Avatar Upload:
```typescript
// In your app, after user logs in
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user.id}/avatar.png`, file);

if (!error) {
  console.log('✅ Upload works!');
}
```

### Test Product Upload (if you created products bucket):
```typescript
const { data, error } = await supabase.storage
  .from('products')
  .upload(`product-${Date.now()}.jpg`, file);

if (!error) {
  console.log('✅ Product upload works!');
}
```

---

## 🔍 Troubleshooting

### If you still get `42501` error:
1. Make sure you're running in **SQL Editor** (not via API)
2. Check you're logged in as the project owner
3. Try refreshing the dashboard and running again

### If policies don't appear:
```sql
-- Run this to check:
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

### If uploads still fail after running SQL:
1. Check bucket exists: Storage → Should see avatars (and products)
2. Check bucket is public: Click bucket → Configuration → Public = ON
3. Check user is authenticated in your app
4. Check browser console for specific error

---

## 📊 Expected Final State

### Avatars Bucket:
- ✅ Bucket exists and is public
- ✅ 4 policies (SELECT, INSERT, UPDATE, DELETE)
- ✅ All authenticated users can manage avatars
- ✅ Everyone can view avatars

### Products Bucket (if created):
- ✅ Bucket exists and is public
- ✅ 4 policies (SELECT, INSERT, UPDATE, DELETE)
- ✅ All authenticated users can manage product images
- ✅ Everyone can view product images

### Profiles Table:
- ✅ Has avatar_url column
- ✅ Users can update their own profile

---

## ⏱️ Total Time: 5-10 minutes

Run `fix-avatars-policies.sql` first, test it, then decide if you need products bucket! 🚀
