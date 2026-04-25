"use client";

declare global {
  interface Window {
    snap: any;
  }
}

export default function PayButton({ snapToken }: { snapToken: string }) {
  const handlePay = () => {
    if (window.snap) {
      window.snap.pay(snapToken, {
        onSuccess: function () {
          alert("Payment successful! Refreshing...");
          window.location.reload();
        },
        onPending: function () {
          alert("Waiting for your payment!");
        },
        onError: function () {
          alert("Payment failed!");
        },
        onClose: function () {
          alert("You closed the popup without finishing the payment");
        },
      });
    } else {
      alert("Midtrans script not loaded yet.");
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
