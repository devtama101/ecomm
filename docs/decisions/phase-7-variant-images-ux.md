# Decision: Phase 7 - Image Architecture & Purchasing Flow

## Context
Initially, the product gallery was a disconnected set of images. This caused user confusion when selecting variants (e.g., selecting "Navy" but seeing a "Cream" t-shirt). Additionally, the storefront was "click-heavy," requiring multiple steps to buy a single item.

## Decisions

### 1. Shift from `ProductImage` Table to `ProductVariant` Image URL
- **Decision:** Deprecate the batch gallery upload in favor of variant-specific image URLs.
- **Rationale:** Most customers shop by visual color. By making the image a property of the variant, we ensure 1:1 mapping between "what I see" and "what I add to cart."
- **Alternative:** Tagging gallery images with colors. *Rejected* because it's more complex to manage and prone to human error.

### 2. "Buy Now" as a Direct Transaction
- **Decision:** Implement "Buy Now" by creating a temporary single-item order that bypasses the persistent cart.
- **Rationale:** Increases conversion for impulsive or single-item purchases. It reuses the `createMultiItemTransaction` logic to maintain order integrity while providing a faster UI path.

### 3. Admin-Customer Separation
- **Decision:** Explicitly block Admins from shopping on the frontend.
- **Rationale:** Prevents "admin pollution" in the sales analytics. Admins should use the dashboard to manage, not generate test data through the main customer flow.

### 4. Client-Side Login Trigger
- **Decision:** Use `useClerk().openSignIn()` instead of full redirects to `/sign-in`.
- **Rationale:** Keeps the user in the shopping context. If they are on a product page and click "Buy Now," they should stay on that page after signing in to complete the flow immediately.
