# Phase 1: Foundation & Authentication
Status: COMPLETED
*(Originally: Phase 1)*

**Goal:** Scaffold a Next.js App Router application, integrate Clerk for authentication, and establish route protection.

## Execution Steps
1. Initialize a new Next.js project with React 19, TypeScript, Tailwind CSS, and App Router.
2. Install `@clerk/nextjs` and configure environment variables.
3. Create `middleware.ts` at the root. Configure `clerkMiddleware()` to protect routes.
4. **RBAC Setup:** Define User Roles (default: `USER`, admin: `ADMIN`). Create a server-side check (or Clerk metadata mapping) to identify administrators.
5. Create an Admin Layout Guard (`app/admin/layout.tsx`) that redirects non-admins to the home page or dashboard immediately.
6. Update the root `layout.tsx` to wrap the application in `<ClerkProvider>`.
7. Create a basic public landing page (`app/page.tsx`) and a protected dashboard page (`app/dashboard/page.tsx`).
8. Install `vitest` and `@testing-library/react`.

## Expected Results
- Navigating to `/dashboard` without an active session redirects to the Clerk login portal.
- Successful login redirects to `/dashboard` where the user's profile is visible.

## Test Cases
1. Middleware correctly identifies unauthenticated states.
2. Protected components render properly when an authenticated session is mocked.

## Dependencies
- None (this is the foundation)

## Sources
- Clerk Next.js Quickstart: https://clerk.com/docs/quickstarts/nextjs
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
