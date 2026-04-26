import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function migrate() {
  console.log("Dropping tables...");
  
  // We can't easily run DDL via Supabase client easily unless we use the RPC or a direct connection.
  // Since ts-node can connect via DATABASE_URL, let's use the 'pg' library directly.
  const pkg = await import("pg");
  const { Pool } = pkg.default;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log("Connected to database.");

    await client.query('BEGIN');
    
    // 1. Drop OrderItem and Order
    await client.query('DROP TABLE IF EXISTS "OrderItem" CASCADE');
    await client.query('DROP TABLE IF EXISTS "Order" CASCADE');
    
    // 2. Modify Transaction table
    // Remove productId and variantId if we want, but better to just add TransactionItem
    await client.query(`
      CREATE TABLE IF NOT EXISTS "TransactionItem" (
        "id" TEXT NOT NULL,
        "transactionId" TEXT NOT NULL,
        "productId" TEXT,
        "variantId" TEXT,
        "quantity" INTEGER NOT NULL,
        "price" INTEGER NOT NULL,
        CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
      )
    `);

    // Add foreign keys
    await client.query(`
      ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionId_fkey" 
      FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
    
    await client.query(`
      ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_productId_fkey" 
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `);

    // Optionally remove legacy columns from Transaction if they exist
    // await client.query('ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "productId"');
    // await client.query('ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "variantId"');

    await client.query('COMMIT');
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

migrate();
