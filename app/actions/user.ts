"use server";

import { createClient } from "@supabase/supabase-js";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

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

export async function deleteUser(clerkId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Check if current user is admin
  const { data: adminUser } = await supabase
    .from("User")
    .select("role")
    .eq("clerkId", userId)
    .single();

  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Only admins can delete users");
  }

  // Prevent deleting yourself
  if (clerkId === userId) {
    throw new Error("You cannot delete yourself");
  }

  try {
    // 1. Delete from Clerk
    await clerk.users.deleteUser(clerkId);

    // 2. Delete from our DB
    const { error } = await supabase
      .from("User")
      .delete()
      .eq("clerkId", clerkId);

    if (error) throw error;

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    throw new Error(error.message || "Failed to delete user");
  }
}
