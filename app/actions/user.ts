"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function toggleUserRole(clerkId: string, currentRole: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Check if current user is admin
  const { data: dbUser } = await supabase
    .from("User")
    .select("role")
    .eq("clerkId", userId)
    .single();

  if (!dbUser || dbUser.role !== "admin") {
    throw new Error("Only admins can manage roles");
  }

  // Prevent demoting yourself to avoid locking yourself out
  if (clerkId === userId) {
    throw new Error("You cannot change your own role");
  }

  const newRole = currentRole === "admin" ? "user" : "admin";

  const { error } = await supabase
    .from("User")
    .update({ role: newRole })
    .eq("clerkId", clerkId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  return { success: true };
}
