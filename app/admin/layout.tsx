import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ADMIN_EMAILS } from "@/lib/constants";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    const user = await currentUser();

    if (!userId || !user) {
      redirect("/sign-in");
    }

    const email = user.emailAddresses[0]?.emailAddress || "";
    const isHardcodedAdmin = ADMIN_EMAILS.includes(email);

    // Check user role from database using Prisma (bypasses RLS)
    let dbUser = null;
    try {
      dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true },
      });

      // AUTO-PROMOTION: If email is in admin list but role is not admin, FIX IT NOW
      if (isHardcodedAdmin && dbUser?.role !== "admin") {
        dbUser = await prisma.user.upsert({
          where: { clerkId: userId },
          update: { role: "admin" },
          create: { clerkId: userId, email, role: "admin" },
          select: { role: true }
        });
      }
    } catch (dbErr) {
      console.error("Admin Layout DB Error:", dbErr);
      // If DB fails but user is a hardcoded admin, let them through
      if (!isHardcodedAdmin) {
        redirect("/dashboard");
      }
    }

    if (!isHardcodedAdmin && (!dbUser || dbUser.role !== "admin")) {
      // If not admin, redirect to normal dashboard
      redirect("/dashboard");
    }

    return (
      <div className="min-h-screen bg-[#fdfbf7] text-stone-800 selection:bg-orange-200 flex flex-col font-sans">
        <AdminNavbar />

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
          {children}
        </main>
      </div>
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Critical Admin Layout Error:", error);
    redirect("/");
  }
}
