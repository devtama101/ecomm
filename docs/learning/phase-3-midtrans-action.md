# Phase 3: Midtrans & Server Actions — Learning Notes (for Laravel Devs)

In Laravel, you would typically use a Controller with a `POST` route to handle a checkout. In Next.js, we use **Server Actions**. Here's how the concepts compare.

---

## 1. Controllers vs. Server Actions

**In Laravel:**
You define a route in `web.php` and a method in a `Controller`.
```php
// web.php
Route::post('/checkout', [PaymentController::class, 'store']);

// PaymentController.php
public function store(Request $request) {
    $token = Midtrans::getSnapToken($request->amount);
    Transaction::create(['token' => $token, ...]);
    return response()->json(['token' => $token]);
}
```

**In Next.js (Server Actions):**
You define an `async` function with `"use server"` at the top. You can call it like a normal function in your frontend.
```ts
// actions/payment.action.ts
"use server";

export async function createSnapTransaction(amount: number) {
  const midtransTx = await snap.createTransaction({...});
  await prisma.transaction.create({...});
  return { snapToken: midtransTx.token };
}
```

**Why this is cool:**
- No need to define a route (`/api/payment`).
- No need to use `axios` or `fetch` in the frontend.
- Full TypeScript support (if you change the return type in the action, the frontend knows immediately).

---

## 2. Forms & Requests

**In Laravel:**
You use `$request->input('amount')` or `$request->all()`.

**In Next.js:**
Server Actions receive arguments directly.
```ts
// Calling the action from a button:
const result = await createSnapTransaction(50000);
```

---

## 3. Scripts: `@stack('scripts')` vs. `next/script`

**In Laravel:**
You might use a blade stack in your master layout:
```html
@stack('scripts')
<script src="https://app.sandbox.midtrans.com/snap/snap.js"></script>
```

**In Next.js:**
You use the `<Script />` component in your `layout.tsx`. It optimizes loading automatically.
```tsx
import Script from 'next/script';

<Script 
  src="https://app.sandbox.midtrans.com/snap/snap.js" 
  data-client-key="..."
  strategy="beforeInteractive" 
/>
```
`strategy="beforeInteractive"` ensures the script is loaded before the page becomes interactive, similar to placing a script in the `<head>` in Laravel.

---

## 4. The "Midtrans Snap" Flow

The flow is almost identical to a PHP integration:
1. **Backend**: Request a `Snap Token` from Midtrans using your `Server Key`.
2. **Database**: Save the transaction as `pending`.
3. **Frontend**: Use the `Snap Token` to open the modal:
   ```js
   window.snap.pay(token, {
     onSuccess: (result) => { /* redirect or alert */ }
   });
   ```

---

## 5. Security: Server vs. Client

Just like in Laravel, you must **NEVER** expose your `Server Key` to the browser.
- **MIDTRANS_SERVER_KEY**: Stored in `.env.local`. Accessible only in Server Actions or API Routes.
- **MIDTRANS_CLIENT_KEY**: Can be prefixed with `NEXT_PUBLIC_` to be accessible in the browser for the Snap library.

In Next.js, if a variable doesn't start with `NEXT_PUBLIC_`, it is automatically kept secret and will be `undefined` if you try to use it in a `"use client"` component.

---

## 6. Syncing Users (On-the-fly)

In Laravel, you might use a `Registered` event or a middleware to ensure a user exists. In this phase, we used a **"Get or Create"** pattern inside the checkout action:

```ts
const { data: dbUser } = await supabase
  .from('User')
  .select('*')
  .eq('clerkId', clerkId)
  .single();

if (!dbUser) {
  await supabase.from('User').insert({ clerkId, email });
}
```
This is a common pattern in Next.js to ensure the database stays in sync with external Auth providers like Clerk. We switched from Prisma to the Supabase JS client to avoid IPv6/pgbouncer local connection issues.

---

## 7. Redirect Callbacks (Overriding Midtrans Dashboard)

A common pitfall is relying on the Midtrans Dashboard for post-payment redirects. If you haven't configured it, Midtrans redirects the user to `example.com`.
To override this dynamically (crucial for local development vs production), you can pass a `callbacks` object during transaction creation:

```ts
const parameter = {
  // ... transaction details
  callbacks: {
    finish: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  }
};
```
This guarantees the user always returns to the correct URL after payment.
