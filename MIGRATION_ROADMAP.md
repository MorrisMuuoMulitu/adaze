# Adaze Marketplace Migration Roadmap (Supabase -> Neon/Vercel)

This document outlines the "Zero-Downtime" migration strategy for moving Adaze Marketplace from Supabase to a Vercel-centric stack with Neon Postgres.

## Phase 1: Infrastructure Setup (The "Conductor" Phase)

1.  **Neon Project Setup:**
    -   Create a new Neon project.
    -   Obtain the `DATABASE_URL` (pooled) and `DIRECT_URL` (unpooled).
    -   Update `env.example` with these new variables.

2.  **Prisma Initialization:**
    -   Initialize Prisma with the new schema (`prisma/schema.prisma`).
    -   Run `npx prisma generate` to create the client.
    -   Run `npx prisma db push` to sync the schema to the Neon database.

3.  **Vercel Blob & KV:**
    -   Enable Vercel Blob storage for the project.
    -   Enable Vercel KV for session management and rate limiting.
    -   Add `BLOB_READ_WRITE_TOKEN` and `KV_REST_API_*` credentials to environment variables.

## Phase 2: Dual-Write & Data Sync

To ensure zero downtime, we will implement a "Dual-Write" strategy during the transition.

1.  **Modify Application Logic:**
    -   Update API routes to write to *both* Supabase and Neon.
    -   Reads should still come from Supabase initially.

2.  **Backfill Data (Supabase -> Neon):**
    -   **Users:** Export `auth.users` and `public.profiles` from Supabase.
    -   **Transformation Script:** Write a script to merge `auth.users` and `profiles` into the Prisma `User` model structure.
    -   **Import:** Bulk insert users into Neon.
    -   **Content:** Export `products`, `orders`, `mpesa_transactions`, etc., and import them into Neon using `prisma.createMany` or raw SQL `COPY` commands for speed.

## Phase 3: Switch & Cutover

1.  **Verification:**
    -   Run the "Chrome DevTools MCP" audit on the new stack in a staging environment.
    -   Verify "Core Web Vitals" are sub-100ms LCP with the new Neon backend.

2.  **Traffic Switch:**
    -   Update the application to *read* from Neon.
    -   Keep writing to both (optional, for rollback safety) or switch writes to Neon only.

3.  **Auth Migration:**
    -   Deploy the new `Auth.js` configuration.
    -   Users will need to reset passwords (since Supabase hashes might not be directly compatible with standard bcrypt/argon2 unless we migrate the hashes and configure Auth.js to verify them). *Strategy: Use magic links initially or prompt password reset on first login.*

## Phase 4: Cleanup

1.  **Decommission Supabase:**
    -   Once stability is confirmed (after 48-72 hours), archive the Supabase project.
    -   Remove Supabase client code and dependencies (`@supabase/supabase-js`, etc.).

2.  **Codebase Cleanup:**
    -   Remove old SQL files.
    -   Remove old `lib/supabase` directory.

## Phase 5: Post-Migration Enhancements

1.  **AI Integration:**
    -   Enable "Smart Product Descriptions" using Vercel AI SDK.
    -   Run background jobs to generate embeddings for all products for semantic search.

2.  **Performance Tuning:**
    -   Analyze queries with Neon's dashboard.
    -   Add missing indexes to `schema.prisma` if needed.

---

**Rollback Plan:**
If critical errors occur during Phase 3, revert the `DATABASE_URL` to point back to a Supabase-compatible proxy or restore the Supabase application logic immediately.
