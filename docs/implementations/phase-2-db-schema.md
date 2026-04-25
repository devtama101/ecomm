# Phase 2: Database & ORM Setup — Implementation

**Status:** ✅ Complete  
**Completed:** 2026-04-25  
**Prisma Version:** 7.8.0  
**Database:** Supabase PostgreSQL 17 (ap-northeast-1)  
**Connection:** Supavisor Transaction Mode (port 6543)

---

## Overview

This phase integrates Prisma ORM with a Supabase-hosted PostgreSQL database, defines the `User` and `Transaction` models, and creates a singleton Prisma client utility for use throughout the application.

---

## Files Created / Modified

### Prisma & Database

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Defines `User` and `Transaction` models |
| `prisma.config.ts` | Prisma 7 configuration — loads `.env.local`, sets datasource URL |
| `prisma/migrations/0_init/migration.sql` | Initial migration SQL (applied via Supabase MCP) |
| `generated/prisma/` | Auto-generated Prisma client (gitignored) |
| `lib/prisma.ts` | Singleton `PrismaClient` instance for hot-reload safety |
| `.env.local` | Added `DATABASE_URL` and `DIRECT_URL` connection strings |
| `.env` | Placeholder (no secrets, points to `.env.local`) |

### Testing

| File | Purpose |
|---|---|
| `lib/prisma.test.ts` | Unit tests for User creation, Transaction creation, and relation queries |

---

## Architecture

```
ecomm/
├── prisma/
│   ├── schema.prisma              # Model definitions (no URL — Prisma 7 change)
│   └── migrations/
│       └── 0_init/
│           └── migration.sql      # DDL applied to Supabase
├── prisma.config.ts               # Prisma 7 config (datasource URL, env loading)
├── generated/
│   └── prisma/                    # Auto-generated client (npx prisma generate)
├── lib/
│   ├── prisma.ts                  # Singleton PrismaClient
│   └── prisma.test.ts             # Schema unit tests
└── .env.local                     # DATABASE_URL + DIRECT_URL
```

---

## Key Implementation Details

### 1. Prisma 7 Configuration (`prisma.config.ts`)

Prisma 7 introduced a breaking change: connection URLs are no longer in `schema.prisma`. They are configured in `prisma.config.ts`:

```ts
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
```

### 2. Schema Models (`prisma/schema.prisma`)

**User:**
- `id` — UUID, auto-generated
- `clerkId` — Unique, maps to Clerk's user ID
- `email` — User's email from Clerk
- `createdAt` — Auto-timestamped
- `transactions` — One-to-many relation to Transaction

**Transaction:**
- `id` — UUID, auto-generated
- `orderId` — Unique, e.g. `ORDER-{timestamp}-{uuid}`
- `userId` — Foreign key to `User.id`
- `amount` — Integer (in smallest currency unit)
- `status` — String: `pending`, `settlement`, `expire`, `deny`
- `snapToken` — Optional, Midtrans Snap token
- `createdAt` — Auto-timestamped

### 3. Singleton Client (`lib/prisma.ts`)

Uses the `globalThis` caching pattern to prevent connection pool exhaustion during Next.js hot-reloading in development:

```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 4. Connection Strings

| Variable | Purpose | Port |
|---|---|---|
| `DATABASE_URL` | Runtime queries (transaction mode, `pgbouncer=true`) | 6543 |
| `DIRECT_URL` | Migrations (also transaction mode due to IPv6-only direct host) | 6543 |

---

## Test Coverage

### lib/prisma.test.ts (3 tests)

| Test | Description |
|---|---|
| `should create a User record` | Mocks `prisma.user.create()`, verifies clerkId and email persist correctly |
| `should create a Transaction linked to a User` | Mocks `prisma.transaction.create()`, verifies userId FK and default status |
| `should query a Transaction with nested User relation` | Mocks `prisma.transaction.findUnique()` with `include: { user: true }`, verifies nested data |

---

## How to Run

```bash
# Generate Prisma client (after schema changes)
npx prisma generate

# Run all tests
npx vitest run
```

---

## Verification Checklist

- [x] `User` and `Transaction` tables created in Supabase
- [x] Foreign key constraint `Transaction.userId → User.id` exists
- [x] Unique indexes on `User.clerkId` and `Transaction.orderId`
- [x] Prisma client generated successfully
- [x] `lib/prisma.ts` exports singleton instance
- [x] All 6 tests pass (3 Phase 1 + 3 Phase 2)
