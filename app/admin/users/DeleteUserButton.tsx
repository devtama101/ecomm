"use client";

import { useState } from "react";
import { deleteUser } from "@/app/actions/user";
import { useUIStore } from "@/store/uiStore";

export default function DeleteUserButton({ 
  clerkId, 
  userEmail,
  isSelf 
}: { 
  clerkId: string; 
  userEmail: string;
  isSelf: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast, openModal } = useUIStore();

  const handleDelete = async () => {
    if (isSelf) return;

    openModal({
      title: "Delete User",
      message: `Are you sure you want to delete ${userEmail}? This will also delete all their associated data. This action cannot be undone.`,
      confirmText: "Delete User",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await deleteUser(clerkId);
          addToast("User deleted successfully", "success");
        } catch (error: any) {
          addToast(error.message, "error");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  if (isSelf) return null;

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 ml-4"
    >
      {isLoading ? "Deleting..." : "Delete"}
    </button>
  );
}
