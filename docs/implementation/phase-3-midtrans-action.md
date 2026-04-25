# Phase 3: Midtrans Checkout — Implementation Details

**Status:** Completed

## 1. Supabase Initialization
Created `lib/supabase.ts` to export a pre-configured Supabase REST client.
```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 2. Server Action (`actions/payment.action.ts`)
Created a `"use server"` action `createSnapTransaction`.
- **User Sync:** Looked up `clerkId` via Supabase. If missing, inserted a new user.
- **Transaction Insert:** Created a pending `Transaction` record in the database using Supabase `insert()`, linked to the internal `User.id`.
- **Midtrans Integration:** Used the `midtrans-client` Node SDK to generate a Snap token.
- **Redirect Override:** Embedded `callbacks: { finish: "http://localhost:3000/dashboard" }` in the transaction payload to prevent Midtrans from redirecting to `example.com`.

## 3. Frontend Integration (`components/CheckoutButton.tsx` / `components/PayButton.tsx`)
- Added `<Script src="https://app.sandbox.midtrans.com/snap/snap.js" strategy="beforeInteractive" />` to `app/layout.tsx`.
- The checkout button triggers `createSnapTransaction(amount)` and gets the `snapToken`.
- Executed `window.snap.pay(snapToken, { onSuccess, onPending, onError })`.
- Handled callbacks by redirecting the user to `/dashboard`.

## 4. Dashboard View (`app/dashboard/page.tsx`)
- Read the current user's transactions from Supabase using `clerkId`.
- Created a `PayButton` component allowing the user to resume a `pending` transaction by re-invoking `window.snap.pay` with the saved `snapToken`.
- Rendered dynamic UI badges based on transaction status (pending, settlement, error, etc.).
