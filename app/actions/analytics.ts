"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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

    await prisma.visit.create({
      data: {
        clerkId: userId || null,
        ip: locationData.query || "unknown",
        city: locationData.city || "unknown",
        region: locationData.regionName || "unknown",
        country: locationData.country || "unknown",
        pathname: data.pathname,
        userAgent: data.userAgent,
      }
    });
  } catch (err) {
    console.error("Tracking failed:", err);
  }
}
