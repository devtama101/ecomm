"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/app/actions/product";
import Link from "next/link";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { useUIStore } from "@/store/uiStore";

export default function EditProductForm({ product }: { product: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(product.imageUrl);
  const { addToast } = useUIStore();
  const [variants, setVariants] = useState<{ size: string; color: string; stock: number; imageUrl?: string }[]>(
    product.variants || []
  );

  const addVariant = () => {
    setVariants([...variants, { size: "M", color: "Black", stock: 10, imageUrl: "" }]);
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
    
    const formData = new FormData(e.currentTarget);
    formData.append("existingImageUrl", product.imageUrl || "");
    formData.append("variants", JSON.stringify(variants));
    
    try {
      await updateProduct(product.id, formData);
      addToast("Product updated successfully", "success");
      router.push("/admin/products");
    } catch (err: any) {
      addToast(err.message || "Failed to update product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-8">
        <Link href="/admin/products" className="text-sm text-stone-500 hover:text-stone-900 transition-colors inline-flex items-center gap-2 mb-4">
          &larr; Back to Products
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Edit Product</h1>
        <p className="text-stone-500 mt-1 text-sm sm:text-base">Update details for {product.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Product Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  defaultValue={product.name}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
                <textarea 
                  name="description" 
                  rows={4}
                  defaultValue={product.description || ""}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Base Price (Rp)</label>
                <input 
                  type="number" 
                  name="price" 
                  required
                  min="0"
                  defaultValue={product.price}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Main Product Image</label>
                {imagePreview && (
                  <div className="mb-4 relative w-32 h-32 rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                    <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                )}
                <input 
                  type="file" 
                  name="image" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-[#fdfbf7] hover:file:bg-stone-800 file:cursor-pointer cursor-pointer"
                />
                <p className="text-[10px] text-stone-500 mt-2 italic">Leave empty to keep current image.</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  id="isActive"
                  defaultChecked={product.isActive}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Product Variants</h3>
                <p className="text-stone-500 text-sm">Sizes, colors, and stock levels.</p>
              </div>
              <button 
                type="button"
                onClick={addVariant}
                className="inline-flex items-center justify-center px-6 py-2 bg-stone-100 text-stone-700 text-sm font-bold rounded-full hover:bg-stone-200 transition-colors"
              >
                + Add Variant
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="relative p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                  <button 
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="absolute top-4 right-4 p-2 text-stone-400 hover:text-red-500 transition-colors"
                    aria-label="Remove variant"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pr-10">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-1">Size</label>
                      <input 
                        type="text"
                        value={variant.size}
                        onChange={(e) => updateVariant(index, "size", e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="S, M, L..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-1">Color</label>
                      <input 
                        type="text"
                        value={variant.color}
                        onChange={(e) => updateVariant(index, "color", e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="Black, White..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-1">Stock</label>
                      <input 
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value))}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-orange-500 transition-colors"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-2">Variant Image</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {variant.imageUrl && (
                        <div className="w-16 h-16 rounded-xl border border-stone-200 overflow-hidden flex-shrink-0 bg-white">
                          <img src={variant.imageUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                      )}
                      <input 
                        type="file"
                        name={`variantImage_${index}`}
                        accept="image/*"
                        className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {variants.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-3xl text-stone-400 text-sm italic bg-stone-50/50">
                  No variants added yet. Click "+ Add Variant" to begin.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="fixed sm:static bottom-0 left-0 right-0 p-4 sm:p-0 bg-[#fdfbf7] sm:bg-transparent border-t sm:border-t-0 border-stone-200 z-40">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 max-w-3xl mx-auto">
            <div className="order-2 sm:order-1">
              <DeleteProductButton 
                productId={product.id} 
                productName={product.name} 
                variant="button" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="order-1 sm:order-2 px-8 py-4 bg-stone-900 text-[#fdfbf7] font-bold rounded-full hover:bg-stone-800 shadow-xl sm:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm"
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
