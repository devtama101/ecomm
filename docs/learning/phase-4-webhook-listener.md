# Phase 4: Webhook Listeners — Learning Notes (for Laravel Devs)

In Laravel, creating a webhook involves defining a public `POST` route and a Controller method. In Next.js, we use **Route Handlers**. Here is the comparison.

---

## 1. Creating the Endpoint (Route Handler)

**In Laravel:**
```php
// routes/api.php
Route::post('/webhooks/midtrans', [WebhookController::class, 'handleMidtrans']);
```

**In Next.js (App Router):**
Next.js uses a file-based routing system for APIs too. You create a `route.ts` file.
The folder structure defines the URL: `app/api/webhooks/midtrans/route.ts` => `/api/webhooks/midtrans`

```ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true });
}
```
You export a function named after the HTTP verb (`POST`, `GET`, `PUT`, etc.).

---

## 2. Middleware Exclusions (CSRF & Auth)

**In Laravel:**
You would exclude the webhook route from the `VerifyCsrfToken` middleware in `app/Http/Middleware/VerifyCsrfToken.php`:
```php
protected $except = [
    'webhooks/midtrans',
];
```
And you would ensure it is not wrapped in an `auth:sanctum` group.

**In Next.js (with Clerk):**
You modify the `middleware.ts` file at the root of your project to declare the route as public:
```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/midtrans" // Explicitly whitelist the webhook
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

---

## 3. Webhook Security: Signature Verification

Because webhooks are public, anyone can send a POST request to them.
Midtrans secures this by providing a `signature_key` in the payload, which is a SHA512 hash.

**In PHP/Laravel:**
```php
$signature = hash('sha512', $orderId . $statusCode . $grossAmount . env('MIDTRANS_SERVER_KEY'));
```

**In Node.js / Next.js:**
We use the built-in `crypto` module.
```ts
import crypto from "crypto";

const serverKey = process.env.MIDTRANS_SERVER_KEY!;
const expectedSignature = crypto
  .createHash("sha512")
  .update(order_id + status_code + gross_amount + serverKey)
  .digest("hex");

if (signature_key !== expectedSignature) {
  return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
}
```

---

## 4. Local Development Webhooks (Ngrok)

**In Laravel:**
You usually run `valet share` or `ngrok http 8000` to expose your local environment to the internet.

**In Next.js:**
The process is exactly the same!
```bash
ngrok http 3000
```
This gives you a forwarding URL (e.g., `https://random-string.ngrok-free.dev`).
You then paste `https://random-string.ngrok-free.dev/api/webhooks/midtrans` into the Midtrans Dashboard under Settings -> Configuration -> Payment Notification URL.

---

## 5. Connecting to the Database

Instead of Eloquent (`Transaction::where(...)`), we used the `@supabase/supabase-js` REST client to update the record in a serverless-friendly way:

```ts
await supabase
  .from("Transaction")
  .update({ status: transaction_status })
  .eq("orderId", order_id);
```
This is fast, lightweight, and doesn't suffer from connection pooling limits in local environments compared to standard ORMs like Prisma.
