# Developer Learnings & Troubleshooting Guide

## ⚠️ Prisma 7 Gotchas
- **P1012 Validation Error**: If you see this, check `schema.prisma`. It likely means you tried to put a `url` or `directUrl` in the `datasource` block. In Prisma 7, these should be managed in `prisma.config.ts`.
- **Driver Adapters**: When using `@prisma/adapter-pg`, ensure the `Pool` configuration matches your serverless runtime limits.

## 🏢 Supabase Pooler (Supavisor)
- **ENOTFOUND Error**: If the pooler returns `tenant not found`, check the cluster prefix. Many guides say `aws-0`, but your project might be on `aws-1` or `aws-2`.
- **Password Sync**: Resetting the database password in the Supabase Dashboard often takes 30-60 seconds to propagate to the pooler.
- **Port 6543**: Only use this with `?pgbouncer=true`. If using standard `pg.Pool` without PGBouncer mode, port `5432` is generally more stable.

## 🛡️ Admin Experience (UX)
- **Dashboard vs Orders**: Ensure the "Admin" menu link appears in the User Profile dropdown for admins. If it doesn't, check the `isHardcodedAdmin` logic in `app/page.tsx`.
- **Kicking Issue**: If you are redirected from `/admin` to `/dashboard` while you *know* you are an admin, it's likely a database connection error during the role check. The code now handles this by allowing hardcoded admins through even if the DB is down.

## 🚀 Vercel Deployments
- **Build Scandals**: Vercel scans the root directory for TypeScript files. Temporary debug scripts (like `scratch/*.ts`) can cause build failures if they have loose typing. **Always delete debug scripts before pushing.**
- **Environment Variables**: Vercel needs both `DATABASE_URL` (pooler) and `DIRECT_URL` (direct) to be set. If `DIRECT_URL` is missing, the app will fall back to the pooler, which might be unstable.
