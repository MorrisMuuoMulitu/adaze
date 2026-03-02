# Auth.js Migration Guide (Phase 1.5)

This guide explains how to enable the new Auth.js (v5) authentication system.

## 1. Environment Setup
Copy the variables from `.env.example` to your `.env` file. You specifically need:
- `AUTH_SECRET`: Generate one using `openssl rand -base64 32`.
- `DATABASE_URL`: Your Neon connection string.

## 2. Activate Auth.js Middleware
The file `middleware.ts` currently contains the old Supabase logic.
The file `middleware-authjs.ts` contains the new Auth.js logic.

To switch:
1. Rename `middleware.ts` to `middleware.supabase.ts` (backup).
2. Rename `middleware-authjs.ts` to `middleware.ts`.

## 3. Database Migration
Run the following to update your Neon database schema:
```bash
npx prisma generate
npx prisma db push
```

## 4. User Migration (Critical)
Since Supabase hashes passwords differently, existing users will not be able to log in with their old passwords.
You have two options:
1.  **Reset Passwords:** Users must use a "Forgot Password" flow (not yet implemented) or you manually update their password hash in the database.
2.  **Magic Links:** Configure a magic link provider (Email) in `auth.ts` to bypass passwords initially.

## 5. Testing
Visit `/api/auth/signin` to see the default login page.
