# Learnings: Phase 5 - Product Catalog

## Server-Side Pricing Verification
- One of the most critical aspects of e-commerce architecture is **price integrity**. 
- Initially, the client sent the exact price amount to the server action. This is a severe security vulnerability because malicious users could intercept the payload and send an altered amount (e.g., Rp 1) for a high-value product.
- **Resolution:** By shifting the source of truth to the database, the client only sends the `productId`. The server fetches the `Product` entity, reads the immutable price field, and dictates the correct `gross_amount` to the payment gateway.

## Prisma vs Direct Supabase Connections
- We continued experiencing network constraints using `prisma db push` locally due to IPv6 routing issues with the Supabase connection pooler (`pooler.supabase.com`).
- **Resolution:** We utilized Supabase's SQL Editor on their dashboard to execute the generated Prisma migration. This reinforces the learning that when local DB drivers struggle with specific network topologies (like IPv6 poolers on certain ISPs), going through the provider's direct interface or HTTP APIs (like `@supabase/supabase-js`) is a reliable fallback.

## Midtrans Item Details
- Adding `item_details` to the `createTransaction` payload in Midtrans heavily improves the observability in their merchant dashboard. It breaks down the total `gross_amount` into explicitly named line items rather than showing up as a generic charge.

## Relational Queries with Supabase JS
- Using `select("*, Product(name)")` allows us to effortlessly perform foreign-key JOIN operations and fetch related table data in a single request, optimizing the order history view on the dashboard without needing multiple queries or complex Prisma aggregations.
