# Phase 4: Product Details & Variants
Status: COMPLETED
*(New phase — not in original planning)*

**Goal:** Build a rich product detail page with image gallery and variant selection (size/color). Essential for a clothing store — buyers need to see photos from multiple angles and pick their size before purchasing.

## Execution Steps
1. Add `ProductVariant` model to schema: `id`, `productId`, `size` (S/M/L/XL), `color`, `stock`.
2. Add `ProductImage` model to schema: `id`, `productId`, `url`, `order`.
3. Run migration to create the new tables.
4. Create `app/product/[id]/page.tsx` — Server Component that fetches product with variants and images.
5. Create `components/ProductDetailClient.tsx` — Client Component with:
   - Interactive image gallery (thumbnail strip + main image).
   - Size selector buttons.
   - Color selector buttons.
   - Real-time stock status (shows "Only X left!" or "Out of Stock").
   - "Add to Cart" button (placeholder for Phase 6).
6. Update admin product forms to support adding/removing variants and gallery images.

## Expected Results
- Product detail page shows full gallery and variant options.
- Selecting a size+color combination updates the stock display.
- Out-of-stock combinations disable the buy button.

## Dependencies
- Phase 3 (need products to exist)

## Sources
- Next.js Dynamic Routes: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
