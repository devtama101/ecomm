"use client";

import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { createSnapTransaction } from "@/actions/payment.action";
import { useUIStore } from "@/store/uiStore";

// Extend window object to include snap
declare global {
  interface Window {
    snap: any;
  }
}

interface CheckoutButtonProps {
  productId: string;
  price: number;
}

export default function CheckoutButton({ productId, price }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const { addToast } = useUIStore();

  const handleCheckout = async () => {
    if (!isSignedIn) return; // Should not be reachable as button is wrapped

    setIsLoading(true);
    try {
      const result = await createSnapTransaction(productId);

      if (result.success && result.snapToken) {
        window.snap.pay(result.snapToken, {
          onSuccess: function (result: any) {
            console.log("success", result);
            addToast("Payment successful! Redirecting...", "success");
            setTimeout(() => window.location.href = "/dashboard", 1500);
          },
          onPending: function (result: any) {
            console.log("pending", result);
            addToast("Waiting for your payment! Checking status...", "info");
            setTimeout(() => window.location.href = "/dashboard", 1500);
          },
          onError: function (result: any) {
            console.log("error", result);
            addToast("Payment failed!", "error");
          },
          onClose: function () {
            addToast("You closed the payment popup.", "info");
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

  const buttonContent = (
    <button
      onClick={isSignedIn ? handleCheckout : undefined}
      disabled={isLoading}
      className={`
        w-full group px-6 py-4 bg-stone-900 
        hover:bg-stone-800
        text-[#fdfbf7] font-bold rounded-2xl shadow-lg hover:shadow-xl 
        transition-all duration-300 transform hover:-translate-y-1 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        flex items-center justify-center gap-3 overflow-hidden relative
      `}
    >
      <div className="absolute inset-0 w-1/2 h-full skew-x-[-20deg] bg-white/10 group-hover:left-full transition-all duration-700 -left-full" />
      
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Buy Now</span>
        </>
      )}
    </button>
  );

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal" forceRedirectUrl="/">
        {buttonContent}
      </SignInButton>
    );
  }

  return buttonContent;
}
