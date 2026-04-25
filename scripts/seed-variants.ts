import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const connectionString = `${process.env.DIRECT_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = await prisma.product.findMany();
  
  const sizes = ["S", "M", "L", "XL"];
  const colors = ["Stone", "Cream", "Black", "Sand"];

  for (const product of products) {
    console.log(`Seeding variants for ${product.name}...`);
    
    // Create 3-5 variants per product
    for (let i = 0; i < 4; i++) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          size: sizes[Math.floor(Math.random() * sizes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          stock: Math.floor(Math.random() * 50) + 5, // 5 to 54
        }
      });
    }

    // Add dummy gallery images (placeholder)
    for (let i = 1; i <= 3; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: product.imageUrl || `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop`,
          order: i,
        }
      });
    }
  }

  console.log("Seeding variants complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
