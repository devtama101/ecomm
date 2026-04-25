# Phase 2: Database & ORM Setup
Status: COMPLETED
*(Originally: Phase 2)*

**Goal:** Integrate Prisma ORM with PostgreSQL (Supabase), define the core schema, and generate the client.

## Execution Steps
1. Install `prisma@^7.8.0` as a dev dependency and `@prisma/client@^7.8.0`.
2. Initialize Prisma (`npx prisma init`) and configure `prisma.config.ts` to point to Supabase PostgreSQL.
3. Define the following models in `schema.prisma`:
   - `User`: `id` (UUID), `clerkId` (String, unique), `email` (String), `createdAt`.
   - `Transaction`: `id` (UUID), `orderId` (String, unique), `userId` (relation), `amount` (Int), `status` (String), `snapToken` (optional), `createdAt`.
4. Generate the initial migration.
5. Create a global Prisma client instance utility at `lib/prisma.ts`.

## Lessons Learned
- **Prisma v7 breaking change:** `url` and `directUrl` must NOT be in `schema.prisma`. They go in `prisma.config.ts`.
- **Supabase pooler SNI issue:** The `pg` adapter can't connect through Supabase's IPv4 pooler from local dev. Use `@supabase/supabase-js` (HTTP) for runtime queries as a workaround.

## Dependencies
- Phase 1 (need the app to exist)

## Sources
- Prisma Next.js Setup: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
