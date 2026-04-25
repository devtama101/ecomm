# Phase 7: Variant Images & UX Streamlining

Status: COMPLETED

**Goal:** Improve the precision of product visualization by linking images to specific variants and streamline the purchase flow for customers.

## Execution Steps
1. **Schema Update:** (Previously completed) Use the `imageUrl` field in `ProductVariant` to store specific variant images.
2. **Variant Image Input:** Update `NewProductPage` and `EditProductForm` to allow image uploads for each variant. (COMPLETED)
3. **Interactive Product Grid:** 
   - Replace static links on the home page with an interactive `ProductCard`.
   - Add "Buy Now" (direct payment) and "Add to Cart" (quick add) buttons directly to the grid.
   - Enforce login for purchase actions using Clerk.
   *(COMPLETED)*
4. **Product Detail Refinement:**
   - Implement auto-image switching in `ProductDetailClient` when a color variant is selected.
   - Restrict Admin users from purchasing (removed "Add to Cart", added "Admin View" notice).
   *(COMPLETED)*
5. **Redundancy Cleanup:**
   - Remove the general "Gallery" batch upload from Admin forms since images are now per-variant.
   - Update `ProductDetailClient` to aggregate the gallery dynamically from variant images.
   - Remove `ProductImage` table logic from server actions.
   *(COMPLETED)*

## Expected Results
- Customers see the correct color image when selecting a variant.
- Purchasing is faster with direct grid actions.
- Admins have a cleaner interface focused on management, not consumption.
- The codebase is leaner without the redundant `ProductImage` gallery table.

## Key Changes
- New `components/ProductCard.tsx` (Client Component).
- Updated `app/actions/product.ts` to remove gallery logic.
- Updated `components/ProductDetailClient.tsx` for dynamic gallery and variant-switching.
- Admin redirection: Admins are redirected to `/admin` when clicking the brand logo or attempting to shop.
