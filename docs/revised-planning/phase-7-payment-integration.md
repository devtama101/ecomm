# Phase 7: Payment Integration (Midtrans)
Status: COMPLETED
*(Originally: Phase 3)*

**Goal:** Create the backend logic to generate a Midtrans Snap Token and connect it to the checkout flow. NOW this makes sense — we have products, variants, a cart, and a checkout page.

## Execution Steps
1. Install the Midtrans Node SDK: `npm i midtrans-client@^1.4.3`.
2. Create a Server Action at `actions/payment.action.ts` (`"use server"`).
3. **The Controller Logic:** Write `createSnapTransaction(items[])`:
   - Retrieve the authenticated user via Clerk `auth()`.
   - Query the DB to verify each product's price (never trust client-side prices).
   - Generate a unique `order_id` (e.g., `ORDER-{timestamp}-{uuid}`).
   - Initialize `midtransClient.Snap` using `process.env.MIDTRANS_SERVER_KEY`.
   - Call `snap.createTransaction()` with the total `gross_amount`.
   - Save the transaction record in the database with status `pending`.
   - Return the `snap_token` to the client.
4. **The Checkout UI:** Trigger the Server Action from the checkout page, receive the token, and execute `window.snap.pay(token)`.

## Expected Results
- Clicking "Pay Now" on the checkout page opens the Midtrans Snap overlay.
- A new database record is created in the `Transaction` table with status `pending`.
- The payment amount is verified server-side from the database, not the client.

## Dependencies
- Phase 6 (need cart/checkout to know what to pay for)

## Sources
- Midtrans Snap Node.js: https://docs.midtrans.com/docs/snap-snap-integration-guide
- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
