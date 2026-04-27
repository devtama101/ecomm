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
  let error: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
    const user = await currentUser();

    if (!userId || !user) {
      redirect("/sign-in");
    }

    const emails = user.emailAddresses.map(e => e.emailAddress.toLowerCase().trim());
    const isHardcodedAdmin = emails.some(email => ADMIN_EMAILS.map(a => a.toLowerCase().trim()).includes(email));

    // Check user role from database using Prisma (bypasses RLS)
    let dbUser = null;

    if (!isHardcodedAdmin) {
      redirect("/dashboard");
    }

    // Auto-promote if admin email but role is not admin
    try {
      const primaryEmail = emails[0] || "";
      await prisma.user.upsert({
        where: { clerkId: userId },
        update: { role: "admin" },
        create: {
          clerkId: userId,
          email: primaryEmail,
          role: "admin",
        },
      });
    } catch (e) {
      console.error("Auto-promotion failed in Users page:", e);
    }

    // Fetch all users using Prisma
    users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (err: any) {
    console.error("Admin Users Page Error:", err);
    if (err.message?.includes('NEXT_REDIRECT')) {
      throw err;
    }
    error = err.message || "An unknown error occurred while fetching users.";
    users = [];
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage and view all registered users</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
          Total Users: {users.length}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-1">Database Connection Error</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <p className="text-red-500 text-xs mt-2 italic">Note: This error usually occurs when the database pooler (Supavisor) is under heavy load or misconfigured.</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
