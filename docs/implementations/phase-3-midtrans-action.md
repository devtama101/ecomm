# Phase 3: Midtrans Server Action & Checkout UI — Implementation

**Status:** ✅ Complete  
**Completed:** 2026-04-25  
**Midtrans Mode:** Sandbox  
**Technology:** Next.js Server Actions, Midtrans Node SDK, Snap.js

---

## Overview

This phase implements the core payment initiation flow. It connects the authenticated user to a Midtrans Snap transaction, generates a token, and displays the payment modal on the frontend.

---

## Files Created / Modified

### Backend (Server Actions)

| File | Purpose |
|---|---|
| `actions/payment.action.ts` | Server Action to sync user, generate `order_id`, and get Snap Token from Midtrans |
| `actions/payment.action.test.ts` | Unit tests for the server action with mocked dependencies |

### Frontend (UI)

| File | Purpose |
|---|---|
| `components/CheckoutButton.tsx` | Client component that triggers the payment flow and handles Snap callbacks |
| `app/layout.tsx` | Injected the Midtrans Snap script (`snap.js`) |
| `app/page.tsx` | Premium store page to test the checkout integration |

### Configuration

| File | Purpose |
|---|---|
| `.env.local` | Added `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, and `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` |
| `package.json` | Added `midtrans-client` and `uuid` dependencies |

---

## Architecture

### Payment Flow (Snap Integration)

1. **User Clicks Checkout**: The `CheckoutButton` (Client Component) calls `createSnapTransaction`.
2. **Server Action**:
   - Authenticates user via Clerk.
   - Syncs user to Prisma DB if missing.
   - Generates unique `orderId`.
   - Calls Midtrans API via `midtrans-client` to get a `snapToken`.
   - Saves a `pending` transaction in the DB.
3. **Snap Modal**: The frontend receives the token and calls `window.snap.pay(token)`.
4. **User Pays**: The user completes payment in the Midtrans overlay.
5. **Callback**: The frontend handles `onSuccess` or `onPending` to notify the user.

---

## Key Implementation Details

### 1. Midtrans Server Action

```ts
export async function createSnapTransaction(amount: number) {
  // 1. Auth & Sync
  const user = await currentUser();
  
  // 2. Midtrans Snap Init
  const snap = new midtransClient.Snap({...});
  
  // 3. Create Transaction
  const midtransTx = await snap.createTransaction(parameter);
  
  // 4. Persistence
  await prisma.transaction.create({
    data: { orderId, userId, amount, status: 'pending', snapToken: midtransTx.token }
  });
  
  return { success: true, snapToken: midtransTx.token };
}
```

### 2. Snap.js Integration

The Midtrans script is loaded in `layout.tsx` with the `beforeInteractive` strategy to ensure it's ready when the button is clicked.

```tsx
<Script
  src="https://app.sandbox.midtrans.com/snap/snap.js"
  data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
  strategy="beforeInteractive"
/>
```

---

## Test Coverage

### actions/payment.action.test.ts (2 tests)

| Test | Description |
|---|---|
| `should fail if user is not authenticated` | Verifies that the action returns a 401-like error if Clerk session is missing |
| `should create a transaction and return a snap token` | Mocks the entire flow and verifies that the record is saved to the DB with the correct token |

---

## Verification Checklist

- [x] `.env.local` contains valid Midtrans keys
- [x] `midtrans-client` and `uuid` installed
- [x] Server action correctly creates `pending` transaction in DB
- [x] `CheckoutButton` displays the Midtrans Snap modal
- [x] UI handles `onSuccess` and `onPending` callbacks
- [x] All 8 tests pass (including new payment tests)
