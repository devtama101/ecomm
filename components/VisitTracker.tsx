"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logVisit } from "@/app/actions/analytics";

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const track = async () => {
      // Don't track admin pages to keep analytics clean of owner actions
      if (pathname.startsWith("/admin")) return;

      await logVisit({
        pathname: pathname,
        userAgent: window.navigator.userAgent,
      });
    };

    track();
  }, [pathname]);

  return null; // Invisible component
}
