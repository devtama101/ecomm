"use client";

import { useState } from "react";
import { deleteProduct } from "@/app/actions/product";
import { useRouter } from "next/navigation";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
  variant?: "icon" | "button";
}

export default function DeleteProductButton({ 
  productId, 
  productName,
  variant = "icon" 
}: DeleteProductButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteProduct(productId);
      if (variant === "button") {
        router.push("/admin/products");
      }
    } catch (error: any) {
      alert(error.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "button") {
    return (
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-8 py-3 border border-red-200 text-red-600 font-bold rounded-full hover:bg-red-50 transition-all disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete Product"}
      </button>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-stone-300 hover:text-red-500 transition-colors p-1"
      title="Delete Product"
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
    </button>
  );
}
