import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true
    }
  });

  if (!product) {
    notFound();
  }

  return <EditProductForm product={product as any} />;
}
