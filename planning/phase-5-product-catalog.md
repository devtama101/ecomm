# Phase 5: Product Catalog & Database Expansion
Status: COMPLETED
**Goal:** Expand the database to handle actual products/subscriptions and create a dynamic storefront UI.

## Execution Steps
1. Update `prisma/schema.prisma` to include a `Product` model: `id` (UUID), `name` (String), `description` (Text), `price` (Int), `isActive` (Boolean), and `imageUrl` (String). (COMPLETED)
2. Update the `Transaction` model: Add a `productId` (UUID) and create a relation to the `Product` model. (COMPLETED)
3. Run `npx prisma format` and `npx prisma db push` (or `migrate dev`) to update the Supabase database schema. (COMPLETED)
4. **Seed the DB:** Create a small setup script (e.g., `scripts/seed.ts` or just insert manually via Supabase Dashboard) to inject 3 dummy products into the database using `@supabase/supabase-js` so we have data to display. (COMPLETED)
5. **The Storefront View:** Update the main landing page (`app/page.tsx`). Convert it to a Server Component that fetches all active `Product` records using the Supabase REST client (`@supabase/supabase-js`). (COMPLETED)
   - *Update:* Rebranded to "Tama Arts" with a light cream/warm theme for a premium clothing store aesthetic. Added product images to the cards.
6. **Dynamic Checkout:** Update the `PayButton` and `CheckoutButton`. The checkout flow should now accept a `productId` as a prop and pass it to the Server Action. The Server Action (`createSnapTransaction`) must calculate the `gross_amount` by querying the `Product` table in the backend using Supabase (never trust client-side prices). (COMPLETED)

## Expected Results
- The landing page displays a list of products pulled dynamically from the Supabase database.
- Clicking "Buy" on a specific product triggers Midtrans with the correct, database-verified price.
- The storefront visually matches the premium "Tama Arts" clothing brand identity.

## Test Cases (Vitest / Manual Testing)
1. **Test:** The Midtrans Server Action throws an error if an invalid `productId` is provided.
2. **Test:** The Server Action strictly uses the price from the database, ignoring any tampered price sent from the frontend.