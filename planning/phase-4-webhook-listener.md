# Phase 4: Midtrans Webhook (API Route Handler)
Status: COMPLETED
**Goal:** Create a secure, public API endpoint to receive Midtrans payment notifications and update the database transaction status.

## Execution Steps
1. Create a Next.js Route Handler at `app/api/webhooks/midtrans/route.ts`.
2. Ensure the route is excluded from Clerk middleware protection so Midtrans can access it.
3. Read the incoming POST JSON payload.
4. **Security Check (Critical):** Extract `order_id`, `status_code`, `gross_amount`, and `signature_key` from the payload. Calculate a SHA512 hash of `{order_id}{status_code}{gross_amount}{MIDTRANS_SERVER_KEY}`. Compare it against the received `signature_key`. If they do not match, return a `403 Forbidden`.
5. If the signature is valid, read the `transaction_status` (e.g., `settlement`, `capture`, `deny`, `expire`).
6. Use Prisma to update the `status` of the `Transaction` where `orderId` matches the payload's `order_id`.
7. Return a `200 OK` response to Midtrans.

## Expected Results
- Midtrans webhooks successfully update the database status.
- Fraudulent or manually crafted requests lacking the proper signature hash are rejected.

## Test Cases (Vitest - Controller/Route Test)
1. **Test Valid Signature:** Send a mocked POST request with a correctly generated SHA512 signature. Assert the Route Handler returns `200 OK` and updates the mocked database record.
2. **Test Invalid Signature:** Send a POST request with an invalid signature. Assert the Route Handler returns `403` and does *not* interact with the database.

**Sources:**
- Midtrans Webhook Notifications: https://docs.midtrans.com/docs/https-notification-webhook
- Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers