# Phase 1: Foundation & Authentication — Decision Record

**Date:** 2026-04-25  
**Status:** Accepted  
**Phase:** 1 — Foundation & Authentication

---

## Decision 1: Next.js 16 with App Router

**Context:**  
The project needed a modern React framework with server-side rendering, API routes, and TypeScript support.

**Decision:**  
Used `create-next-app@latest` which installed Next.js 16.2.4 with Turbopack, App Router, TypeScript, React 19.2.4, and Tailwind CSS v4.2.4.

**Rationale:**
- App Router provides React Server Components (RSC) for direct database access without API layers.
- Turbopack offers significantly faster dev builds compared to Webpack.
- Tailwind v4 was the default bundled with the latest create-next-app.

**Consequences:**
- Next.js 16 introduces breaking changes from older versions (e.g., `middleware.ts` is deprecated in favor of `proxy.ts` — see Decision 5).
- Must consult `node_modules/next/dist/docs/` for up-to-date API guidance per the project's AGENTS.md rule.

---

## Decision 2: Clerk v7 for Authentication

**Context:**  
The project requires user authentication with session management, social logins, and route protection.

**Decision:**  
Used `@clerk/nextjs` v7.2.5 (latest) as the authentication provider.

**Rationale:**
- Clerk provides a fully hosted auth UI (sign-in/sign-up modals and pages) — zero custom auth UI needed.
- First-class Next.js App Router integration with server-side `auth()` and `currentUser()` helpers.
- Handles JWTs, session tokens, and middleware-based route protection out of the box.

**Consequences:**
- Clerk v7 removed several legacy exports (`SignedIn`, `SignedOut`, `RedirectToSignIn`). See Decision 4.
- Requires external API keys — the app cannot function without valid `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
- Vendor lock-in: switching away from Clerk later would require replacing auth logic across all components.

---

## Decision 3: Server Components for Auth-Dependent Pages

**Context:**  
Both the landing page and dashboard need to display different content based on authentication state.

**Decision:**  
Made both `app/page.tsx` and `app/dashboard/page.tsx` async Server Components that call `auth()` from `@clerk/nextjs/server`.

**Rationale:**
- Server Components can call `auth()` directly — no client-side hooks, no loading states, no hydration mismatch.
- User data is fetched server-side and rendered into the initial HTML, improving performance and SEO.
- Keeps the component tree simpler (no `"use client"` wrappers needed for auth checks).

**Alternatives Considered:**
- **Client Components with `useAuth()` hook:** Would require `"use client"` directive, loading spinners, and client-side fetch cycles. Rejected for being unnecessarily complex for this use case.

---

## Decision 4: Replaced SignedIn/SignedOut with Server-Side userId Check

**Context:**  
The original plan called for using `<SignedIn>` and `<SignedOut>` wrapper components from Clerk. However, Clerk v7 removed these exports entirely.

**Decision:**  
Replaced the conditional rendering pattern with a server-side `userId` null check:

```tsx
const { userId } = await auth()
// Then: {!userId ? <SignInButton /> : <Dashboard />}
```

**Rationale:**
- `SignedIn` and `SignedOut` no longer exist in `@clerk/nextjs` v7 — importing them causes a build error.
- The `auth()` server function provides the same information (`userId` is `null` when unauthenticated).
- This approach is actually simpler and more explicit than wrapper components.

**Alternatives Considered:**
- **Downgrade to Clerk v6:** Would restore `SignedIn`/`SignedOut` but lose v7 improvements and create future upgrade debt. Rejected.

---

## Decision 5: Kept middleware.ts Despite Deprecation Warning

**Context:**  
Next.js 16 shows a deprecation warning: `The "middleware" file convention is deprecated. Please use "proxy" instead.`

**Decision:**  
Kept the file as `middleware.ts` rather than renaming to `proxy.ts`.

**Rationale:**
- Clerk's `clerkMiddleware()` is designed for and documented against the `middleware.ts` convention.
- Renaming to `proxy.ts` caused Turbopack cache corruption and `MODULE_UNPARSABLE` errors during development.
- The middleware convention still functions correctly — the warning is informational, not a breaking change.
- Clerk SDK will need to update their integration before we can safely migrate to the `proxy.ts` convention.

**Risks:**
- Future Next.js versions may fully remove `middleware.ts` support. Will need to migrate when Clerk releases a proxy-compatible version.

---

## Decision 6: Vitest over Jest for Testing

**Context:**  
The project needs a test runner compatible with TypeScript, JSX, and ESM modules.

**Decision:**  
Used Vitest v4 with `@vitejs/plugin-react`, jsdom environment, and `@testing-library/react`.

**Rationale:**
- Vitest is significantly faster than Jest for Vite/modern projects.
- Native TypeScript and ESM support — no babel or ts-jest configuration needed.
- API is Jest-compatible (`describe`, `it`, `expect`), making it familiar.
- `@testing-library/react` works identically with Vitest.

**Configuration Notes:**
- Setup file must be `.tsx` (not `.ts`) because it contains JSX in the Clerk component mocks.
- Path aliases (`@/`) are configured in `vitest.config.ts` to match `tsconfig.json`.

---

## Decision 7: Mocking Strategy for Clerk in Tests

**Context:**  
Clerk components and server functions require a live Clerk instance with valid API keys. Tests need to run without network access.

**Decision:**  
Created global mocks in `vitest.setup.tsx` that stub all Clerk imports:
- **Client components** (`SignInButton`, `UserButton`) → render as simple HTML elements with `data-testid`.
- **Server functions** (`auth()`, `currentUser()`) → return static test data.
- **Middleware helpers** (`clerkMiddleware`, `createRouteMatcher`) → return the handler directly for unit testing.

**Rationale:**
- Allows testing component rendering and middleware logic without Clerk API calls.
- Global mocks ensure consistency across all test files.
- The middleware mock correctly simulates the route-matching behavior by checking `req.url.includes('/dashboard')`.

**Trade-offs:**
- Mocks won't catch real Clerk API changes — integration tests with a Clerk test instance would be needed for full confidence (out of scope for Phase 1).
