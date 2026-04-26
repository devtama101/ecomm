"use client";

import { useUIStore } from "@/store/uiStore";
import { useEffect, useState } from "react";

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-300
            ${toast.type === 'success' ? 'bg-stone-900 text-[#fdfbf7]' : ''}
            ${toast.type === 'error' ? 'bg-red-600 text-white' : ''}
            ${toast.type === 'info' ? 'bg-stone-100 text-stone-900 border border-stone-200' : ''}
          `}
        >
          {toast.type === 'success' && (
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-sm font-bold tracking-tight">{toast.message}</span>
          <button 
            onClick={() => removeToast(toast.id)}
            className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export function ModalContainer() {
  const { modal, closeModal } = useUIStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !modal) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await modal.onConfirm();
      closeModal();
    } catch (error) {
      console.error("Modal confirm error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={closeModal}
      />
      <div className="relative bg-[#fdfbf7] border border-stone-200 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-2xl font-bold text-stone-900 mb-2">{modal.title}</h3>
        <p className="text-stone-500 mb-8 leading-relaxed">{modal.message}</p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`
              flex-1 py-4 px-6 rounded-full font-bold text-sm transition-all active:scale-95 disabled:opacity-50
              ${modal.variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-stone-900 text-[#fdfbf7] hover:bg-stone-800'}
            `}
          >
            {loading ? "Processing..." : (modal.confirmLabel || "Confirm")}
          </button>
          <button
            onClick={() => {
              if (modal.onCancel) modal.onCancel();
              closeModal();
            }}
            disabled={loading}
            className="flex-1 py-4 px-6 rounded-full font-bold text-sm text-stone-500 border border-stone-200 hover:bg-stone-50 transition-all active:scale-95 disabled:opacity-50"
          >
            {modal.cancelLabel || "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
