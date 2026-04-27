import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_EMAILS } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const emails = user.emailAddresses.map(e => e.emailAddress.toLowerCase().trim());
    const isHardcodedAdmin = emails.some(email => ADMIN_EMAILS.map(a => a.toLowerCase().trim()).includes(email));
    const targetRole = isHardcodedAdmin ? 'admin' : 'user';

    // Check if user exists to preserve role (unless promoting to admin)
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    });

    const primaryEmail = emails[0] || "";
    await prisma.user.upsert({
      where: { clerkId: userId },
      update: { 
        email: primaryEmail, 
        role: isHardcodedAdmin ? 'admin' : (existingUser?.role || 'user')
      },
      create: {
        clerkId: userId,
        email: primaryEmail,
        role: targetRole
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
 