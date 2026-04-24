# Phase 2: Database & ORM Setup
**Goal:** Integrate Prisma ORM with PostgreSQL, define the schema for Users and Transactions, and generate the client.

## Execution Steps
1. Install `prisma@^7.8.0` as a dev dependency and `@prisma/client@^7.8.0`.
2. Initialize Prisma (`npx prisma init`) and configure the `.env` to point to a local or cloud PostgreSQL instance.
3. Define the following models in `schema.prisma`:
   - `User`: `id` (UUID), `clerkId` (String, unique), `email` (String), `createdAt`.
   - `Transaction`: `id` (UUID), `orderId` (String, unique), `userId` (UUID, relation to User), `amount` (Int), `status` (String: 'pending', 'settlement', 'expire', 'deny'), `snapToken` (String, optional), `createdAt`.
4. Generate the initial migration (`npx prisma migrate dev --name init`).
5. Create a global Prisma client instance utility at `lib/prisma.ts` to prevent connection exhaustion during hot-reloading.

## Expected Results
- Database tables are created successfully.
- The `lib/prisma.ts` utility correctly exports a singleton instance of `PrismaClient`.

## Test Cases (Vitest - Integration)
1. **Test:** Create a mock User record in the database.
2. **Test:** Create a mock Transaction linked to the User.
3. **Test:** Query the Transaction and verify the nested User relation data is retrieved correctly.

**Sources:**
- Prisma Next.js Setup: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices