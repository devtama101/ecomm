import { createClient } from "@supabase/supabase-js";
import { incrementProductView } from "@/app/actions/product";
import ProductDetailClient from "@/components/ProductDetailClient";
import { notFound } from "next/navigation";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  // Increment view count
  await incrementProductView(id);

  const { data: product } = await supabase
    .from("Product")
    .select(`
      *,
      images:ProductImage(*),
      variants:ProductVariant(*)
    `)
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-stone-200 bg-[#fdfbf7]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter text-stone-900 uppercase">
            Tama Arts
          </Link>
          <div className="text-sm font-bold text-stone-400 uppercase tracking-widest">
            Artisan Collection 2026
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <ProductDetailClient product={product} />
        </div>
      </main>

      {/* Footer / Related (Simplified) */}
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
