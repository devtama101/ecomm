"use client";

import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { createSnapTransaction } from "@/actions/payment.action";

// Extend window object to include snap
declare global {
  interface Window {
    snap: any;
  }
}

interface CheckoutButtonProps {
  amount: number;
}

export default function CheckoutButton({ amount }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();

  const handleCheckout = async () => {
    if (!isSignedIn) return; // Should not be reachable as button is wrapped

    setIsLoading(true);
    try {
      const result = await createSnapTransaction(amount);

      if (result.success && result.snapToken) {
        window.snap.pay(result.snapToken, {
          onSuccess: function (result: any) {
            console.log("success", result);
            alert("Payment successful! Redirecting to your dashboard...");
            window.location.href = "/dashboard";
          },
          onPending: function (result: any) {
            console.log("pending", result);
            alert("Waiting for your payment! You can check the status in your dashboard.");
            window.location.href = "/dashboard";
          },
          onError: function (result: any) {
            console.log("error", result);
            alert("Payment failed!");
          },
          onClose: function () {
            console.log("customer closed the popup without finishing the payment");
            alert("You closed the popup without finishing the payment");
          },
        });
      } else {
        alert(result.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert(`Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonContent = (
    <button
      onClick={isSignedIn ? handleCheckout : undefined}
      disabled={isLoading}
      className={`
        relative group px-8 py-4 bg-gradient-to-br from-indigo-600 to-violet-700 
        hover:from-indigo-500 hover:to-violet-600
        text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl 
        transition-all duration-300 transform hover:-translate-y-1 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        flex items-center gap-3 overflow-hidden
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
            className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Checkout Now (Rp {amount.toLocaleString()})</span>
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
