"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useUser, useClerk } from "@clerk/nextjs";
import { createMultiItemTransaction } from "@/actions/payment.action";
import { useUIStore } from "@/store/uiStore";

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const addItem = useCartStore((s) => s.addItem);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useUIStore();

  // Get first available variant
  const defaultVariant = product.variants?.find((v: any) => v.stock > 0) || product.variants?.[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openSignIn({ forceRedirectUrl: window.location.href });
      return;
    }

    if (!defaultVariant) {
      addToast("This product is currently out of stock.", "error");
      return;
    }

    addItem({
      productId: product.id,
      variantId: defaultVariant.id,
      name: product.name,
      price: product.price,
      imageUrl: defaultVariant.imageUrl || product.imageUrl,
      size: defaultVariant.size,
      color: defaultVariant.color,
    });

    // Optional: show a small toast or feedback
    addToast(`Added ${product.name} (${defaultVariant.size} - ${defaultVariant.color}) to cart!`, "success");
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openSignIn({ forceRedirectUrl: window.location.href });
      return;
    }

    if (!defaultVariant) {
      addToast("This product is currently out of stock.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createMultiItemTransaction([
        {
          productId: product.id,
          variantId: defaultVariant.id,
          quantity: 1,
        },
      ]);

      if (result.success && result.snapToken) {
        window.snap.pay(result.snapToken, {
          onSuccess: function () {
            window.location.href = "/dashboard";
          },
          onPending: function () {
            window.location.href = "/dashboard";
          },
          onError: function () {
            addToast("Payment failed! Please try again.", "error");
          },
        });
      } else {
        addToast(result.message || "Failed to initiate payment", "error");
      }
    } catch (error) {
      console.error("Buy Now Error:", error);
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group flex flex-col hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1">
      {/* Clickable Area for Details */}
      <Link href={`/product/${product.id}`} className="flex-grow flex flex-col">
        {/* Product Image */}
        <div className="aspect-[4/5] w-full bg-stone-100 relative overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out" 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-stone-300">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="p-8 pb-4 flex-grow flex flex-col">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2 text-stone-900 tracking-tight">{product.name}</h2>
            <p className="text-stone-500 leading-relaxed text-sm font-medium line-clamp-2">
              {product.description}
            </p>
          </div>

          <div className="mt-auto">
            <p className="text-2xl font-black text-stone-900">Rp {product.price.toLocaleString()}</p>
          </div>
        </div>
      </Link>

      {/* Buttons Area */}
      <div className="p-8 pt-0 flex gap-3">
        <button
          onClick={handleBuyNow}
          disabled={isLoading}
          className="flex-1 py-4 bg-stone-900 text-[#fdfbf7] rounded-full text-center font-bold hover:bg-stone-800 transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-[#fdfbf7]/30 border-t-[#fdfbf7] rounded-full animate-spin" />
          ) : (
            "Buy Now"
          )}
        </button>
        <button
          onClick={handleAddToCart}
          title="Add to Cart"
          className="w-14 h-14 bg-stone-100 text-stone-900 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors shrink-0"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
