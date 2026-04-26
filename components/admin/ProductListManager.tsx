"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteProducts } from "@/app/actions/product";
import DeleteProductButton from "./DeleteProductButton";
import { useUIStore } from "@/store/uiStore";

interface ProductListManagerProps {
  products: any[];
}

export default function ProductListManager({ products }: ProductListManagerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { openModal, addToast } = useUIStore();

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;

    openModal({
      title: "Batch Delete Products",
      message: `Are you sure you want to delete ${selectedIds.length} products? This action cannot be undone and will remove all associated images.`,
      confirmLabel: `Delete ${selectedIds.length} Products`,
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteProducts(selectedIds);
          addToast(`${selectedIds.length} products deleted successfully`, "success");
          setSelectedIds([]);
        } catch (error: any) {
          addToast(error.message || "Failed to delete products", "error");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Products Management</h1>
          <p className="text-stone-500 text-sm mt-1">Manage your storefront catalog</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBatchDelete}
              className="px-6 py-3 bg-red-50 text-red-600 text-sm font-bold rounded-full hover:bg-red-100 transition-all shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete ({selectedIds.length})
            </button>
          )}
          <Link href="/admin/products/new" className="inline-flex items-center justify-center px-6 py-3 bg-stone-900 text-[#fdfbf7] text-sm font-bold rounded-full hover:bg-stone-800 transition-all shadow-md active:scale-95">
            Add New Product
          </Link>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Mobile View: Card List */}
        <div className="block lg:hidden divide-y divide-stone-100">
          {products?.map((product) => (
            <div key={product.id} className={`p-4 flex flex-col gap-4 transition-colors ${selectedIds.includes(product.id) ? 'bg-orange-50/30' : ''}`}>
              <div className="flex items-start gap-4">
                <input 
                  type="checkbox"
                  checked={selectedIds.includes(product.id)}
                  onChange={() => toggleSelect(product.id)}
                  className="mt-1 w-5 h-5 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                />
                {product.imageUrl ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-stone-200 flex-shrink-0 bg-white">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-stone-900 truncate">{product.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      product.isActive ? 'bg-orange-100 text-orange-700' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {product.isActive ? 'Active' : 'Draft'}
                    </span>
                  </div>
                  <div className="text-stone-500 text-xs mt-1 font-medium">
                    Rp {product.price.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-2 border-t border-stone-50">
                <Link 
                  href={`/admin/products/${product.id}/edit`} 
                  className="flex-grow text-center py-2 text-stone-700 font-bold text-xs border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Edit Product
                </Link>
                <div className="flex-shrink-0">
                  <DeleteProductButton productId={product.id} productName={product.name} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden lg:block overflow-x-auto scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-500">
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox"
                    checked={selectedIds.length === products.length && products.length > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
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
                <tr key={product.id} className={`hover:bg-stone-50 transition-colors ${selectedIds.includes(product.id) ? 'bg-orange-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="w-5 h-5 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200 bg-white">
                      <img src={product.imageUrl || ""} alt={product.name} className="w-full h-full object-cover" />
                    </div>
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
                      product.isActive ? 'bg-orange-100 text-orange-700' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {product.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-500">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-orange-600 hover:text-orange-500 font-medium text-xs">Edit</Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!products?.length && (
          <div className="py-24 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4 border border-stone-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-stone-900 font-medium mb-1">No products found</p>
              <p className="text-stone-500 text-sm px-6">Get started by adding your first product to the catalog.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
