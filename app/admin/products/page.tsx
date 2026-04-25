import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AdminProductsPage() {
  const { data: products } = await supabase
    .from("Product")
    .select("*")
    .order("createdAt", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Products Management</h1>
          <p className="text-stone-500 text-sm mt-1">Manage your storefront catalog</p>
        </div>
        <Link href="/admin/products/new" className="px-4 py-2 bg-stone-900 text-[#fdfbf7] text-sm font-semibold rounded-full hover:bg-stone-800 transition-colors shadow-sm">
          Add New Product
        </Link>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-stone-500">
              <th className="px-6 py-4 font-medium w-16">Image</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Created</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products?.map((product) => (
              <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  {product.imageUrl ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center">
                      <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-stone-900">{product.name}</div>
                  <div className="text-stone-500 text-xs mt-1 truncate max-w-xs">{product.description}</div>
                </td>
                <td className="px-6 py-4 text-stone-700 font-medium">
                  Rp {product.price.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    product.isActive 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-stone-100 text-stone-500'
                  }`}>
                    {product.isActive ? 'Active' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-stone-500">
                  {new Date(product.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/products/${product.id}/edit`} className="text-orange-600 hover:text-orange-500 font-medium text-xs">Edit</Link>
                </td>
              </tr>
            ))}
            {!products?.length && (
              <tr>
                <td colSpan={6} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4 border border-stone-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p className="text-stone-900 font-medium mb-1">No products found</p>
                    <p className="text-stone-500 text-sm">Get started by adding your first product to the catalog.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

