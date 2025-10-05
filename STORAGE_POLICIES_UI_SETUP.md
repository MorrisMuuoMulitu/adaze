# 🗂️ Supabase Storage Policies - UI Setup Guide

## ⚠️ Why SQL Doesn't Work

The error `42501: must be owner of relation objects` happens because:
- The `storage.objects` table is owned by `supabase_storage_admin` role
- Even SQL Editor doesn't have direct ownership
- **Solution**: Use the Supabase Dashboard UI instead

---

## 📋 Step-by-Step UI Setup

### **Step 1: Create Storage Buckets**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **ADAZE** project
3. Click **Storage** (left sidebar)
4. Click **New bucket**

#### Create Avatars Bucket:
- **Name**: `avatars`
- **Public**: ✅ **Enabled** (check the box)
- Click **Create bucket**

#### Create Products Bucket:
- Click **New bucket** again
- **Name**: `products`
- **Public**: ✅ **Enabled** (check the box)
- Click **Create bucket**

---

### **Step 2: Create Policies for Avatars Bucket**

1. Click on the **avatars** bucket
2. Click **Policies** tab (top of the page)
3. Click **New policy**

#### Policy 1: Public Read Access
- Click **"Get started quickly"** → Choose **"Allow public read access"**
- OR manually create:
  - **Policy name**: `Avatar images are publicly accessible`
  - **Allowed operation**: `SELECT`
  - **Target roles**: `public`
  - **USING expression**: `bucket_id = 'avatars'`
- Click **Review** → **Save policy**

#### Policy 2: User Upload
- Click **New policy** → **"Create a policy from scratch"**
- **Policy name**: `Users can upload their own avatar`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **WITH CHECK expression**:
```sql
bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
```
- Click **Review** → **Save policy**

#### Policy 3: User Update
- Click **New policy** → **"Create a policy from scratch"**
- **Policy name**: `Users can update their own avatar`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
```
- **WITH CHECK expression**:
```sql
bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
```
- Click **Review** → **Save policy**

#### Policy 4: User Delete
- Click **New policy** → **"Create a policy from scratch"**
- **Policy name**: `Users can delete their own avatar`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
```
- Click **Review** → **Save policy**

---

### **Step 3: Create Policies for Products Bucket**

1. Go back to **Storage** → Click on **products** bucket
2. Click **Policies** tab
3. Click **New policy**

#### Policy 1: Public Read Access
- Click **"Allow public read access"** template
- OR manually:
  - **Policy name**: `Product images are publicly accessible`
  - **Allowed operation**: `SELECT`
  - **Target roles**: `public`
  - **USING expression**: `bucket_id = 'products'`
- Click **Review** → **Save policy**

#### Policy 2: Authenticated Upload
- Click **New policy** → **"Create a policy from scratch"**
- **Policy name**: `Traders can upload product images`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **WITH CHECK expression**: `bucket_id = 'products'`
- Click **Review** → **Save policy**

#### Policy 3: Authenticated Update
- Click **New policy** → **"Create a policy from scratch"**
- **Policy name**: `Traders can update their product images`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'products'`
- Click **Review** → **Save policy**

#### Policy 4: Authenticated Delete
- Click **New policy** → **"Create a policy from scratch"**
- **Policy name**: `Traders can delete their product images`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'products'`
- Click **Review** → **Save policy**

---

### **Step 4: Update Profiles Table (SQL Editor)**

Go to **SQL Editor** and run this:

```sql
-- Add avatar_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Allow users to update their own profile
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;

CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

---

## ✅ Verification Checklist

After completing all steps:

### Buckets:
- [ ] `avatars` bucket created
- [ ] `avatars` bucket is **public**
- [ ] `products` bucket created
- [ ] `products` bucket is **public**

### Avatars Policies:
- [ ] Avatar images are publicly accessible (SELECT)
- [ ] Users can upload their own avatar (INSERT)
- [ ] Users can update their own avatar (UPDATE)
- [ ] Users can delete their own avatar (DELETE)

### Products Policies:
- [ ] Product images are publicly accessible (SELECT)
- [ ] Traders can upload product images (INSERT)
- [ ] Traders can update their product images (UPDATE)
- [ ] Traders can delete their product images (DELETE)

### Profiles Table:
- [ ] `avatar_url` column exists
- [ ] Users can update their own profile policy exists

---

## 🧪 Test Upload

After setup, test the upload:

```typescript
// In your Next.js app
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

async function testUpload(file: File) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('Not authenticated')
    return
  }

  // Upload to avatars bucket (user's folder)
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${user.id}/avatar.png`, file)

  if (error) {
    console.error('Upload error:', error)
  } else {
    console.log('Upload success:', data)
  }
}
```

---

## 🔍 Troubleshooting

### If uploads still fail:

1. **Check bucket is public**:
   - Storage → Click bucket → Configuration → Public access = ON

2. **Check RLS is enabled**:
   - Go to SQL Editor → Run:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'storage' AND tablename = 'objects';
   ```
   - `rowsecurity` should be `true`

3. **Verify policies exist**:
   - Storage → Bucket → Policies tab → Should see 4 policies per bucket

4. **Check authentication**:
   - Make sure user is logged in
   - Check `auth.uid()` is not null

---

## 📞 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `new row violates row-level security` | Add INSERT policy with authenticated role |
| `404 not found` | Bucket doesn't exist - create it |
| `406 not acceptable` | Missing public access - enable in bucket config |
| `401 unauthorized` | User not authenticated - check login |
| `403 forbidden` | Policy doesn't allow operation - check USING/WITH CHECK expressions |

---

## ✨ You're Done!

Your storage buckets and policies are now configured properly. Users can:
- ✅ Upload avatars to their own folders
- ✅ Upload product images
- ✅ View all public images
- ✅ Manage their own uploads

**No SQL errors!** 🎉
