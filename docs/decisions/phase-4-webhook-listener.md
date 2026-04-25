# Phase 4: Webhook Listener — Decision Record

**Date:** 2026-04-25  
**Status:** Accepted  
**Phase:** 4 — Webhook Listener

---

## Decision 1: Next.js Route Handler for Webhook

**Context:**  
Midtrans requires a public HTTP endpoint to push real-time transaction status updates asynchronously.

**Decision:**  
Implemented a Next.js App Router Route Handler (`app/api/webhooks/midtrans/route.ts`).

**Rationale:**
- **Native Support:** Next.js Route Handlers perfectly replace traditional Node/Express webhook controllers.
- **Unified Backend:** Keeps all payment logic inside the same Next.js application without needing a separate microservice.

---

## Decision 2: Clerk Middleware Exception

**Context:**  
The entire application is protected by Clerk middleware. However, Midtrans needs to access the webhook endpoint without a valid user session.

**Decision:**  
Modified `middleware.ts` to explicitly make `/api/webhooks/midtrans` a public route.

**Rationale:**
- **Accessibility:** Midtrans servers cannot authenticate via Clerk.
- **Security:** Even though the route is public, the logic internally relies on a signature verification, ensuring that only genuine requests from Midtrans are processed.

---

## Decision 3: SHA512 Signature Verification

**Context:**  
Because the webhook endpoint is public, malicious actors could send fake payloads to trick the system into marking an order as "paid".

**Decision:**  
Implemented a rigorous SHA512 signature hash verification:
`crypto.createHash('sha512').update(orderId + statusCode + grossAmount + serverKey).digest('hex')`

**Rationale:**
- **Midtrans Standard:** This is the officially recommended way to verify Midtrans webhooks.
- **Zero Trust:** By hashing the incoming values with our private `MIDTRANS_SERVER_KEY`, we can mathematically prove the payload originated from Midtrans.

---

## Decision 4: Using Ngrok for Local Development

**Context:**  
Midtrans requires a publicly accessible URL for its webhook notifications. `localhost:3000` is not accessible from the internet.

**Decision:**  
Used `ngrok` to tunnel `localhost:3000` to a public URL (e.g., `https://<id>.ngrok-free.dev`) and registered this URL in the Midtrans Dashboard.

**Rationale:**
- **End-to-End Testing:** Allows us to test the entire asynchronous flow (payment -> Midtrans processing -> webhook -> DB update) locally before deploying to production.
- **Immediate Feedback:** Webhook triggers hit the local environment instantly, making debugging fast.

---

## Decision 5: Supabase JS instead of Prisma

**Context:**  
Updating the database requires querying and modifying the `Transaction` table.

**Decision:**  
Continued using `@supabase/supabase-js` (REST API) to update the transaction status.

**Rationale:**
- **Consistency:** Aligns with the decision made in Phase 3 to avoid local Prisma pooler / IPv6 connection issues.
- **Simplicity:** The Supabase REST client makes targeted `update().eq()` calls extremely straightforward inside serverless environments.
