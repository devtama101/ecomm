# Phase 3: Midtrans Server Action & Checkout UI
**Goal:** Create the backend controller (Server Action) to generate a Midtrans Snap Token and connect it to a frontend checkout button.

## Execution Steps
1. Install the Midtrans Node SDK: `npm i midtrans-client@^1.4.3`.
2. Create a Server Action file at `actions/payment.action.ts` (include `"use server"` at the top).
3. **The Controller Logic:** Write a function `createSnapTransaction(amount: number)`. 
   - It must retrieve the currently authenticated user via Clerk (`auth()`).
   - Query the DB to ensure the User exists (or create one using their `clerkId`).
   - Generate a unique `order_id` (e.g., `ORDER-{timestamp}-{uuid}`).
   - Initialize `midtransClient.Snap` using `process.env.MIDTRANS_SERVER_KEY`.
   - Call `snap.createTransaction()` with the `order_id` and `gross_amount`.
   - Save the transaction record in the Prisma database with status `pending`.
   - Return the `snap_token` to the client.
4. **The View:** Create a Client Component (`components/CheckoutButton.tsx` with `"use client"`). It should trigger the Server Action, receive the token, and execute `window.snap.pay(token)`. Add the Midtrans Snap script tag to the layout.

## Expected Results
- Clicking the checkout button opens the Midtrans Snap overlay on the frontend.
- A new database record is created in the `Transaction` table with status `pending`.

## Test Cases (Vitest - Unit)
1. **Test `createSnapTransaction`:** Mock the `auth()` function to return a dummy user ID.
2. **Test:** Mock the `midtransClient` to return a fake `snap_token`. Assert that the Server Action returns this token and successfully calls Prisma to insert the `pending` transaction.

**Sources:**
- Midtrans Snap Node.js: https://docs.midtrans.com/docs/snap-snap-integration-guide
- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations