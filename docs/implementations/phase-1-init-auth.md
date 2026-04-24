# Phase 1: Foundation & Authentication — Implementation

**Status:** ✅ Complete  
**Completed:** 2026-04-25  
**Next.js Version:** 16.2.4 (Turbopack)  
**React Version:** 19.2.4  
**Tailwind CSS:** v4.2.4  
**Clerk SDK Version:** @clerk/nextjs ^7.2.5

---

## Overview

This phase scaffolds the Next.js application with TypeScript, Tailwind CSS, and App Router, then integrates Clerk for authentication with route protection on `/dashboard`.

---

## Files Created / Modified

### Core Application

| File | Purpose |
|---|---|
| `app/layout.tsx` | Root layout wrapped in `<ClerkProvider>` |
| `app/page.tsx` | Public landing page with `<SignInButton />` |
| `app/dashboard/page.tsx` | Protected dashboard displaying user info and `<UserButton />` |
| `middleware.ts` | Clerk middleware protecting `/dashboard` routes |
| `.env.local` | Clerk API keys (not committed to git) |

### Testing

| File | Purpose |
|---|---|
| `vitest.config.ts` | Vitest configuration with jsdom environment and path aliases |
| `vitest.setup.tsx` | Global test setup with Clerk component/server mocks |
| `middleware.test.ts` | Tests for route protection logic |
| `app/dashboard/page.test.tsx` | Tests for dashboard rendering with mocked auth |

---

## Architecture

```
ecomm/
├── app/
│   ├── layout.tsx          # ClerkProvider wraps <html>
│   ├── page.tsx            # Public — server component, uses auth()
│   ├── globals.css
│   └── dashboard/
│       ├── page.tsx        # Protected — server component, uses auth() + currentUser()
│       └── page.test.tsx
├── middleware.ts            # clerkMiddleware + createRouteMatcher
├── vitest.config.ts
├── vitest.setup.tsx
├── middleware.test.ts
└── .env.local
```

---

## Key Implementation Details

### 1. ClerkProvider (app/layout.tsx)

The `<ClerkProvider>` wraps the entire `<html>` element. This is required by Clerk to provide authentication context to all pages.

```tsx
<ClerkProvider>
  <html lang="en" className={...}>
    <body>{children}</body>
  </html>
</ClerkProvider>
```

### 2. Middleware (middleware.ts)

Uses `clerkMiddleware()` with `createRouteMatcher()` to selectively protect routes. Only `/dashboard(.*)` is protected — all other routes remain public.

```ts
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})
```

The `config.matcher` excludes Next.js internals and static files from middleware processing.

### 3. Landing Page (app/page.tsx)

A **server component** that calls `auth()` to check if the user is signed in:
- **Not signed in:** Shows a `<SignInButton mode="modal">` that opens Clerk's hosted sign-in modal.
- **Signed in:** Shows a "Go to Dashboard" link and `<UserButton />`.

### 4. Dashboard Page (app/dashboard/page.tsx)

A **server component** protected by middleware. Uses:
- `auth()` — to get the `userId` (Clerk ID string)
- `currentUser()` — to get full user details (email, name)

Displays the user's Clerk ID, email, and name.

### 5. Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...  # Client-side, exposed to browser
CLERK_SECRET_KEY=sk_test_...                    # Server-side only
```

---

## Test Coverage

### middleware.test.ts (2 tests)

| Test | Description |
|---|---|
| `should protect /dashboard routes` | Verifies `auth.protect()` is called when request URL contains `/dashboard` |
| `should not protect public routes` | Verifies `auth.protect()` is NOT called for `/` |

### app/dashboard/page.test.tsx (1 test)

| Test | Description |
|---|---|
| `renders user information correctly` | Calls the async server component, renders output, asserts Clerk ID, email, and name are displayed |

### Mocking Strategy (vitest.setup.tsx)

- `@clerk/nextjs` — Mocks `ClerkProvider`, `SignInButton`, `UserButton` as simple pass-through/stub components.
- `@clerk/nextjs/server` — Mocks `auth()` to return `{ userId: 'test_user_id' }` and `currentUser()` to return a full user object. Mocks `clerkMiddleware` to return the handler directly for unit testing.

---

## How to Run

```bash
# Development server
npm run dev

# Run tests
npx vitest run
```

---

## Verification Checklist

- [x] `http://localhost:3000` shows landing page with "Sign In" button
- [x] Clicking "Sign In" opens Clerk modal
- [x] `http://localhost:3000/dashboard` redirects unauthenticated users to Clerk sign-in
- [x] After sign-in, dashboard shows user's Clerk ID, email, and name
- [x] All 3 tests pass
