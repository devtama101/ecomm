# Phase 2: Database & ORM Setup — Decision Record

**Date:** 2026-04-25  
**Status:** Accepted  
**Phase:** 2 — Database & ORM Setup

---

## Decision 1: Supabase PostgreSQL as the Database

**Context:**  
The project needs a relational database for Users and Transactions. The plan specified PostgreSQL.

**Decision:**  
Used Supabase's managed PostgreSQL 17 instance (project: `itktelunooqgjglbhvmk`, region: `ap-northeast-1`).

**Rationale:**
- Supabase provides a free-tier managed PostgreSQL with zero server management.
- Built-in connection pooling (Supavisor) is ideal for serverless Next.js deployments.
- The dashboard provides SQL Editor, table viewer, and real-time logs for debugging.

**Consequences:**
- Supabase's direct database host (`db.*.supabase.co`) is IPv6-only and unreachable from most local development environments.
- All connections must go through the Supavisor pooler, which introduces constraints on DDL operations (see Decision 4).
- Vendor tie-in to Supabase for database hosting, though the underlying PostgreSQL is standard and portable.

---

## Decision 2: Prisma 7 as the ORM

**Context:**  
The project needs an ORM to manage database schemas, migrations, and queries with TypeScript type safety.

**Decision:**  
Used Prisma v7.8.0 with the new `prisma.config.ts` configuration format.

**Rationale:**
- Prisma provides auto-generated TypeScript types from the schema, eliminating manual type definitions.
- The migration system tracks schema changes over time.
- The `PrismaClient` API is intuitive and supports relation queries (`include: { user: true }`).

**Consequences:**
- Prisma 7 introduced a **breaking change**: connection URLs are no longer in `schema.prisma`. They must be in `prisma.config.ts` using `defineConfig()`. This differs from most online tutorials (which target Prisma 5/6).
- The generated client is output to `app/generated/prisma/` (Prisma 7 default), not `node_modules/@prisma/client` like older versions.
- Prisma's schema engine requires a direct database connection for migrations, which conflicts with Supabase's IPv6-only direct host (see Decision 4).

---

## Decision 3: `globalThis` Singleton Pattern for PrismaClient

**Context:**  
Next.js hot-reloads modules during development. Each reload creates a new `PrismaClient` instance, which opens new database connections. This quickly exhausts the connection pool.

**Decision:**  
Created `lib/prisma.ts` that caches the `PrismaClient` instance on `globalThis` in development mode.

**Rationale:**
- `globalThis` survives module hot-reloads in Node.js, so the same `PrismaClient` is reused.
- In production, a fresh instance is created per cold start (no caching needed).
- This is the officially recommended pattern from Prisma's documentation.

**Alternatives Considered:**
- **New instance per request:** Would exhaust the connection pool within minutes during development. Rejected.
- **Prisma Accelerate:** A paid connection management service from Prisma. Overkill for this project. Rejected.

---

## Decision 4: Applied Migration via Supabase MCP (Not Prisma CLI)

**Context:**  
Prisma's `migrate dev` and `migrate resolve` commands use a "schema engine" that requires a direct PostgreSQL connection. Supabase's direct database host is IPv6-only and unreachable from the local development machine. The Supavisor pooler returned `tenant/user not found` errors for the Prisma schema engine.

**Decision:**  
Applied the initial migration SQL directly via the Supabase MCP tool (`apply_migration`), then created the local migration file (`prisma/migrations/0_init/migration.sql`) manually for version tracking.

**Rationale:**
- The Supabase MCP uses the Supabase Management API (HTTP), which bypasses the TCP connection issues entirely.
- The migration SQL is identical to what `prisma migrate dev` would generate.
- The local migration file ensures the DDL is version-controlled alongside the schema.

**Risks:**
- Prisma's `_prisma_migrations` table was not populated (since we didn't use `prisma migrate resolve`). Future `prisma migrate dev` runs may detect drift.
- **Mitigation:** When a stable direct connection becomes available (e.g., IPv4 add-on), we can run `prisma migrate resolve --applied 0_init` to sync the migration history.

**Alternatives Considered:**
- **Supabase IPv4 Add-on:** Would enable direct connections but is a paid feature. Not needed for development. Deferred.
- **Local PostgreSQL:** Would work for Prisma CLI but adds local infrastructure complexity and diverges from production. Rejected for now.

---

## Decision 5: Two Connection Strings (DATABASE_URL + DIRECT_URL)

**Context:**  
Supabase offers two pooler modes: Transaction (port 6543) and Session (port 5432). The direct host is IPv6-only.

**Decision:**  
Both `DATABASE_URL` and `DIRECT_URL` currently point to the transaction mode pooler (port 6543, `pgbouncer=true`), since it's the only reachable endpoint.

**Rationale:**
- Transaction mode with `pgbouncer=true` disables prepared statements, which is required for Supavisor compatibility.
- Keeping both variables allows us to easily switch `DIRECT_URL` to a direct connection or session mode in the future without touching application code.

**Future Migration:**
- When IPv4 add-on is enabled or session mode pooler becomes reachable, update `DIRECT_URL` to point to port 5432 for migration DDL support.

---

## Decision 6: Mocked Unit Tests (Not Integration Tests)

**Context:**  
The Phase 2 plan called for integration tests that create real records. However, Prisma CLI cannot connect to Supabase from the local machine.

**Decision:**  
Wrote unit tests that mock the `PrismaClient` using Vitest's `vi.mock()`. Tests verify the correct Prisma API calls and return shapes.

**Rationale:**
- Unit tests run instantly without network access.
- They validate the application's interaction contract with Prisma (correct method calls, expected return shapes).
- Integration tests against a live database can be added later when CI/CD is configured with proper database access.

**Trade-offs:**
- Mocked tests won't catch actual SQL errors, constraint violations, or connection issues.
- We verified table creation separately through the Supabase MCP (`list_tables`).
