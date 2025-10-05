# 🔧 Simplified Avatars Policies (No Errors!)

## ⚠️ Problem
The expression `(storage.foldername(name))[1] = auth.uid()::text` might be causing errors in some Supabase versions.

## ✅ Solution: Use Simpler Expressions

Let me give you **two options** - try Option 1 first, if it doesn't work, use Option 2.

---

## 🎯 Option 1: Simplified with Path Check (Recommended)

### **UPDATE Policy:**

**Policy name:**
```
Users can update their own avatar
```

**Allowed operation:** UPDATE

**Target roles:** authenticated

**USING expression:**
```sql
bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '/'))[1]
```

**WITH CHECK expression:**
```sql
bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '/'))[1]
```

---

### **DELETE Policy:**

**Policy name:**
```
Users can delete their own avatar
```

**Allowed operation:** DELETE

**Target roles:** authenticated

**USING expression:**
```sql
bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '/'))[1]
```

---

## 🎯 Option 2: Super Simple (No Path Restrictions)

If Option 1 still gives errors, use these **very simple** policies:

### **UPDATE Policy:**

**Policy name:**
```
Authenticated users can update avatars
```

**Allowed operation:** UPDATE

**Target roles:** authenticated

**USING expression:**
```sql
bucket_id = 'avatars'
```

**WITH CHECK expression:**
```sql
bucket_id = 'avatars'
```

---

### **DELETE Policy:**

**Policy name:**
```
Authenticated users can delete avatars
```

**Allowed operation:** DELETE

**Target roles:** authenticated

**USING expression:**
```sql
bucket_id = 'avatars'
```

---

## 🎯 Option 3: Check Your Existing INSERT Policy

Can you share what expression your current **"Anyone can upload an avatar"** policy uses? 

Go to: Storage → avatars → Policies → Click on "Anyone can upload an avatar"

Copy the **WITH CHECK expression** and share it with me. Then I'll match the UPDATE and DELETE policies to the same format.

---

## 🔄 How to Replace a Policy

If you need to fix existing policies:

1. Go to **Storage** → **avatars** → **Policies**
2. Find the policy with errors
3. Click the **three dots (...)** on the right
4. Click **Delete policy**
5. Click **New policy** and create it again with the new expression

---

## ⏱️ Quick Test

After adding/updating policies, try this:

1. **Test SELECT** (view): Can you see avatar images? Should work ✅
2. **Test INSERT** (upload): Can you upload a new avatar? Should work ✅
3. **Test UPDATE** (replace): Can you replace existing avatar? Should work after fix ✅
4. **Test DELETE** (remove): Can you delete avatar? Should work after fix ✅

---

## 📸 What I Need From You

To help you better, please share:

1. **The exact error message** you're seeing
2. **Screenshot or text** of your current INSERT policy's WITH CHECK expression
3. Which **Option (1, 2, or 3)** you want to try

Then I can give you the exact policies that will work! 🚀
