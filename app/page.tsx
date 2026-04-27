import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ADMIN_EMAILS } from "@/lib/constants";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  let userId: string | null = null;
  let isAdmin = false;
  let products: any[] = [];
  let dbUser = null;

  try {
    // 1. Auth check
    const authResult = await auth();
    userId = authResult.userId;

    const user = await currentUser();

    isAdmin = false;
    
    if (userId && user) {
      const emails = user.emailAddresses.map(e => e.emailAddress.toLowerCase().trim());
      const isHardcodedAdmin = emails.some(email => ADMIN_EMAILS.map(a => a.toLowerCase().trim()).includes(email));

      // 2. Fetch User from Prisma
      try {
        dbUser = await prisma.user.findUnique({
          where: { clerkId: userId },
          select: { role: true }
        });

        // AUTO-PROMOTION: Force admin role in DB if email matches
        if (isHardcodedAdmin && dbUser?.role !== "admin") {
          const primaryEmail = emails[0] || "";
          dbUser = await prisma.user.upsert({
            where: { clerkId: userId },
            update: { role: "admin" },
            create: { clerkId: userId, email: primaryEmail, role: "admin" },
            select: { role: true }
          });
        }
      } catch (dbErr) {
        console.error("Home Page DB User Error:", dbErr);
      }

      isAdmin = isHardcodedAdmin || dbUser?.role === "admin";
    }
    
    if (isAdmin) {
      redirect("/admin");
    }

    // 4. Fetch Products
    try {
      products = await prisma.product.findMany({
        where: { isActive: true },
        include: { variants: true },
        orderBy: { price: 'desc' }
      });
    } catch (prodErr) {
      console.error("Home Page Products Fetch Error:", prodErr);
      products = [];
    }

  } catch (globalErr) {
    // If it's a redirect, we MUST re-throw it so Next.js handles it
    if (globalErr instanceof Error && globalErr.message.includes('NEXT_REDIRECT')) {
      throw globalErr;
    }
    console.error("Critical Home Page Error:", globalErr);
  }


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
            {products && products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
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

