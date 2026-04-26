"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { createMultiItemTransaction } from "@/actions/payment.action";
import Link from "next/link";
import { useUIStore } from "@/store/uiStore";

declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutClient() {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { addToast } = useUIStore();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#fdfbf7]">
        <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto text-center">
          <p className="text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!isSignedIn || items.length === 0) return;

    setIsLoading(true);
    try {
      const result = await createMultiItemTransaction(
        items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        }))
      );

      if (result.success && result.snapToken) {
        window.snap.pay(result.snapToken, {
          onSuccess: function () {
            clearCart();
            addToast("Payment successful! Redirecting...", "success");
            setTimeout(() => window.location.href = "/dashboard", 1500);
          },
          onPending: function () {
            clearCart();
            addToast("Waiting for your payment! Check status in dashboard.", "info");
            setTimeout(() => window.location.href = "/dashboard", 1500);
          },
          onError: function () {
            addToast("Payment failed! Please try again.", "error");
          },
          onClose: function () {
            // User closed without paying
          },
        });
      } else {
        addToast(result.message || "Failed to initiate payment", "error");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] text-stone-800">
        <nav className="fixed top-0 w-full z-50 border-b border-stone-200 bg-[#fdfbf7]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
            <Link href="/" className="text-2xl font-black tracking-tighter text-stone-900 uppercase">
              Tama Arts
            </Link>
          </div>
        </nav>

        <div className="pt-40 pb-20 px-6 max-w-3xl mx-auto text-center">
          <svg className="w-20 h-20 text-stone-200 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <h1 className="text-3xl font-black text-stone-900 mb-3">Your cart is empty</h1>
          <p className="text-stone-400 mb-8">Add some items from the store first.</p>
          <Link href="/" className="inline-block px-8 py-4 bg-stone-900 text-[#fdfbf7] rounded-full font-bold hover:bg-stone-800 transition-colors shadow-lg">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-800">
      <nav className="fixed top-0 w-full z-50 border-b border-stone-200 bg-[#fdfbf7]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter text-stone-900 uppercase">
            Tama Arts
          </Link>
          <Link href="/" className="text-sm font-semibold text-stone-400 hover:text-stone-900 transition-colors">
            ← Back to Store
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-black text-stone-900 tracking-tight mb-2">Checkout</h1>
          <p className="text-stone-400 font-medium mb-12">{items.length} item{items.length > 1 ? "s" : ""} in your order</p>

          {/* Order Items */}
          <div className="space-y-4 mb-12">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-5 bg-white rounded-2xl p-5 border border-stone-100 shadow-sm"
              >
                <div className="w-20 h-24 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">No img</div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-stone-900">{item.name}</h3>
                  <p className="text-sm text-stone-400 font-medium">{item.size} · {item.color}</p>
                  <p className="text-sm text-stone-400 mt-1">Qty: {item.quantity}</p>
                </div>

                <div className="text-right flex flex-col justify-between">
                  <p className="font-black text-stone-900">Rp {(item.price * item.quantity).toLocaleString()}</p>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-xs text-stone-300 hover:text-red-500 transition-colors font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
            <h2 className="text-lg font-black text-stone-900 mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-stone-400 font-medium">Subtotal</span>
                <span className="font-bold text-stone-900">Rp {getTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400 font-medium">Shipping</span>
                <span className="font-bold text-stone-500">Calculated at next step</span>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-4 mb-8">
              <div className="flex justify-between">
                <span className="text-lg font-black text-stone-900">Total</span>
                <span className="text-lg font-black text-stone-900">Rp {getTotal().toLocaleString()}</span>
              </div>
            </div>

            {isSignedIn ? (
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full py-5 bg-stone-900 text-[#fdfbf7] rounded-full text-lg font-black hover:bg-stone-800 transition-all shadow-xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            ) : (
              <SignInButton mode="modal" forceRedirectUrl="/checkout">
                <button className="w-full py-5 bg-stone-900 text-[#fdfbf7] rounded-full text-lg font-black hover:bg-stone-800 transition-all shadow-xl">
                  Sign In to Checkout
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
