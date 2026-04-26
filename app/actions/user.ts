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
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    // Check if current user is admin
    const { data: dbUser } = await supabase
      .from("User")
      .select("role")
      .eq("clerkId", userId)
      .single();

    if (!dbUser || dbUser.role !== "admin") {
      return { success: false, message: "Only admins can manage roles" };
    }

    // Prevent demoting yourself
    if (clerkId === userId) {
      return { success: false, message: "You cannot change your own role" };
    }

    const newRole = currentRole === "admin" ? "user" : "admin";

    const { error } = await supabase
      .from("User")
      .update({ role: newRole })
      .eq("clerkId", clerkId);

    if (error) throw error;

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    console.error("[Admin] toggleUserRole error:", err);
    return { success: false, message: err.message || "Failed to toggle role" };
  }
}

export async function deleteUser(clerkId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    // Check if current user is admin
    const { data: adminUser } = await supabase
      .from("User")
      .select("role")
      .eq("clerkId", userId)
      .single();

    if (!adminUser || adminUser.role !== "admin") {
      return { success: false, message: "Only admins can delete users" };
    }

    // Prevent deleting yourself
    if (clerkId === userId) {
      return { success: false, message: "You cannot delete yourself" };
    }

    console.log(`[Admin] Attempting to delete user: ${clerkId}`);
    
    // 1. Delete from Clerk
    try {
      await clerk.users.deleteUser(clerkId);
      console.log(`[Admin] Successfully deleted user from Clerk: ${clerkId}`);
    } catch (clerkErr: any) {
      console.error(`[Admin] Clerk deletion error for ${clerkId}:`, clerkErr);
      // Continue even if Clerk fails (e.g. user already deleted in Clerk)
    }

    // 2. Delete from our DB
    const { error } = await supabase
      .from("User")
      .delete()
      .eq("clerkId", clerkId);

    if (error) {
      console.error(`[Admin] Supabase error deleting user ${clerkId}:`, error);
      throw error;
    }
    
    console.log(`[Admin] Successfully deleted user from DB: ${clerkId}`);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Error in deleteUser action:", error);
    return { success: false, message: error.message || "Failed to delete user" };
  }
}
