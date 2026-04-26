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

    const email = user.emailAddresses[0].emailAddress;

    // Upsert user in our database
    await prisma.user.upsert({
      where: { clerkId: userId },
      update: { email },
      create: {
        clerkId: userId,
        email,
        role: "user",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
