# 🎯 Add Missing Policies to Avatars Bucket

## ✅ Current Avatars Policies (You Have)
1. **Avatar images are publicly accessible** (SELECT) - ✅
2. **Anyone can upload an avatar** (INSERT) - ✅

## ❌ Missing Policies (Need to Add)
3. **Users can update their own avatar** (UPDATE) - ❌
4. **Users can delete their own avatar** (DELETE) - ❌

---

## 📝 How to Add Policies (Step-by-Step)

### **Step 1: Add UPDATE Policy**

1. **Go to Supabase Dashboard** → https://supabase.com/dashboard
2. Click **Storage** in the left sidebar
3. Click on **avatars** bucket
4. Click **Policies** tab (at the top)
5. Click **New policy** button
6. Click **"Create a policy from scratch"**
7. Fill in these **exact values**:

   **Policy name:**
   ```
   Users can update their own avatar
   ```

   **Allowed operation:** 
   - Select **UPDATE** from dropdown

   **Target roles:**
   - Select **authenticated** from dropdown

   **USING expression** (copy this exactly):
   ```sql
   (storage.foldername(name))[1] = auth.uid()::text
   ```

   **WITH CHECK expression** (copy this exactly):
   ```sql
   (storage.foldername(name))[1] = auth.uid()::text
   ```

8. Click **Review**
9. Click **Save policy**

---

### **Step 2: Add DELETE Policy**

1. Still in **avatars** bucket → **Policies** tab
2. Click **New policy** button
3. Click **"Create a policy from scratch"**
4. Fill in these **exact values**:

   **Policy name:**
   ```
   Users can delete their own avatar
   ```

   **Allowed operation:** 
   - Select **DELETE** from dropdown

   **Target roles:**
   - Select **authenticated** from dropdown

   **USING expression** (copy this exactly):
   ```sql
   (storage.foldername(name))[1] = auth.uid()::text
   ```

   (Note: DELETE doesn't need WITH CHECK expression)

5. Click **Review**
6. Click **Save policy**

---

## ✅ Final Checklist for Avatars Bucket

After completing both steps, you should have **4 total policies**:

- [x] Avatar images are publicly accessible (SELECT) - Already exists
- [x] Anyone can upload an avatar (INSERT) - Already exists
- [ ] Users can update their own avatar (UPDATE) - **Add in Step 1**
- [ ] Users can delete their own avatar (DELETE) - **Add in Step 2**

---

## 🧪 Test After Adding

Try uploading, updating, and deleting an avatar in your app to confirm it works!

---

## ⏱️ Time: 3-5 minutes total

---

## 💡 What These Policies Do

- **UPDATE policy**: Allows users to replace their existing avatar image
- **DELETE policy**: Allows users to remove their avatar image

Both policies use `(storage.foldername(name))[1] = auth.uid()::text` to ensure users can only modify their own avatars (stored in their user ID folder).
