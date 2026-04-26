"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function logVisit(data: {
  pathname: string;
  userAgent: string;
}) {
  const { userId } = await auth();
  
  try {
    // In local dev, we use a public API to get the visitor's public IP and location
    // In production, you'd use request headers
    const ipResponse = await fetch("http://ip-api.com/json/");
    const locationData = await ipResponse.json();

    const { error } = await supabase.from("Visit").insert({
      clerkId: userId || null,
      ip: locationData.query,
      city: locationData.city,
      region: locationData.regionName,
      country: locationData.country,
      pathname: data.pathname,
      userAgent: data.userAgent,
      // Simple device/browser detection from userAgent can be added here or on client
    });

    if (error) console.error("Analytics Error:", error);
  } catch (err) {
    console.error("Tracking failed:", err);
  }
}
