# Phase 1: Foundation & Authentication
Status: COMPLETED
*(Originally: Phase 1)*

**Goal:** Scaffold a Next.js App Router application, integrate Clerk for authentication, and establish route protection.

## Execution Steps
1. Initialize a new Next.js 16 (v16.2.4) project with React 19, TypeScript, Tailwind CSS (v4.2.4), and App Router.
2. Install `@clerk/nextjs@^7.2.5` and configure the environment variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
3. Create `middleware.ts` at the root. Configure `clerkMiddleware()` to protect the `/dashboard` route and leave `/` as public.
4. Update the root `layout.tsx` to wrap the application in `<ClerkProvider>`.
5. Create a basic public landing page (`app/page.tsx`) with a `<SignInButton />`.
6. Create a protected dashboard page (`app/dashboard/page.tsx`) displaying the `<UserButton />` and the user's Clerk ID.
7. Install `vitest` and `@testing-library/react` for future test cases.

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
