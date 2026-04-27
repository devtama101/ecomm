# Architectural Decisions: Admin Roles & Database Connectivity

## 1. Prisma 7 Migration (Non-Standard Setup)
In Prisma 7, the `datasource.url` field in `schema.prisma` has been deprecated for many providers and can cause validation errors (P1012). 

### Decision
- **Configuration Source**: Moved connection string management to `prisma.config.ts`.
- **Database Client**: Standardized on the `PrismaPg` driver adapter in `lib/prisma.ts` to allow for better connection pooling management in serverless environments.
- **Why**: This prevents build-time validation errors and provides a centralized place to handle the `DIRECT_URL` fallback.

## 2. Robust Admin Role Verification
Previously, admin access was easily lost if the database was reset or if the user logged in with a different email than the primary one.

### Decision
- **Multi-Email Support**: The system now checks **all** email addresses associated with a Clerk account, not just the primary one.
- **Auto-Promotion Logic**: If any of a user's verified emails match the `ADMIN_EMAILS` list in `lib/constants.ts`, the system automatically upserts them into the database with the `admin` role upon visiting the admin area.
- **"Admin Kicking" Prevention**: Hardcoded admins are allowed access even if the database is temporarily unreachable, using a "Stale-While-Revalidate" approach in the Admin Layout.

## 3. Supabase Connectivity (Direct vs. Pooler)
We encountered significant stability issues with the Supavisor pooler (port 6543) returning `ENOTFOUND` or "Tenant not found" errors.

### Decision
- **Primary Connection**: Switched the app to prioritize `DIRECT_URL` (port 5432) or a verified regional cluster (`aws-1-ap-northeast-1.pooler.supabase.com`).
- **Connection Logic**: 
  - Host: `aws-1-ap-northeast-1.pooler.supabase.com` (verified stable cluster).
  - Port: `6543` for Transaction Pooling with `?pgbouncer=true`.
  - Manual Pooling: Configured `pg.Pool` with `max: 10` to prevent exhausting Supabase's direct connection limits.

## 4. UI-Driven Diagnostics
Database errors in server components were previously caught and returned as empty arrays, leading to a confusing "Empty List" UI.

### Decision
- **Error Propagation**: Administrative pages now explicitly catch and bubble up connection errors to the UI.
- **Diagnostic Badge**: Added a "Total Users" badge and a detailed error alert box to the User Management page to expose infrastructure issues immediately to developers.
