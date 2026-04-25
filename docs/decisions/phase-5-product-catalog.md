# Decisions: Phase 5 - Product Catalog

## 1. Using Supabase JS for Fetching Over Prisma
**Context:** We need to fetch product data on the storefront and join product names onto transactions in the dashboard.
**Decision:** We used `@supabase/supabase-js` instead of Prisma Client for runtime data operations.
**Rationale:** Due to ongoing Prisma IPv6/connection pooler issues in the local environment, relying on the REST-based Supabase JS client guarantees high availability and avoids hanging requests, ensuring the storefront loads quickly.

## 2. Seed Script using REST
**Context:** We needed dummy data for our new `Product` table.
**Decision:** We wrote a custom TS script (`scripts/seed.ts`) using the Supabase JS client rather than using `prisma db seed`.
**Rationale:** Consistent with the decision above, circumventing the Prisma query engine for simple inserts bypasses the connection limitations.

## 3. UUIDs for Product IDs
**Context:** The `Product` model required a primary key.
**Decision:** We utilized UUIDs (`gen_random_uuid()`) rather than auto-incrementing integers.
**Rationale:** UUIDs are standard for modern scalable applications. They prevent ID enumeration attacks (where competitors or bad actors guess sequential product IDs to scrape the catalog) and ensure uniqueness across distributed systems.

## 4. Item Details in Midtrans Payload
**Context:** We must define the transaction parameters sent to Midtrans.
**Decision:** We explicitly mapped the `Product` details to the `item_details` array parameter in the Midtrans payload.
**Rationale:** This maps the specific product names and individual prices so that users (and administrators) see exactly what the transaction encompasses on the Midtrans invoice interface.
