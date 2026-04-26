"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function SyncUser() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      // We don't need to do anything here if we have a robust webhook
      // but we can trigger a "ping" to a sync endpoint if we want to be 100% sure.
      fetch("/api/auth/sync", { method: "POST" }).catch(() => {});
    }
  }, [isSignedIn, user]);

  return null;
}
