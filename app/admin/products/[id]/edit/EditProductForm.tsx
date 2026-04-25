"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/app/actions/product";
import Link from "next/link";
import Image from "next/image";

export default function EditProductForm({ product }: { product: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(product.imageUrl);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    formData.append("existingImageUrl", product.imageUrl || "");
    
    try {
      await updateProduct(product.id, formData);
      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message || "Failed to update product");
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/products" className="text-sm text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-2 mb-4">
          &larr; Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-stone-900">Edit Product</h1>
        <p className="text-stone-500 mt-1">Update details for {product.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

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
          <label className="block text-sm font-medium text-stone-700 mb-2">Price (Rp)</label>
          <input 
            type="number" 
            name="price" 
            required
            min="0"
            defaultValue={product.price}
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Product Image</label>
          {imagePreview && (
            <div className="mb-4 relative w-32 h-32 rounded-xl overflow-hidden border border-stone-200">
              {/* Using standard img tag here to avoid Next Image domain config issues for arbitrary preview blobs/supabase domains for now */}
              <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
            </div>
          )}
          <input 
            type="file" 
            name="image" 
            accept="image/*"
            onChange={handleImageChange}
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-stone-900 file:text-[#fdfbf7] hover:file:bg-stone-800 file:cursor-pointer cursor-pointer"
          />
          <p className="text-xs text-stone-500 mt-2">Leave empty to keep the existing image.</p>
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

        <div className="pt-6 border-t border-stone-100 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-stone-900 text-[#fdfbf7] font-bold rounded-full hover:bg-stone-800 shadow-sm transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
