import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import UserToggle from "./UserToggle";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AdminUsersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Double check admin role
  const { data: adminCheck } = await supabase
    .from("User")
    .select("role")
    .eq("clerkId", userId)
    .single();

  if (!adminCheck || adminCheck.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch all users
  const { data: users } = await supabase
    .from("User")
    .select("*")
    .order("createdAt", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tight">User Management</h1>
          <p className="text-stone-500 font-medium mt-2">Manage administrative access and user accounts.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-50">
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-stone-400">User</th>
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-stone-400">Clerk ID</th>
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-stone-400">Role</th>
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-stone-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {users?.map((user) => (
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
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <UserToggle 
                    clerkId={user.clerkId} 
                    currentRole={user.role} 
                    isSelf={user.clerkId === userId}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
