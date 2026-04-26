import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load from .env.local (Next.js convention) with .env as fallback
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use direct database host for migrations (bypasses Supavisor pooler)
    url: process.env["PRISMA_DATABASE_URL"] || process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
