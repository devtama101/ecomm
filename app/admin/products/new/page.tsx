"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/actions/product";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [variants, setVariants] = useState<{ size: string; color: string; stock: number }[]>([]);

  const addVariant = () => {
    setVariants([...variants, { size: "M", color: "Black", stock: 10 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    formData.append("variants", JSON.stringify(variants));
    
    try {
      await createProduct(formData);
      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-8">
        <Link href="/admin/products" className="text-sm text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-2 mb-4">
          &larr; Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-stone-900">Add New Product</h1>
        <p className="text-stone-500 mt-1">Create a new item in your catalog.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Product Name</label>
              <input 
                type="text" 
                name="name" 
                required
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                placeholder="e.g. Premium Wool Sweater"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
              <textarea 
                name="description" 
                rows={4}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                placeholder="Describe the material, fit, and style..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Base Price (Rp)</label>
              <input 
                type="number" 
                name="price" 
                required
                min="0"
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                placeholder="e.g. 500000"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Main Product Image</label>
              <input 
                type="file" 
                name="image" 
                accept="image/*"
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-stone-900 file:text-[#fdfbf7] hover:file:bg-stone-800 file:cursor-pointer cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Gallery Images</label>
              <input 
                type="file" 
                name="gallery" 
                accept="image/*"
                multiple
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 file:cursor-pointer cursor-pointer"
              />
              <p className="text-xs text-stone-500 mt-2">Select multiple images for the product gallery.</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input 
                type="checkbox" 
                name="isActive" 
                id="isActive"
                defaultChecked
                className="w-5 h-5 rounded border-stone-300 bg-white text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-stone-700">
                Active (visible to customers)
              </label>
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="pt-8 border-t border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Product Variants</h3>
              <p className="text-stone-500 text-sm">Add different sizes, colors, and their stock levels.</p>
            </div>
            <button 
              type="button"
              onClick={addVariant}
              className="px-4 py-2 bg-stone-100 text-stone-700 text-sm font-semibold rounded-full hover:bg-stone-200 transition-colors"
            >
              + Add Variant
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="flex flex-wrap items-end gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-1">Size</label>
                  <input 
                    type="text"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, "size", e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="S, M, L..."
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-1">Color</label>
                  <input 
                    type="text"
                    value={variant.color}
                    onChange={(e) => updateVariant(index, "color", e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Black, White..."
                  />
                </div>
                <div className="flex-1 min-w-[80px]">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-1">Stock</label>
                  <input 
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-orange-500 transition-colors"
                    min="0"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {variants.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 text-sm">
                No variants added yet. Add at least one to manage stock.
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-stone-900 text-[#fdfbf7] font-bold rounded-full hover:bg-stone-800 shadow-sm transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
