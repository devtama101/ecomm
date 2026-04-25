# Phase 8: Webhook & Order Status
Status: COMPLETED
*(Originally: Phase 4)*

**Goal:** Create a secure API endpoint to receive Midtrans payment notifications and update order status. This is the final piece — processing payments that were initiated in Phase 7.

## Execution Steps
1. Create a Route Handler at `app/api/webhooks/midtrans/route.ts`.
2. Ensure the route is excluded from Clerk middleware protection so Midtrans can access it.
3. Read the incoming POST JSON payload.
4. **Security Check (Critical):** Extract `order_id`, `status_code`, `gross_amount`, and `signature_key`. Calculate SHA512 hash of `{order_id}{status_code}{gross_amount}{MIDTRANS_SERVER_KEY}`. Compare against received `signature_key`. Reject if mismatch (403).
5. If valid, read `transaction_status` (settlement, capture, deny, expire).
6. Update the `Transaction` status in the database where `orderId` matches.
7. Update product `sold` count and variant `stock` on successful settlement.
8. Return `200 OK` to Midtrans.

## Expected Results
- Midtrans webhooks successfully update the database status.
- Product stock is decremented and sold count incremented on settlement.
- Fraudulent requests with invalid signatures are rejected.

## Dependencies
- Phase 7 (need payment transactions to process)

## Sources
- Midtrans Webhook Notifications: https://docs.midtrans.com/docs/https-notification-webhook
- Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
