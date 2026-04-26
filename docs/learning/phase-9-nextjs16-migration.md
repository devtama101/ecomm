# Learning: Next.js Convention Shifts & Build Stabilization

## Key Learnings

### 1. Next.js 16+ Proxy Convention
- **File Naming**: The transition from `middleware.ts` to `proxy.ts` is a breaking change in file discovery.
- **Export Naming**: The exported function must be named `proxy` (or be a default export that is internally recognized as a proxy).
- **Impact**: Failing to update this results in build failures on platforms like Vercel that strictly enforce the new standard.

### 2. TypeScript Build-Time vs. Run-Time
- **State Typing**: In complex forms (like `EditProductForm`), local state must be explicitly typed to include all properties returned by the database/ORM, even if they are optional.
- **Consistency**: Discrepancies between the database schema (which had `imageUrl` for variants) and the React state (which didn't) are often caught only during `next build` (type-checking phase), leading to late-stage deployment failures.

### 3. Utility Types in State Management
- **Omit for Actions**: Using `Omit<T, "key">` in store actions (like `addItem`) is a powerful way to centralize logic (e.g., setting initial quantity to 1), but requires strict adherence at the component level.
- **Error Feedback**: Build-time errors about "known properties" usually point to a mismatch between the passed object and a specifically excluded property in the interface.

### 4. Vercel Build Optimization
- **Prisma Generation**: Always include `npx prisma generate` in the Vercel build command to ensure the local Prisma Client is up-to-date with the schema during the build process.
- **Environment Variables**: Redirect URLs for Clerk (and other auth providers) must be explicitly set in the Vercel environment to match the production domain.

## Improvements for Next Project
- **Early Type Checking**: Run `npm run build` or `tsc --noEmit` locally more frequently to catch type discrepancies before attempting deployment.
- **Stay Updated**: Monitor Next.js release notes closely, as core file conventions (like `middleware`) can change between major/minor versions in this specific environment.
