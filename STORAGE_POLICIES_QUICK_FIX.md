# 🚀 Quick Fix - Add Missing Storage Policies

## ✅ What You Have (avatars bucket)
- ✅ "Avatar images are publicly accessible" (SELECT)
- ✅ "Anyone can upload an avatar" (INSERT)

## ⚠️ What's Missing

### For `avatars` bucket:
- ❌ UPDATE policy (users can't update their avatars)
- ❌ DELETE policy (users can't delete their avatars)

### For `products` bucket:
- ❌ Entire bucket might not exist yet

---

## 🔧 Fix Instructions

### **Step 1: Add UPDATE Policy to Avatars**

1. Go to **Storage** → Click **avatars** bucket
2. Click **Policies** tab
3. Click **New policy** → **Create a policy from scratch**
4. Fill in:
   - **Policy name**: `Users can update their own avatar`
   - **Allowed operation**: `UPDATE`
   - **Target roles**: `authenticated`
   - **USING expression**:
   ```sql
   (storage.foldername(name))[1] = auth.uid()::text
   ```
   - **WITH CHECK expression**:
   ```sql
   (storage.foldername(name))[1] = auth.uid()::text
   ```
5. Click **Review** → **Save policy**

---

### **Step 2: Add DELETE Policy to Avatars**

1. Still in **avatars** → **Policies** tab
2. Click **New policy** → **Create a policy from scratch**
3. Fill in:
   - **Policy name**: `Users can delete their own avatar`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated`
   - **USING expression**:
   ```sql
   (storage.foldername(name))[1] = auth.uid()::text
   ```
4. Click **Review** → **Save policy**

---

### **Step 3: Check if Products Bucket Exists**

1. Go to **Storage** (left sidebar)
2. Look for **products** bucket in the list

**If it EXISTS:**
- Go to Step 4

**If it DOESN'T EXIST:**
- Click **New bucket**
- **Name**: `products`
- **Public**: ✅ **Enabled**
- Click **Create bucket**
- Then go to Step 4

---

### **Step 4: Add Policies to Products Bucket**

#### Policy 1: Public Read
1. Click **products** bucket → **Policies** tab
2. Click **New policy** → **"Allow public read access"** template
3. It auto-fills, just click **Review** → **Save policy**

#### Policy 2: Upload
1. Click **New policy** → **Create a policy from scratch**
2. Fill in:
   - **Policy name**: `Traders can upload product images`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **WITH CHECK expression**: `true`
3. Click **Review** → **Save policy**

#### Policy 3: Update
1. Click **New policy** → **Create a policy from scratch**
2. Fill in:
   - **Policy name**: `Traders can update their product images`
   - **Allowed operation**: `UPDATE`
   - **Target roles**: `authenticated`
   - **USING expression**: `true`
3. Click **Review** → **Save policy**

#### Policy 4: Delete
1. Click **New policy** → **Create a policy from scratch**
2. Fill in:
   - **Policy name**: `Traders can delete their product images`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated`
   - **USING expression**: `true`
3. Click **Review** → **Save policy**

---

### **Step 5: Update Profiles Table (SQL Editor)**

1. Go to **SQL Editor**
2. Run this:

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

## ✅ Final Checklist

### Avatars Bucket (4 policies total):
- [x] Avatar images are publicly accessible (SELECT) - **Already exists**
- [x] Anyone can upload an avatar (INSERT) - **Already exists**
- [ ] Users can update their own avatar (UPDATE) - **Add in Step 1**
- [ ] Users can delete their own avatar (DELETE) - **Add in Step 2**

### Products Bucket (4 policies total):
- [ ] Product images are publicly accessible (SELECT)
- [ ] Traders can upload product images (INSERT)
- [ ] Traders can update their product images (UPDATE)
- [ ] Traders can delete their product images (DELETE)

### Profiles Table:
- [ ] avatar_url column exists
- [ ] users_update_own_profile policy exists

---

## ⏱️ Time Estimate
- **2 policies for avatars**: ~3 minutes
- **Products bucket + 4 policies**: ~5 minutes
- **SQL for profiles**: ~1 minute
- **Total**: ~10 minutes

---

## 🎯 You're Almost There!

You already have the avatars bucket set up. Just need to:
1. Add 2 more policies to avatars (UPDATE, DELETE)
2. Set up products bucket
3. Run the SQL for profiles table

Then storage will be fully configured! 🚀
