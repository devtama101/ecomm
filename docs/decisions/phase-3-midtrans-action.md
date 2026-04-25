# Phase 3: Midtrans Server Action & Checkout UI — Decision Record

**Date:** 2026-04-25  
**Status:** Accepted  
**Phase:** 3 — Midtrans Transaction

---

## Decision 1: Using Next.js Server Actions for Payment Initiation

**Context:**  
We need to communicate with the Midtrans API from the backend to keep the `Server Key` secret.

**Decision:**  
Used a Next.js Server Action (`actions/payment.action.ts`) instead of a traditional API Route.

**Rationale:**
- **Simplicity:** Server Actions allow calling backend logic directly from client components like a regular function.
- **Type Safety:** Seamlessly shares types between frontend and backend.
- **Security:** Logic runs entirely on the server, keeping the `MIDTRANS_SERVER_KEY` inaccessible to the client.

**Alternatives Considered:**
- **API Routes (`/api/payment`)**: Requires `fetch` and manual JSON handling. Rejected for the tighter integration of Server Actions.

---

## Decision 2: Midtrans Snap (Overlay) vs Core API (Direct)

**Context:**  
We need to provide a payment interface to the user.

**Decision:**  
Used **Midtrans Snap**.

**Rationale:**
- **Speed to Market:** Snap provides a pre-built UI (popup/overlay) for all payment methods (GoPay, Bank Transfer, CC).
- **Reduced Scope:** We don't need to build custom UI forms or handle complex state for different payment methods.
- **Security:** Sensitive card data is handled by Midtrans, reducing PCI-DSS compliance burden.

---

## Decision 3: Syncing User to DB during Checkout (Supabase JS)

**Context:**  
The `Transaction` model requires a `userId` (our internal DB ID), but users are primarily managed by Clerk. Also, the local development environment blocked IPv6/pgbouncer connections for Prisma.

**Decision:**  
The payment server action uses `@supabase/supabase-js` (REST API) to check if a record for the current `clerkId` exists. If not, it creates one on-the-fly before creating the transaction.

**Rationale:**
- **Bypassing Prisma Pooler Issues:** The Supabase REST API communicates over standard HTTPS, which entirely avoided the Prisma connection timeouts we experienced locally.
- **Resilience:** Ensures that even if a webhook or sync script fails elsewhere, the user record is always present before a transaction is attempted.

---

## Decision 4: Using `uuid` for Order IDs

**Context:**  
Midtrans requires a unique `order_id` for every transaction.

**Decision:**  
Formatted order IDs as `ORDER-{timestamp}-{uuid_suffix}`.

**Rationale:**
- **Uniqueness:** Combining a timestamp with a short UUID fragment virtually eliminates the risk of collisions.
- **Human Readable:** The prefix and timestamp make it easy to sort and identify orders in the Midtrans dashboard.

---

## Decision 5: `snap.js` Script Placement

**Context:**  
The `snap.js` library must be available globally for `window.snap.pay()` to work.

**Decision:**  
Placed the script in the root `layout.tsx` with `strategy="beforeInteractive"`.

**Rationale:**
- **Reliability:** Ensures the library is loaded before the user can interact with the checkout button.
- **Global Availability:** Allows the payment modal to be triggered from any page in the future.

---

## Decision 6: Hardcoding Midtrans Callbacks Override

**Context:**  
When completing a payment via Midtrans Snap, Midtrans attempts to redirect the user to the "Finish Redirect URL" defined in their Dashboard. If misconfigured, the user is sent to `example.com`.

**Decision:**  
Injected `callbacks: { finish: "http://localhost:3000/dashboard" }` directly into the Midtrans `snap.createTransaction` payload.

**Rationale:**
- **Foolproof Development:** Developers don't need to configure Midtrans Dashboard settings or rely on Ngrok to handle simple post-payment redirects. The backend forces the correct behavior programmatically.
