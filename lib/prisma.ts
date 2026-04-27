import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("Neither DIRECT_URL nor DATABASE_URL is set. Prisma will fail if used.");
}

const pool = new Pool({ 
  connectionString: connectionString || "",
  // We use our own pooling (max 10) which is safe for Vercel
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Slightly longer for direct connections
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

