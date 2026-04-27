import { auth } from "@clerk/nextjs/server";
import { incrementProductView } from "@/app/actions/product";
import ProductDetailClient from "@/components/ProductDetailClient";
import Navbar from "@/components/Navbar";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();

  // Get user role for navbar (using Prisma to bypass RLS)
  const dbUser = userId ? await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true }
  }) : null;

  const isAdmin = dbUser?.role === "admin";
  
  if (isAdmin) {
    redirect("/admin");
  }

  // Increment view count
  await incrementProductView(id);

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true
    }
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-800">
      <Navbar userId={userId} isAdmin={isAdmin} />

      <main className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <ProductDetailClient product={product as any} />
        </div>
      </main>

      <footer className="border-t border-stone-200 py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-stone-400 font-medium mb-4">© 2026 Tama Arts. All rights reserved.</p>
          <div className="flex justify-center gap-8 text-sm font-bold text-stone-900 uppercase tracking-widest">
            <Link href="#" className="hover:opacity-50 transition-opacity">Instagram</Link>
            <Link href="#" className="hover:opacity-50 transition-opacity">Shipping</Link>
            <Link href="#" className="hover:opacity-50 transition-opacity">Returns</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
