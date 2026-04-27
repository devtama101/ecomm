import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ADMIN_EMAILS } from "@/lib/constants";
import UserToggle from "./UserToggle";
import DeleteUserButton from "./DeleteUserButton";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  let userId: string | null = null;
  let users: any[] = [];

  try {
    const authResult = await auth();
    userId = authResult.userId;
    const user = await currentUser();

    if (!userId || !user) {
      redirect("/sign-in");
    }

    const email = user.emailAddresses[0]?.emailAddress || "";
    const isHardcodedAdmin = ADMIN_EMAILS.includes(email);

    // Double check admin role using Prisma (bypasses RLS)
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    });

    // AUTO-PROMOTION: Force admin role if email matches
    if (isHardcodedAdmin && dbUser?.role !== "admin") {
      dbUser = await prisma.user.upsert({
        where: { clerkId: userId },
        update: { role: "admin" },
        create: { clerkId: userId, email, role: "admin" },
        select: { role: true }
      });
    }

    if (!isHardcodedAdmin && (!dbUser || dbUser.role !== "admin")) {
      redirect("/dashboard");
    }

    // Fetch all users using Prisma
    users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Admin Users Page Error:", error);
    // Fallback UI or empty list
    users = [];
  }

  const currentUserId = userId; // To avoid closure issues if any

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tight">User Management</h1>
          <p className="text-stone-500 font-medium mt-2">Manage administrative access and user accounts.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-stone-50">
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-stone-400">User</th>
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-stone-400">Clerk ID</th>
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-stone-400">Role</th>
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-stone-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {users.map((user) => (
              <tr key={user.clerkId} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="font-bold text-stone-900">{user.email}</div>
                  <div className="text-xs text-stone-400 font-medium">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-8 py-6 text-sm font-mono text-stone-400">{user.clerkId}</td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    user.role === "admin" 
                      ? "bg-orange-100 text-orange-600" 
                      : "bg-stone-100 text-stone-500"
                  }`}>
                    {user.role === "admin" ? "admin" : "customer"}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <UserToggle 
                      clerkId={user.clerkId} 
                      currentRole={user.role} 
                      isSelf={user.clerkId === userId}
                    />
                    <DeleteUserButton 
                      clerkId={user.clerkId} 
                      userEmail={user.email} 
                      isSelf={user.clerkId === userId} 
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
}
