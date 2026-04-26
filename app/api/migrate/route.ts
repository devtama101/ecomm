import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Starting remote migration...");
    
    // 1. Drop old tables
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "OrderItem" CASCADE');
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "Order" CASCADE');
    
    // 2. Create TransactionItem table
    await prisma.$executeRawUnsafe(`
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

    // 3. Add foreign keys
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionId_fkey" 
      FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_productId_fkey" 
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `);

    // 4. Remove old columns if needed (optional)
    // await prisma.$executeRawUnsafe('ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "productId"');
    // await prisma.$executeRawUnsafe('ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "variantId"');

    console.log("Remote migration successful!");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
