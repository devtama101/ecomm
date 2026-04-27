import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress || "";
    if (!email) {
      return NextResponse.json({ message: "Email not found" }, { status: 400 });
    }

    const adminEmails = ['pro.taufikur@gmail.com', 'dev.tama101@gmail.com'];
    const targetRole = adminEmails.includes(email) ? 'admin' : 'user';

    // Check if user exists to preserve role (unless promoting to admin)
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    });

    await prisma.user.upsert({
      where: { clerkId: userId },
      update: { 
        email, 
        role: adminEmails.includes(email) ? 'admin' : (existingUser?.role || 'user')
      },
      create: {
        clerkId: userId,
        email,
        role: targetRole
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
 