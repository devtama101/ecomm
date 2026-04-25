# Learning: Phase 7 - Variant Images & UX Refinement

## Key Lessons

### 1. Data Model Flexibility
Moving from a dedicated `ProductImage` table to embedding images in `ProductVariant` showed that a normalized database isn't always the best for UX. Sometimes, duplicating a field (like an image URL) into the record where it is most contextually relevant (the variant) significantly simplifies the frontend logic.

### 2. State Synchronization
Implementing auto-image switching based on color selection highlighted the importance of clean state management in React. Using a simple effect to compare the current `selectedVariant.id` with a `lastSelectedVariantId` prevented infinite loops while ensuring the gallery always updated when the user interacted with size/color pickers.

### 3. "Buy Now" implementation
We learned that the most robust way to handle "Buy Now" is to reuse the multi-item checkout logic. By treating it as a "cart of one," we ensure that all `Order` and `OrderItem` relations are created correctly, making the transaction traceable in the admin dashboard just like a regular cart checkout.

### 4. Admin Role friction
Implicitly allowing admins to use the shop often leads to edge cases (e.g., admins not having a shipping address record). Explicitly blocking the purchase flow for admins and redirecting them to the management interface is a cleaner pattern that enforces clear separation of concerns.

## Technical Gotchas
- **Supabase Storage Paths:** When moving from `products/gallery/` to `products/variants/`, it was crucial to ensure the bucket permissions allowed nested folders.
- **Clerk Redirect URLs:** Passing `window.location.href` to `openSignIn` is essential for maintaining the user's scroll position and context after they authenticate.
