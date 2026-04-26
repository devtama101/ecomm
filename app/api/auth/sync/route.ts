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

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Upsert user in our database using Supabase
    const { error: syncError } = await supabase
      .from("User")
      .upsert(
        { clerkId: userId, email, role: "user" },
        { onConflict: "clerkId" }
      );

    if (syncError) throw syncError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
 