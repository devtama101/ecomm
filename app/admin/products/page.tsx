import ProductListManager from "@/components/admin/ProductListManager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Admin Products Page Error:", error);
    products = [];
  }

  return <ProductListManager products={products as any} />;
}
