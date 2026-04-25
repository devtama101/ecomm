# Phase 4: Webhook Listener — Implementation Details

**Status:** Completed

## 1. Route Handler Creation
Created `app/api/webhooks/midtrans/route.ts` to listen for `POST` requests from Midtrans.
- Read JSON payload: `await request.json()`.
- Extracted variables: `order_id`, `transaction_status`, `gross_amount`, `signature_key`.

## 2. Signature Verification
Used Node's `crypto` module to securely verify the payload signature:
```ts
import crypto from "crypto";

const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
const hashString = `${order_id}${status_code}${gross_amount}${serverKey}`;
const expectedSignature = crypto.createHash("sha512").update(hashString).digest("hex");

if (signature_key !== expectedSignature) {
  return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
}
```

## 3. Database Update
Used Supabase JS client to sync the real-time status:
```ts
const { error } = await supabase
  .from("Transaction")
  .update({ status: transaction_status })
  .eq("orderId", order_id);
```

## 4. Middleware Whitelist
Modified `middleware.ts` to allow Midtrans unauthenticated access to the webhook endpoint:
```ts
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/midtrans"
]);
```

## 5. Local Tunneling
- Started Ngrok: `ngrok http 3000`
- Registered the Ngrok URL (e.g., `https://[id].ngrok-free.dev/api/webhooks/midtrans`) in the Midtrans Sandbox Dashboard -> Webhook settings.
- Allowed end-to-end status synchronization from local development to Midtrans servers.
