import CheckoutButton from "@/components/CheckoutButton";
import { UserButton, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

export default async function StorePage() {
  const { userId } = await auth();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: dbUser } = userId ? await supabase
    .from("User")
    .select("role")
    .eq("clerkId", userId)
    .single() : { data: null };

  const isAdmin = dbUser?.role === "admin";

  const { data: products } = await supabase
    .from("Product")
    .select("*")
    .eq("isActive", true)
    .order("price", { ascending: false });

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-800 selection:bg-orange-200">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-stone-200 bg-[#fdfbf7]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter text-stone-900 uppercase">
            Tama Arts
          </Link>
          
          <div className="flex items-center gap-8 text-sm font-medium text-stone-500">
            {userId ? (
              <>
                {isAdmin ? (
                  <Link href="/admin" className="hover:text-stone-900 transition-colors">Dashboard</Link>
                ) : (
                  <Link href="/dashboard" className="hover:text-stone-900 transition-colors">Transactions</Link>
                )}
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal" forceRedirectUrl="/">
                  <button className="px-5 py-2.5 bg-stone-900 text-[#fdfbf7] rounded-full hover:bg-stone-800 transition-all font-semibold shadow-md">
                    Sign In
                  </button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-24 relative">
            <h1 className="relative text-6xl md:text-8xl font-black tracking-tighter mb-8 text-stone-900 drop-shadow-sm">
              Artisan Clothing <br className="hidden md:block"/> Collection.
            </h1>
            <p className="relative text-xl text-stone-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Discover our curated selection of premium garments. Crafted with care, designed for life.
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {products?.map((product) => (
              <Link 
                key={product.id} 
                href={`/product/${product.id}`}
                className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group flex flex-col hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="aspect-[4/5] w-full bg-stone-100 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="p-8 flex-grow flex flex-col">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2 text-stone-900 tracking-tight">{product.name}</h2>
                    <p className="text-stone-500 leading-relaxed text-sm font-medium line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <div className="mb-6 flex justify-between items-end">
                      <p className="text-2xl font-black text-stone-900">Rp {product.price.toLocaleString()}</p>
                    </div>
                    <div className="w-full py-4 bg-stone-900 text-[#fdfbf7] rounded-full text-center font-bold group-hover:bg-stone-800 transition-colors shadow-lg">
                      View Details
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {!products?.length && (
              <div className="col-span-full py-24 text-center">
                <h3 className="text-xl font-bold text-stone-900 mb-2">No items available</h3>
                <p className="text-stone-500">Check back later for our new collection.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
