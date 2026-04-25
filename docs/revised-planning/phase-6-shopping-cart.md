# Phase 6: Shopping Cart
Status: TODO
*(New phase — not in original planning)*

**Goal:** Implement a client-side shopping cart so users can add multiple items (with selected variants) before proceeding to checkout.

## Execution Steps
1. Install Zustand for lightweight state management: `npm i zustand`.
2. Create `store/cartStore.ts`:
   - State: `items[]` (productId, variantId, name, size, color, price, quantity, imageUrl).
   - Actions: `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, `getTotal()`.
   - Persist cart to `localStorage` so it survives page refreshes.
3. Create `components/CartSidebar.tsx` — slide-out panel showing cart contents:
   - Item list with variant info, quantity controls, remove button.
   - Subtotal calculation.
   - "Proceed to Checkout" button.
4. Create `components/CartIcon.tsx` — floating cart icon with item count badge in the navbar.
5. Connect the "Add to Cart" button in `ProductDetailClient.tsx` to the cart store.
6. Build `app/checkout/page.tsx` — summary page before payment.

## Expected Results
- Users can add products with specific variants to the cart.
- Cart persists across page navigations and refreshes.
- Checkout page shows order summary with correct totals.

## Dependencies
- Phase 4 (need product variants to add to cart)

## Sources
- Zustand: https://zustand-demo.pmnd.rs/
