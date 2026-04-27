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
    const authResult = await auth();
    userId = authResult.userId;
    const user = await currentUser();

    if (userId && user) {
      const emails = user.emailAddresses.map(e => e.emailAddress.toLowerCase().trim());
      const isHardcodedAdmin = emails.some(email => ADMIN_EMAILS.map(a => a.toLowerCase().trim()).includes(email));

      try {
        dbUser = await prisma.user.findUnique({
          where: { clerkId: userId },
          select: { role: true }
        });

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
  } catch (globalErr) {
    if (globalErr instanceof Error && globalErr.message.includes('NEXT_REDIRECT')) {
      throw globalErr;
    }
  }

  // Fetch Products & CMS Content
  let settings = { brandName: "Tama Arts", whatsappNumber: "", whatsappMessage: "" };
  let cms: any = { 
    hero: { title: "Artisan Clothing Collection.", subtitle: "Discover our curated selection of premium garments. Crafted with care, designed for life.", cta: "Shop the Collection" },
    story: { title: "The Craft Behind the Art", description: "Every piece in our collection is born from a commitment to traditional techniques and modern silhouettes. We work with local artisans to ensure every stitch tells a story of quality and heritage.", imageUrl: "" }
  };

  try {
    const [dbSettings, dbContent, dbProducts] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: "global" } }),
      prisma.pageContent.findMany({ where: { page: "home" } }),
      prisma.product.findMany({ where: { isActive: true }, include: { variants: true }, orderBy: { price: 'desc' } })
    ]);

    if (dbSettings) settings = dbSettings as any;
    dbContent.forEach(item => {
      if (!cms[item.section]) cms[item.section] = {};
      cms[item.section][item.key] = item.value;
    });
    products = dbProducts;
  } catch (err) {
    console.error("Home Page Data Fetch Error:", err);
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-800 selection:bg-orange-200">
      <Navbar userId={userId} isAdmin={isAdmin} brandName={settings.brandName} />

      <main className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16 relative">
            <h1 className="relative text-5xl md:text-8xl font-black tracking-tighter mb-8 text-stone-900 drop-shadow-sm whitespace-pre-line">
              {cms.hero.title}
            </h1>
            <p className="relative text-lg md:text-xl text-stone-500 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
              {cms.hero.subtitle}
            </p>
            
            {/* WhatsApp CTA */}
            {settings.whatsappNumber && (
              <a 
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage || "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-600 text-white px-8 py-4 rounded-full font-bold hover:bg-green-700 transition-all shadow-xl hover:scale-105 active:scale-95 group"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contact via WhatsApp
              </a>
            )}
          </div>

          {/* Product Grid */}
          <div className="mb-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-stone-900 italic tracking-tight">Our Collection</h2>
              <div className="h-px flex-grow mx-8 bg-stone-200 hidden sm:block"></div>
            </div>
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

          {/* The Craft Section */}
          <section className="py-24 border-t border-stone-200 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-orange-100/50 rounded-3xl -rotate-2 scale-95 group-hover:rotate-0 group-hover:scale-100 transition-all duration-500"></div>
                <div className="relative aspect-[4/5] bg-stone-200 rounded-2xl overflow-hidden shadow-2xl">
                  {cms.story.imageUrl ? (
                    <img src={cms.story.imageUrl} alt="The Craft" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold uppercase tracking-widest bg-stone-100 italic">
                      Workshop Gallery
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-8">
                <span className="inline-block text-orange-600 font-bold tracking-widest uppercase text-sm">Our Philosophy</span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-stone-900 leading-none">
                  {cms.story.title}
                </h2>
                <p className="text-lg text-stone-600 leading-relaxed font-medium whitespace-pre-line">
                  {cms.story.description}
                </p>
                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div>
                    <h4 className="font-black text-stone-900 text-3xl mb-1">100%</h4>
                    <p className="text-stone-500 text-sm font-bold uppercase tracking-wider">Handmade</p>
                  </div>
                  <div>
                    <h4 className="font-black text-stone-900 text-3xl mb-1">20+</h4>
                    <p className="text-stone-500 text-sm font-bold uppercase tracking-wider">Local Artisans</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Process Highlights */}
          <section className="py-24 bg-stone-900 rounded-[3rem] text-white px-8 md:px-16 mb-24 shadow-2xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 italic">Artisanal Standards</h2>
              <p className="text-stone-400 max-w-xl mx-auto font-medium">We uphold the highest quality in every step of our process.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center space-y-4 group">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Premium Quality</h3>
                <p className="text-stone-400 text-sm leading-relaxed">Sourced from the finest materials to ensure durability and lasting comfort.</p>
              </div>
              <div className="text-center space-y-4 group">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Thoughtful Design</h3>
                <p className="text-stone-400 text-sm leading-relaxed">Every silhouette is carefully considered to balance tradition and modern life.</p>
              </div>
              <div className="text-center space-y-4 group">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Ethical Sourcing</h3>
                <p className="text-stone-400 text-sm leading-relaxed">Working directly with local craftsmen to support sustainable communities.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
