"use client";

import { useState } from "react";
import { toggleUserRole } from "@/app/actions/user";

export default function UserToggle({ 
  clerkId, 
  currentRole, 
  isSelf 
}: { 
  clerkId: string; 
  currentRole: string; 
  isSelf: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isSelf) return;
    
    setIsLoading(true);
    try {
      await toggleUserRole(clerkId, currentRole);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSelf) {
    return <span className="text-xs font-bold text-stone-300 italic">Current User</span>;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`text-xs font-bold transition-all ${
        currentRole === "admin"
          ? "text-red-500 hover:text-red-700"
          : "text-orange-600 hover:text-orange-800"
      } disabled:opacity-50`}
    >
      {isLoading ? "Updating..." : currentRole === "admin" ? "Demote to User" : "Promote to Admin"}
    </button>
  );
}
