"use client";

import { useCartStore, CartItem } from "@/store/cartStore";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotal = useCartStore((s) => s.getTotal);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#fdfbf7] z-[70] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200">
          <h2 className="text-xl font-black text-stone-900 tracking-tight">
            Your Cart
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg
                className="w-16 h-16 text-stone-200 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <p className="text-stone-400 font-semibold mb-1">
                Your cart is empty
              </p>
              <p className="text-stone-300 text-sm">
                Add some items to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItemRow
                  key={item.variantId}
                  item={item}
                  onRemove={() => removeItem(item.variantId)}
                  onUpdateQty={(qty) => updateQuantity(item.variantId, qty)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-wider text-stone-400">
                Subtotal
              </span>
              <span className="text-xl font-black text-stone-900">
                Rp {getTotal().toLocaleString()}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full py-4 bg-stone-900 text-[#fdfbf7] rounded-full text-center font-bold hover:bg-stone-800 transition-colors shadow-lg"
            >
              Checkout
            </Link>
            <button
              onClick={onClose}
              className="block w-full text-center text-sm text-stone-400 font-semibold hover:text-stone-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function CartItemRow({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
}) {
  return (
    <div className="flex gap-4 bg-white rounded-2xl p-4 border border-stone-100">
      {/* Thumbnail */}
      <div className="w-20 h-24 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
            No img
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-stone-900 text-sm truncate">
          {item.name}
        </h3>
        <p className="text-xs text-stone-400 font-medium mt-0.5">
          {item.size} · {item.color}
        </p>
        <p className="text-sm font-bold text-stone-900 mt-2">
          Rp {item.price.toLocaleString()}
        </p>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity controls */}
          <div className="flex items-center gap-2 bg-stone-50 rounded-full px-1 py-0.5">
            <button
              onClick={() => onUpdateQty(item.quantity - 1)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors font-bold text-sm"
            >
              −
            </button>
            <span className="text-sm font-black text-stone-900 w-6 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(item.quantity + 1)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors font-bold text-sm"
            >
              +
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={onRemove}
            className="text-stone-300 hover:text-red-500 transition-colors p-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
