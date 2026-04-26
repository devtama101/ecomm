"use client";
import { useUIStore } from "@/store/uiStore";

declare global {
  interface Window {
    snap: any;
  }
}

export default function PayButton({ snapToken }: { snapToken: string }) {
  const { addToast } = useUIStore();

  const handlePay = () => {
    if (window.snap) {
      window.snap.pay(snapToken, {
        onSuccess: function () {
          addToast("Payment successful! Refreshing...", "success");
          setTimeout(() => window.location.reload(), 2000);
        },
        onPending: function () {
          addToast("Waiting for your payment!", "info");
        },
        onError: function () {
          addToast("Payment failed!", "error");
        },
        onClose: function () {
          addToast("You closed the payment popup.", "info");
        },
      });
    } else {
      addToast("Midtrans script not loaded yet.", "error");
    }
  };

  return (
    <button
      onClick={handlePay}
      className="ml-4 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-full transition-colors"
    >
      Pay Now
    </button>
  );
}
