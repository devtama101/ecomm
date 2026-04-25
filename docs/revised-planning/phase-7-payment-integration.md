# Phase 7: Payment Integration (Midtrans)
Status: COMPLETED
*(Originally: Phase 3)*

**Goal:** Create the backend logic to generate a Midtrans Snap Token and connect it to the checkout flow. NOW this makes sense — we have products, variants, a cart, and a checkout page.

## Execution Steps
1. Install the Midtrans Node SDK: `npm i midtrans-client@^1.4.3`.
2. Create a Server Action at `actions/payment.action.ts` (`"use server"`).
1. **The Unified Controller:** Write `createMultiItemTransaction(items[])` in `actions/payment.action.ts`.
   - **Verification:** Always query the DB for the latest prices and stock availability before creating the Midtrans transaction.
   - **Order Creation:** Insert an `Order` and corresponding `OrderItem` records into Prisma.
   - **Midtrans Sync:** Generate a Snap Token for the total amount of the newly created `Order`.
2. **Direct Purchase (Buy Now):** Trigger this action directly from the `ProductCard` or `ProductDetailClient` with an array of length 1.
3. **Cart Checkout:** Trigger this same action from the `/checkout` page with the full array of items from the Zustand store.
4. **Overlay Execution:** Handle the `window.snap.pay(token)` callback to redirect users to their `/dashboard` or a success page.

## Expected Results
- Clicking "Pay Now" on the checkout page opens the Midtrans Snap overlay.
- A new database record is created in the `Transaction` table with status `pending`.
- The payment amount is verified server-side from the database, not the client.

## Dependencies
- Phase 6 (need cart/checkout to know what to pay for)

## Sources
- Midtrans Snap Node.js: https://docs.midtrans.com/docs/snap-snap-integration-guide
- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
