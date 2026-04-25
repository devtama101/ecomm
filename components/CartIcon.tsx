"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

export default function CartIcon({ onClick }: { onClick: () => void }) {
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-stone-500 hover:text-stone-900 transition-colors"
      aria-label="Open cart"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>

      {mounted && itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-stone-900 text-[#fdfbf7] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-[scaleIn_0.2s_ease-out]">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </button>
  );
}
