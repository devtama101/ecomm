import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";

export default async function StorePage() {
  const { userId } = await auth();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const user = await currentUser();
  let dbUser = null;
  
  if (userId) {
    const { data } = await supabase
      .from("User")
      .select("role")
      .eq("clerkId", userId)
      .single();
    dbUser = data;

    // If logged in but not in DB, create user (Sync)
    if (!dbUser && user) {
      try {
        const email = user.emailAddresses[0].emailAddress;
        const { data: newUser } = await supabase
          .from("User")
          .insert([{ clerkId: userId, email, role: "user" }])
          .select("role")
          .single();
        dbUser = newUser;
      } catch (e) {
        console.error("Home sync error:", e);
      }
    }
  }

  const isAdmin = dbUser?.role === "admin";
  
  if (isAdmin) {
    redirect("/admin");
  }

  const { data: products } = await supabase
    .from("Product")
    .select("*, variants:ProductVariant(*)")
    .eq("isActive", true)
    .order("price", { ascending: false });

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-800 selection:bg-orange-200">
      <Navbar userId={userId} isAdmin={isAdmin} />

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
              <ProductCard key={product.id} product={product} />
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
