# Decision: Next.js 16+ Migration (Middleware to Proxy)

## Context
During deployment to Vercel, the build failed due to the deprecation of the `middleware.ts` file convention and the `middleware` export name in Next.js 16.0.0+. Additionally, build-time TypeScript errors were encountered in the admin product forms due to missing properties in the variant state type.

## Decision
1.  **Rename Middleware to Proxy**: Migrated `middleware.ts` to `proxy.ts` and renamed the exported function to `proxy`.
2.  **Update Test Suite**: Renamed `middleware.test.ts` to `proxy.test.ts` and updated all internal references.
3.  **Harden Product Form Types**: Explicitly added `imageUrl` to the `variants` state type in `EditProductForm` and `NewProductPage` to ensure build stability and better DX.
4.  **Deployment Documentation**: Added a specific "Hosting & Deployment" section to the README to guide future contributors on the required build command and file conventions.

## Rationale
Following the official Next.js migration path is critical for successful CI/CD and long-term project health. Strictly typing the variant state prevents "property does not exist" errors that frequently block production builds.

## Consequences
- The project is now fully compatible with Next.js 16+.
- Future middleware-like logic must be added to `proxy.ts` instead of `middleware.ts`.
- Build reliability is significantly improved by resolving the variant type mismatch.
