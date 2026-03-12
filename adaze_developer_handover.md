# ADAZE MARKETPLACE - DEVELOPER HANDOVER DOCUMENT

Welcome to the Adaze Marketplace project! This document serves as a comprehensive onboarding guide and handover manual for incoming developers. It details the architecture, technological stack, design system, and recent critical fixes that define the application's current state.

---

## 🚀 1. Project Overview
**Adaze** is the premier "Mitumba" (second-hand fashion) marketplace targeting the African market (primarily Kenya). 

Unlike standard e-commerce implementations, Adaze is a **multi-vendor, multi-role ecosystem**. It facilitates a supply chain consisting of:
- **Buyers:** Standard consumers browsing the marketplace.
- **Traders (Sellers):** Vendors managing inventories, uploading products, and handling localized storefronts.
- **Transporters (Logistics):** Dedicated delivery partners who claim routes and fulfill localized shipping.
- **Wholesalers / Admins:** System administrators handling global platform moderation and supply-side bulk operations.

---

## 🛠️ 2. Core Technological Stack
The application is built entirely on a modern React meta-framework architecture:

### Frontend
* **Framework:** Next.js 14 (App Router architecture `app/`)
* **Language:** TypeScript (Strict mode enabled)
* **Styling:** Tailwind CSS combined with standard CSS Variables for theme management.
* **Component Library:** `shadcn/ui` (accessible, customizable Radix UI primitives)
* **Animations:** `framer-motion` (used extensively for cinematic, premium transitions)

### Backend as a Service (BaaS) & Authentication
* **Database & Auth:** Supabase (PostgreSQL + GoTrue Auth)
* **Real-time:** Supabase Realtime / WebSockets (for live notifications and order tracking)
* **State Management:** React Context API (via Custom Providers like `AuthProvider` and `LanguageProvider`)

*(Note regarding Auth: The architecture relies heavily on Supabase for session management, but you may finding lingering NextAuth (`next-auth`) configurations in some middleware/config files depending on the branch you are working in. The primary source of truth for the frontend client is `@supabase/ssr` / `@supabase/supabase-js`.)*

---

## 🎨 3. Design System ("Obsidian & Gold")
Adaze is built with a highly specialized, premium aesthetic to separate it from generic marketplaces. 

* **Theme:** "Obsidian & Gold" - A tech-noir, high-fashion aesthetic. 
* **Core Characteristics:**
  * **Glassmorphism:** Translucent cards over grid backgrounds (`bg-card/50 backdrop-blur-sm`).
  * **Typography:** `Instrument Serif` (cinematic, italicized headers) combined with `JetBrains Mono` for technical data and `Inter` for standard sans-serif reading.
  * **Color Palette:** Dominated by deep slates/blacks, with stark white text, and a vibrant, glowing orange/gold `accent` color.
  * **Effects:** "Scanline" overlays (`bg-scanline`) and subtle glowing pulses on interactive elements.

**Important Rule:** Do not use default Tailwind colors (like `bg-blue-500`). Always use the semantic CSS variables defined in `globals.css` (e.g., `bg-accent`, `text-destructive`).

---

## 📁 4. Codebase Structure & Conventions

* **`app/`**: Contains the Next.js App Router structure.
  * `/(auth)`: Shared authentication layouts.
  * `/dashboard/[role]`: Role-gated command centers.
  * `/profile`: The newly revamped "Identity Core" account management hub.
* **`components/`**: 
  * `/ui`: Primitive Shadcn components. Do not modify significantly unless changing the global design system.
  * `/layout`: `Navbar`, `Footer`, etc.
  * `/auth`: Highly customized `AuthModal` handling the global login/registration flows.
* **`lib/`**: Core utilities.
  * `supabase/client.ts` & `supabase/server.ts`: Supabase initialization.
  * `login-tracker.ts`: Custom security logic for monitoring active user sessions.
  * `errorHandler.ts`: Standardized error formatting (Sonner toasts).

---

## 🚨 5. Critical Architecture Details & Recent Fixes (Must Read)

Incoming developers must understand these recent architectural decisions to prevent regressions:

### 1. The "Chunked Cookie" Auth Crash
* **What happened:** Supabase user metadata (like long Google Avatar URLs) was causing session cookies to exceed browser limits, resulting in chunked cookies (e.g., `sb-local-auth-token.0`, `.1`). The client occasionally choked on these fragments, throwing a `TypeError: Cannot create property 'user' on string`.
* **The Fix:** We implemented a **Critical Auth Sanitization Layer** inside `lib/supabase/client.ts`. It runs immediately on the client load, inspects all `-auth-token` chunks across cookies and `localStorage`, and aggressively purges corrupted or truncated JSON *before* the Supabase client attempts to parse them.
* **Rule:** Do not remove the `if (typeof window !== "undefined")` chunk sanitization block in `lib/supabase/client.ts`.

### 2. Active Session Management
* We implemented strict session tracking for security. When a user authenticates, a record is pushed to the `active_sessions` table (via `createActiveSession` in `lib/login-tracker.ts`). 
* When building new auth flows, you must invoke this tracker to ensure the `Security Protocols` tab in the user's `/profile` remains accurate.

### 3. The "System Command" Admin Override
* In the login modal (`AuthModal`), there is a hidden/subtle toggle for administrators to log in directly as 'admin' (bypassing normal role checks). This is handled via the `showAdminAccess` state toggle.

---

## 🔧 6. Local Development Setup

To run the project locally exactly as it operates in production:

1. **Prerequisites:** `Node.js 18+`, `npm` or `yarn`.
2. **Environment Variables:** You must have a `.env.local` populated with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   # Any other payment/gateway keys required for local testing
   ```
3. **Install Dependencies:** `npm install`
4. **Run the Dev Server:** `npm run dev`
5. **Clear Next.js Cache (If needed):** If you encounter Webpack errors like `ChunkLoadError`, simply `rm -rf .next` and restart the server.

---

## 🎯 7. Immediate Next Steps / Roadmap
For the next developer taking over, here are the immediate priorities:
1. **Real Data Wiring (Profile Page):** The "Market Archive" tab in `/profile` currently relies on mock statistics (`totalOrders: 12`, etc.). This needs to be wired up to Supabase to pull real SUM/COUNT aggregations from the `orders` and `transactions` tables.
2. **Server-side Session IPs:** In `lib/login-tracker.ts`, the IP and Location of active sessions are currently marked as `'Unknown'` and `'Nairobi'`. This requires a Next.js API route or Middleware update to accurately capture `x-forwarded-for` and geo-headers on connection.
3. **M-Pesa Integration Tests:** Review the components in `app/api/mpesa` to ensure the Daraja API callbacks are securely updating order statuses in real-time.

Good luck! You are stepping into a beautifully designed, highly functional marketplace architecture.
