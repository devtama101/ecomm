import ProductListManager from "@/components/admin/ProductListManager";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <ProductListManager products={products as any} />;
}
