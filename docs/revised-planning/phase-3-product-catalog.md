# Phase 3: Product Catalog & Storefront
Status: COMPLETED
*(Originally: Phase 5)*

**Goal:** Expand the database to handle products and create a dynamic storefront UI. This comes BEFORE payment — you need something to sell first.

## Execution Steps
1. Update `prisma/schema.prisma` to include a `Product` model: `id` (UUID), `name`, `description`, `price` (Int), `isActive` (Boolean), `imageUrl` (optional), `viewCount` (Int), `sold` (Int).
2. Update the `Transaction` model: Add `productId` and create a relation to `Product`.
3. Run migration to update the Supabase database schema.
4. **Seed the DB:** Create `scripts/seed.ts` to inject dummy products using `@supabase/supabase-js`.
1. Update `app/page.tsx` as a Server Component that fetches active products with their primary variants.
2. **Interactive Product Grid:** Create `components/ProductCard.tsx` (Client Component).
   - **Buy Now:** Direct button that triggers single-item checkout.
   - **Add to Cart:** Floating icon button that updates the global store.
   - **Auth Gate:** Use `useClerk().openSignIn()` to enforce login for purchase actions.
3. Branded as "Tama Arts" with a premium warm cream/stone theme and smooth hover transitions.
4. **Detail Link:** Ensure the card still links to the full product detail page for size/color selection.

## Expected Results
- Landing page displays products pulled dynamically from the database.
- Clicking a product card navigates to its detail page.
- Storefront matches the premium "Tama Arts" brand identity.

## Dependencies
- Phase 2 (need the database)

## Sources
- Supabase JS Client: https://supabase.com/docs/reference/javascript
