# Phase 5: Product Catalog & Database Expansion
**Goal:** Expand the database to handle actual products/subscriptions and create a dynamic storefront UI.

## Execution Steps
1. Update `schema.prisma` to include a `Product` model: `id` (UUID), `name` (String), `description` (Text), `price` (Int), `isActive` (Boolean).
2. Update the `Transaction` model: Add a `productId` (UUID) and create a relation to the `Product` model.
3. Run `npx prisma generate` and `npx prisma migrate dev --name add_products`.
4. **Seed the DB:** Create a script at `prisma/seed.ts` to inject 3 dummy products into the database so we have data to display. Add the seed command to `package.json`.
5. **The Storefront View:** Update the main landing page (`app/page.tsx`). Convert it to a Server Component that fetches all active `Product` records directly from Prisma.
6. **Dynamic Checkout:** Update the `CheckoutButton` from Phase 3. It should now accept a `productId` as a prop and pass it to the Server Action. The Server Action must calculate the `gross_amount` by querying the `Product` table in the backend (never trust client-side prices).

## Expected Results
- The landing page displays a list of products pulled from the database.
- Clicking "Buy" on a specific product triggers Midtrans with the correct, database-verified price.

## Test Cases (Vitest)
1. **Test:** The Midtrans Server Action throws an error if an invalid `productId` is provided.
2. **Test:** The Server Action strictly uses the price from the database, ignoring any tampered price sent from the frontend.