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
  let userId: string | null = null;
  let isAdmin = false;
  let product: any = null;

  try {
    const { id } = await params;
    
    // 1. Auth check
    const authResult = await auth();
    userId = authResult.userId;

    // 2. Fetch User role
    let dbUser = null;
    if (userId) {
      try {
        dbUser = await prisma.user.findUnique({
          where: { clerkId: userId },
          select: { role: true }
        });
      } catch (e) {
        console.error("Product Page User Error:", e);
      }
    }

    isAdmin = dbUser?.role === "admin";
    
    if (isAdmin) {
      redirect("/admin");
    }

    // 3. Fetch Product
    try {
      // Increment view count (fire and forget)
      incrementProductView(id).catch(e => console.error("Increment view error:", e));

      product = await prisma.product.findUnique({
        where: { id },
        include: {
          variants: true
        }
      });
    } catch (e) {
      console.error("Product Page Product Error:", e);
    }

    if (!product) {
      notFound();
    }

  } catch (globalErr) {
    console.error("Product Page Critical Error:", globalErr);
    // If redirect was thrown, re-throw it
    if (globalErr instanceof Error && globalErr.message.includes('NEXT_REDIRECT')) {
      throw globalErr;
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-800">
      <Navbar userId={userId} isAdmin={isAdmin} />

      <main className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {product ? (
            <ProductDetailClient product={product} />
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold">Failed to load product</h2>
              <p className="text-stone-500">Please try again later.</p>
            </div>
          )}
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

