# Implementation: Phase 5 - Product Catalog

## Database Expansion
- Added `Product` model to Prisma schema (`id`, `name`, `description`, `price`, `isActive`, `createdAt`, `updatedAt`).
- Added relation between `Transaction` and `Product` (a transaction belongs to a product via `productId`).
- Implemented Supabase raw SQL migration (`gen_random_uuid()` for `Product.id`) and pushed it successfully using Supabase Dashboard to bypass local Prisma IPv6 connection constraints.

## Data Seeding
- Wrote `scripts/seed.ts` utilizing `@supabase/supabase-js` to bypass Prisma pool issues to directly insert three mock products (Premium, Standard, Basic Tier).

## Backend Refactoring (Action)
- Rewrote the `createSnapTransaction` action in `actions/payment.action.ts` to accept a `productId` instead of a raw `amount`.
- Implemented secure backend price resolution by querying the `Product` table for the matching ID to determine the transaction amount.
- Added product `item_details` structure to the Midtrans `createTransaction` parameter for better merchant dashboard traceability.
- Saved `productId` in the newly created `Transaction` DB record.

## Frontend UI Updates
- `app/page.tsx` was converted to dynamically fetch active products from Supabase and render them using a responsive CSS grid.
- Mapped over products dynamically rendering `CheckoutButton`.
- Updated `CheckoutButton` props to accept `productId` and pass it to the server action instead of the price.
- Updated `app/dashboard/page.tsx` order history table to perform a relational query (`select("*, Product(name)")`) to display the purchased product's name next to the order ID.
