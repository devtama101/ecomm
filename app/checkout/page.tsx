import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CheckoutClient from "@/components/CheckoutClient";
import { prisma } from "@/lib/prisma";

export default async function CheckoutPage() {
  const { userId } = await auth();

  // If logged in, check role using Prisma (bypasses RLS)
  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    });

    if (dbUser?.role === "admin") {
      redirect("/admin");
    }
  }

  return <CheckoutClient />;
}
