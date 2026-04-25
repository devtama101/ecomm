# Phase 5: Admin Dashboard & Roles
Status: COMPLETED
*(Originally: Phase 6)*

**Goal:** Implement role-based access control (RBAC) and build an admin dashboard for product/order management and analytics.

## Execution Steps
1. **Role Logic:** Add a `role` column to the `User` table (default: 'customer', options: 'customer', 'admin').
2. Create `app/admin/layout.tsx` with a database check — only users with `role = 'admin'` can access `/admin/*` routes. Non-admins redirect to `/dashboard`.
3. **Admin Overview** (`app/admin/page.tsx`):
   - Total products count, total transactions count.
   - Product traffic table (sortable by Most Viewed / Most Sold).
4. **Product Management** (`app/admin/products/page.tsx`):
   - Product list with edit/delete actions.
   - Add New Product form with variant and gallery image support.
   - Edit Product form with existing data pre-filled.
5. **Transaction Management** (`app/admin/transactions/page.tsx`):
   - Transaction list with status badges.

## Expected Results
- Standard users attempting to visit `/admin` are redirected.
- Admins see a dashboard with real-time analytics.
- Products can be created/edited with variants and images from admin panel.

## Dependencies
- Phase 4 (need product variants/images to manage)

## Sources
- Clerk Auth: https://clerk.com/docs/references/nextjs/auth
