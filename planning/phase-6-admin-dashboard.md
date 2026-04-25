# Phase 6: Admin Roles & Conversion Dashboard
Status: COMPLETED

**Goal:** Implement role-based access control (RBAC) and build a conversion analytics dashboard using Shadcn/UI and Recharts.

## Execution Steps
1. **Role Logic:** Update the `User` Prisma model to include a `role` field (default: 'USER', enum: 'USER', 'ADMIN'). (COMPLETED)
2. Create an admin layout block. Update `middleware.ts` or create a layout check in `app/admin/layout.tsx` that queries the database (or Clerk metadata) to ensure only users with the 'ADMIN' role can access the `/admin` routes. Redirect non-admins to `/dashboard`. (COMPLETED)
3. **UI Tooling:** Initialize Shadcn/UI (`npx shadcn@latest init`). Install the `Card` and `Table` components. Install `recharts@^3.8.1` for charting. (COMPLETED - Note: UI updated to use custom Tailwind classes instead of full Shadcn to match Tama Arts theme)
4. **Analytics Server Component:** Create `app/admin/page.tsx`. Write Prisma queries to calculate:
   - Total Gross Revenue (sum of all `settlement` transactions).
   - Conversion Rate (percentage of transactions that reached `settlement` vs `pending`/`expire`).
   - Recent Sales List (fetch the last 10 transactions, including the nested `User.email` and `Product.name`).
   *(COMPLETED)*
5. **The View:** Render the revenue and conversion rate in Shadcn `Card` components. Render the recent sales in a Shadcn `Table`. Render a simple line chart of sales over the last 7 days using Recharts. (COMPLETED)
   - *Update:* All Admin Tables (products, transactions) and Customer Dashboard have been visually standardized to match the premium "Tama Arts" light cream/stone color palette.

## Expected Results
- Standard users attempting to visit `/admin` are bounced out.
- Admins see a secure dashboard with real-time Prisma aggregations.
- All dashboards and tables are visually consistent with the main brand.

## Test Cases (Vitest)
1. **Test:** Ensure standard users receive a 403 or redirect when accessing admin routes.
2. **Test Analytics Query:** Mock the Prisma transaction table and verify the revenue summation logic calculates the correct total.