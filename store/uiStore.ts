import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ModalOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: 'danger' | 'info';
}

interface UIStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  
  modal: ModalOptions | null;
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    
    // Auto remove after 3s
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  
  modal: null,
  openModal: (options) => set({ modal: options }),
  closeModal: () => set({ modal: null }),
}));
