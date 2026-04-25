import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export default async function AdminOverviewPage(props: { searchParams?: Promise<{ sort?: string }> }) {
  const searchParams = await props.searchParams;
  const sort = searchParams?.sort || "viewed";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  // Fetch total products
  const { count: productCount } = await supabase
    .from("Product")
    .select("*", { count: "exact", head: true });

  // Fetch total transactions
  const { count: transactionCount } = await supabase
    .from("Transaction")
    .select("*", { count: "exact", head: true });

  // Fetch sales to calculate "Most Sold"
  const { data: sales } = await supabase
    .from("Transaction")
    .select("productId")
    .eq("status", "settlement");

  const salesCount: Record<string, number> = {};
  sales?.forEach((s) => {
    if (s.productId) {
      salesCount[s.productId] = (salesCount[s.productId] || 0) + 1;
    }
  });

  // Fetch all products
  const { data: products } = await supabase
    .from("Product")
    .select("id, name, viewCount, price, imageUrl");

  // Sort products
  const topProducts = (products || []).map(p => ({
    ...p,
    soldCount: salesCount[p.id] || 0
  })).sort((a, b) => {
    if (sort === "sold") {
      if (b.soldCount !== a.soldCount) {
        return b.soldCount - a.soldCount;
      }
      // If sold count is same, fallback to most viewed
      return b.viewCount - a.viewCount;
    }
    
    // Default to 'viewed'
    if (b.viewCount !== a.viewCount) {
      return b.viewCount - a.viewCount;
    }
    // If viewed count is same, fallback to most sold
    return b.soldCount - a.soldCount;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-2 text-stone-900 tracking-tight">Overview</h1>
          <p className="text-stone-500 font-medium">Quick stats and analytics for your store.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm flex flex-col justify-center">
          <p className="text-stone-500 font-medium mb-1">Total Products</p>
          <p className="text-4xl font-black text-stone-900">{productCount || 0}</p>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm flex flex-col justify-center">
          <p className="text-stone-500 font-medium mb-1">Total Transactions</p>
          <p className="text-4xl font-black text-stone-900">{transactionCount || 0}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Product Traffic</h2>
        <div className="flex gap-2">
          <Link 
            href="/admin?sort=viewed" 
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${sort === 'viewed' ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            Most Viewed
          </Link>
          <Link 
            href="/admin?sort=sold" 
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${sort === 'sold' ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            Most Sold
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-stone-50 text-stone-500 font-semibold tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4">Product</th>
                <th scope="col" className="px-6 py-4">Price</th>
                <th scope="col" className="px-6 py-4 text-center">Sold</th>
                <th scope="col" className="px-6 py-4 text-right">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {topProducts?.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 relative border border-stone-200/50">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="font-semibold text-stone-900">{product.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-stone-600 font-medium">
                    Rp {product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full font-semibold border border-green-100">
                      {product.soldCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full font-semibold border border-orange-100">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {product.viewCount}
                    </span>
                  </td>
                </tr>
              ))}
              
              {!topProducts?.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-500 font-medium">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
